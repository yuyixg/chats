import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianFanMessage } from '@/types/chat';
import { QianFanStream, Tokenizer } from '@/services/qianfan';
import { ChatMessages, ChatModels } from '@/models';
import { ChatMessageManager, ChatModelManager } from '@/managers';

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
    const { model, messages, messageId } = req.body as ChatBody;

    const chatModel = await ChatModelManager.findModelById(model.modelId);

    const userId = '5fec360a-4f32-49b6-bb93-d36c8ca2b9e1';

    if (chatModel === null) {
      throw 'Model is not Found!';
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
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            assistantMessage += value;
          }
          if (done) {
            messages.push({
              role: 'assistant',
              content: { text: assistantMessage },
            });
            const tokenCount = await Tokenizer(chatModel, messagesToSend);
            if (chatMessages) {
              await ChatMessageManager.updateMessageById(
                chatMessages.id!,
                messages,
                tokenCount + chatMessages.tokenCount,
                chatMessages.chatCount + 1
              );
            } else {
              await ChatMessages.create({
                id: messageId,
                messages,
                modelId: chatModel.id!,
                name: messages[0].content.text!.substring(0, 30),
                userId: userId,
                prompt: model.systemPrompt,
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
}
