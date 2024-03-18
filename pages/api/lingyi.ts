import type { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import { LingYiStream, LingYiSteamResult } from '@/services/lingyi';
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

    if (chatModel.modelVersion === ModelVersions.yi_vl_plus) {
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

    const stream = await LingYiStream(
      chatModel,
      promptToSend,
      temperatureToUse,
      messagesToSend
    );
    let assistantMessage = '';
    res.setHeader('Content-Type', 'application/octet-stream');
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as LingYiSteamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value) as LingYiSteamResult;
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
