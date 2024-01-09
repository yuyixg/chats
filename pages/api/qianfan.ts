import { Message, QFMessage } from '@/types/chat';
import { Model } from '@/types/model';
import { QIANFAN_API_KEY, QIANFAN_SECRET_KEY } from '@/utils/app/const';
import { QFClient } from '@/utils/qianfan/client';
import { IChatMessage, Models } from '@/utils/qianfan/type';
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

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
  let client = new QFClient(QIANFAN_API_KEY, QIANFAN_SECRET_KEY);
  await client.createAuthTokenAsync();
  let messageToSend: IChatMessage[] = [];
  messageToSend = messages.map((message) => {
    return {
      role: message.role,
      content: message.content.text,
    } as IChatMessage;
  });
  console.log('Send messages \n', messageToSend);
  let res = await client.chatAsStreamAsync(model.id as Models, messageToSend, {
    request_timeout: 60000,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
          try {
            const json = JSON.parse(data);
            const text = json.result;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            if (json.is_end) {
              controller.close();
              return;
            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
}
