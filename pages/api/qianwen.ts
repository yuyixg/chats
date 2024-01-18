import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenStream } from '@/services/qianwen';

export const config = {
  // runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { model, messages, prompt, temperature } = req.body as ChatBody;

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

    console.log('Send messages \n', messagesToSend);

    const stream = await QianWenStream(
      model,
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
  } finally {
  }
};

export default handler;
