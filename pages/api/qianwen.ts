import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenStream, Tokenizer } from '@/services/qianwen';
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
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;

    const chatModel = await ChatModelManager.findModelById(model.modelId);

    const userId = '5fec360a-4f32-49b6-bb93-d36c8ca2b9e1';

    if (chatModel === null) {
      throw 'Model is not Found!';
    }

    const chatMessages = await ChatMessageManager.findUserMessageById(
      messageId,
      userId
    );

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
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            assistantMessage += value;
          }
          if (done) {
            const tokenMessages = messages.map((x) => {
              return { role: x.role, content: x.content.text }; 
            });
            const tokenCount = await Tokenizer(
              chatModel,
              tokenMessages,
              prompt
            );
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
};

export default handler;
