import { Message, QianFanMessage } from '@/types/chat';
import { Model } from '@/types/model';
import { QianFanStream } from '@/utils/server/qianfan';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  const body = await req.json();
  const { model, messages } = body as {
    model: Model;
    messages: Message[];
    uid: string;
    parameters: object;
  };

  let messageToSend: QianFanMessage[] = [];
  messageToSend = messages.map((message) => {
    return {
      role: message.role,
      content: message.content.text,
    } as QianFanMessage;
  });

  const stream = await QianFanStream(model, messageToSend, {
    temperature: 0.8,
    top_p: 0.7,
    penalty_socre: 1,
    user_id: undefined,
    request_timeout: 60000,
  });

  return new Response(stream);
}
