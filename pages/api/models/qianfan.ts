import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianFanMessage } from '@/types/chat';
import { QianFanStream, QianFanSteamResult } from '@/services/qianfan';
import {
  ChatMessageManager,
  ChatModelManager,
  UserBalancesManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';
import {
  BadRequest,
  InternalServerError,
  ModelUnauthorized,
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
      throw new ModelUnauthorized();
    }
    const { userId } = session;
    const { model, messages, messageId } = req.body as ChatBody;

    const chatModel = await ChatModelManager.findModelById(model.id);
    if (!chatModel?.enabled) {
      throw new ModelUnauthorized();
    }

    const { modelConfig, priceConfig } = chatModel;

    const userModel = await UserModelManager.findUserModel(userId, model.id);
    if (!userModel || !userModel.enabled) {
      throw new ModelUnauthorized();
    }

    const verifyMessage = verifyModel(userModel, modelConfig);
    if (verifyMessage) {
      throw new BadRequest(verifyMessage);
    }

    let messagesToSend: QianFanMessage[] = [];
    messagesToSend = messages.map((message) => {
      return {
        role: message.role,
        content: message.content.text,
      } as QianFanMessage;
    });

    const stream = await QianFanStream(chatModel, messagesToSend, {
      temperature: 0.8,
      top_p: 0.7,
      penalty_socre: 1,
      user_id: undefined,
      request_timeout: 60000,
    });

    let assistantMessage = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as QianFanSteamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value) as QianFanSteamResult;
            assistantMessage += result.text;
          }
          if (done) {
            const { total_tokens, prompt_tokens, completion_tokens } =
              result.usage;
            const tokenCount = total_tokens;
            const totalPrice = calcTokenPrice(
              priceConfig,
              prompt_tokens,
              completion_tokens
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
              chatModel.id!
            );
            await UserBalancesManager.chatUpdateBalance(userId, totalPrice);
            return res.end();
          }
          res.write(Buffer.from(result.text));
        }
      };

      streamResponse().catch((error) => {
        throw new InternalServerError(
          JSON.stringify({ message: error?.message, stack: error?.stack })
        );
      });
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
