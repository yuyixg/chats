import type { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  GPT4VisionContent,
} from '@/types/chat';
import { ModelVersions } from '@/types/model';
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
import { KimiSteamResult, KimiStream } from '@/services/kimi';

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

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = chatModel.modelConfig.prompt;
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
            console.log('result \n', result);
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
};

export default handler;
