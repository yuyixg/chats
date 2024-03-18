import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianFanMessage } from '@/types/chat';
import { QianFanStream, QianFanSteamResult } from '@/services/qianfan';
import {
  ChatMessageManager,
  ChatModelManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';
import {
  badRequest,
  internalServerError,
  modelUnauthorized,
} from '@/utils/error';
import { verifyModel } from '@/utils/model';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      return modelUnauthorized(res);
    }
    const { userId } = session;
    const { model, messages, messageId } = req.body as ChatBody;

    const chatModel = await ChatModelManager.findModelById(model.modelId);
    if (!chatModel?.enable) {
      return modelUnauthorized(res);
    }

    const userModel = await UserModelManager.findUserModel(
      userId,
      model.modelId
    );
    if (!userModel || !userModel.enable) {
      return modelUnauthorized(res);
    }

    const verifyMessage = verifyModel(userModel, chatModel.modelConfig);
    if (verifyMessage) {
      return badRequest(res, verifyMessage);
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
            const tokenCount = result.usage.total_tokens;
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
              '',
              chatModel,
              userModel
            );
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
}
