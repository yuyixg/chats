import { QianWenMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Model } from '@/types/model';

export class QianWenError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'QianWenError';
    this.code = code;
  }
}

export const QianWenStream = async (
  model: Model,
  systemPrompt: string,
  temperature: number,
  messages: QianWenMessage[]
) => {
  let url = `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`;
  const body = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.QIANWEN_VL_API_KEY}`,
      Accept: 'text/event-stream',
    },
    method: 'POST',
    body: JSON.stringify({
      model: model.id,
      input: {
        messages: [
          // {
          //   role: 'assistant',
          //   content: 'You are a helpful assistant. Respond using markdown.',
          // },
          ...messages,
        ],
      },
      parameters: {
        top_p: 0.8,
        top_k: 50,
        seed: 1234,
      },
    }),
  };
  console.log('body', body);
  const res = await fetch(url, body);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  console.log('status', res.status);
  if (res.status !== 200) {
    let result = {} as any;
    result = await res.json();
    console.log('result', result);
    if (result.code) {
      throw new QianWenError(result.message, result.code);
    }
  }
  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
          try {
            console.log('data', data);
            const json = JSON.parse(data);
            console.log('json', json);
            if (json.output?.finish_reason === 'stop') {
              controller.close();
              return;
            }
            const text =
              (json.output.choices.length > 0 &&
                json.choices[0].message?.content) ||
              '';
            const queue = encoder.encode(text);
            controller.enqueue(queue);
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
  return stream;
};
