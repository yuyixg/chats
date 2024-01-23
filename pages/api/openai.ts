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
import { ModelIds } from '@/types/model';
import { ChatMessages, ChatModels } from '@/models';

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
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;
    const chatModel = await ChatModels.findOne({
      where: { modelId: model.modelId },
    });

    const userId = '5fec360a-4f32-49b6-bb93-d36c8ca2b9e1';

    if (chatModel === null) {
      throw 'Model is not Found!';
    }

    const chatMessages = await ChatMessages.findOne({
      where: {
        id: messageId,
        userId: userId,
      },
    });

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = chatModel.systemPrompt;
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
      const tokens = encoding.encode(message.content.text!);
      if (tokenCount + tokens.length + 1000 > chatModel.tokenLimit!) {
        break;
      }
      tokenCount += tokens.length;
    }

    if (chatModel.modelId === ModelIds.GPT_4_Vision) {
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
            var tokens = encoding.encode(assistantMessage);
            tokenCount += tokens.length;
            encoding.free();
            messages.push({
              role: 'assistant',
              content: { text: assistantMessage },
            });
            if (chatMessages) {
              await ChatMessages.update(
                {
                  messages,
                  tokenCount: tokenCount + chatMessages.tokenCount,
                  chatCount: chatMessages.chatCount + 1,
                },
                {
                  where: {
                    id: chatMessages.id,
                    userId: userId,
                  },
                }
              );
            } else {
              await ChatMessages.create({
                id: messageId,
                messages,
                modelId: chatModel.id!,
                name: messages[0].content.text!.substring(0, 30),
                userId: userId,
                prompt: promptToSend,
                tokenCount,
                chatCount: 1,
              });
            }
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      };

      streamResponse().catch((error) => {
        console.error(error);
        res.status(500).end();
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export default handler;
