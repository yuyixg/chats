import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianFanMessage } from '@/types/chat';
import { QianFanStream, SteamResult } from '@/services/qianfan';
import { ChatMessageManager, ChatModelManager, UserModelManager } from '@/managers';
import { getSession } from '@/utils/session';
import { internalServerError, modelUnauthorized } from '@/utils/error';

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

    const enabledModels = await ChatModelManager.findModels();

    if (!enabledModels.find((x) => x.id === model.modelId)) {
      return modelUnauthorized(res);
    }

    const chatModel = await UserModelManager.findUserModel(
      userId,
      model.modelId
    );
    if (!chatModel) {
      return modelUnauthorized(res);
    }

    const chatMessages = await ChatMessageManager.findUserMessageById(
      messageId,
      userId
    );

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
      let result = {} as SteamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value) as SteamResult;
            assistantMessage += result.text;
          }
          if (done) {
            const tokenCount = result.usage.total_tokens;
            messages.push({
              role: 'assistant',
              content: { text: assistantMessage },
            });
            if (chatMessages) {
              await ChatMessageManager.updateMessageById(
                chatMessages.id!,
                messages,
                tokenCount + chatMessages.tokenCount,
                chatMessages.chatCount + 1
              );
            } else {
              await ChatMessageManager.createMessage({
                id: messageId,
                messages,
                modelId: chatModel.id!,
                userId: userId,
                prompt: model.systemPrompt,
                tokenCount,
                chatCount: 1,
              });
            }
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
