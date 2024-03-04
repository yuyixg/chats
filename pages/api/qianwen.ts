import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenStream, Tokenizer } from '@/services/qianwen';
import { ChatMessages } from '@/models';
import { ChatMessageManager, UserModelManager } from '@/managers';
import { getSession } from '@/utils/session';

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
      res.status(401).end();
      return;
    }
    const { userId } = session;
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;

    const chatModel = await UserModelManager.findUserModel(
      userId,
      model.modelId
    );
    if (!chatModel) {
      res.status(400).send(
        JSON.stringify({
          messages: 'The Model does not exist or access is denied.',
        })
      );
      return;
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
