import type { NextApiRequest, NextApiResponse } from 'next';
import { Message, QianFanMessage } from '@/types/chat';
import { Model } from '@/types/model';
import { QianFanStream } from '@/services/qianfan';
import { ChatModels } from '@/models';

export const config = {
  // runtime: 'edge',
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
    const { model, messages } = req.body as {
      model: Model;
      messages: Message[];
      uid: string;
      parameters: object;
    };

    const chatModel = await ChatModels.findOne({
      where: { modelId: model.modelId },
    });

    if (!chatModel) {
      return;
    }

    let messageToSend: QianFanMessage[] = [];
    messageToSend = messages.map((message) => {
      return {
        role: message.role,
        content: message.content.text,
      } as QianFanMessage;
    });

    const stream = await QianFanStream(chatModel, messageToSend, {
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
}
