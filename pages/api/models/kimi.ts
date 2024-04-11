import type { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import { ChatBody, GPT4Message, GPT4VisionMessage } from '@/types/chat';
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
import { KimiSteamResult, KimiStream } from '@/services/kimi';
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
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;

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

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = modelConfig.prompt;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    let messagesToSend: GPT4Message[] | GPT4VisionMessage[] = [];

    messagesToSend = messages.map((message) => {
      return {
        role: message.role,
        content: message.content.text,
      } as GPT4Message;
    });

    const stream = await KimiStream(
      chatModel,
      promptToSend,
      temperatureToUse,
      messagesToSend
    );
    let assistantMessage = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as KimiSteamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value) as KimiSteamResult;
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
