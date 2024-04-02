import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenStream, QianWenStreamResult } from '@/services/qianwen';
import {
  ChatMessageManager,
  ChatModelManager,
  UserBalancesManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';
import {
  badRequest,
  internalServerError,
  modelUnauthorized,
} from '@/utils/error';
import { verifyModel } from '@/utils/model';
import { calcTokenPrice } from '@/utils/message';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      return modelUnauthorized(res);
    }
    const { userId } = session;
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;

    const chatModel = await ChatModelManager.findModelById(model.id);
    if (!chatModel?.enabled) {
      return modelUnauthorized(res);
    }

    const { modelConfig, priceConfig } = chatModel;

    const userModel = await UserModelManager.findUserModel(userId, model.id);
    if (!userModel || !userModel.enabled) {
      return modelUnauthorized(res);
    }

    const verifyMessage = verifyModel(userModel, modelConfig);
    if (verifyMessage) {
      return badRequest(res, verifyMessage);
    }

    let messagesToSend: QianWenMessage[] = [];

    messagesToSend = messages.map((message) => {
      const messageContent = message.content;
      let content = [] as QianWenContent[];
      if (messageContent?.image) {
        messageContent.image.forEach((url) => {
          content.push({
            image: url,
          });
        });
      }
      if (messageContent?.text) {
        content.push({ text: messageContent.text });
      }

      return { role: message.role, content };
    });

    const stream = await QianWenStream(
      chatModel,
      prompt,
      temperature,
      messagesToSend
    );

    let assistantMessage = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as QianWenStreamResult;
      let tokenCount = 0;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value);
            assistantMessage += result.text;
          }
          if (done) {
            const { input_tokens, output_tokens, image_tokens } = result.usage;
            tokenCount += input_tokens + (image_tokens || 0) + output_tokens;
            const totalPrice = calcTokenPrice(
              priceConfig,
              input_tokens + image_tokens,
              output_tokens
            );
            messages.push({
              role: 'assistant',
              content: { text: assistantMessage },
            });
            await ChatMessageManager.recordChat(
              messageId,
              userId,
              userModel.id!,
              messages,
              tokenCount,
              totalPrice,
              '',
              chatModel.id!,
            );
            await UserBalancesManager.updateBalance(userId, totalPrice);
            res.end();
            break;
          }
          res.write(Buffer.from(result.text));
        }
      };

      streamResponse().catch((error) => {
        console.error(error);
        return internalServerError(res);
      });
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
