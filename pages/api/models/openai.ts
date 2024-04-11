import type { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import { OpenAIStream } from '@/services/openai';
import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  GPT4VisionContent,
} from '@/types/chat';
import { get_encoding } from 'tiktoken';
import { ModelVersions } from '@/types/model';
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
import { apiHandler } from '@/middleware/api-handler';

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

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = modelConfig.prompt;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const encoding = get_encoding('cl100k_base');

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: GPT4Message[] | GPT4VisionMessage[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const sendTokens = encoding.encode(message.content.text!);
      if (tokenCount + sendTokens.length + 1000 > modelConfig.tokenLimit!) {
        break;
      }
      tokenCount += sendTokens.length;
    }

    if (chatModel.modelVersion === ModelVersions.GPT_4_Vision) {
      messagesToSend = messages.map((message) => {
        const messageContent = message.content;
        let content = [] as GPT4VisionContent[];
        if (messageContent?.image) {
          messageContent.image.forEach((url) => {
            content.push({
              type: 'image_url',
              image_url: { url },
            });
          });
        }
        if (messageContent?.text) {
          content.push({ type: 'text', text: messageContent.text });
        }
        return { role: message.role, content };
      });
    } else {
      messagesToSend = messages.map((message) => {
        return {
          role: message.role,
          content: message.content.text,
        } as GPT4Message;
      });
    }

    const stream = await OpenAIStream(
      chatModel,
      promptToSend,
      temperatureToUse,
      messagesToSend
    );
    let assistantMessage = '';
    res.setHeader('Content-Type', 'application/octet-stream');
    if (stream.getReader) {
      const reader = stream.getReader();
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            assistantMessage += value;
          }
          if (done) {
            let messageTokens = encoding.encode(assistantMessage).length;
            tokenCount += messageTokens;
            const totalPrice = calcTokenPrice(
              priceConfig,
              tokenCount,
              messageTokens
            );
            encoding.free();
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
              promptToSend,
              chatModel.id!
            );
            await UserBalancesManager.chatUpdateBalance(userId, totalPrice);
            return res.end();
          }
          res.write(Buffer.from(value));
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

export default apiHandler(handler);
