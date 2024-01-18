import { QianWenMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Model } from '@/types/model';

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
      Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      'X-DashScope-SSE': 'enable',
    },
    method: 'POST',
    body: JSON.stringify({
      model: model.modelId,
      input: {
        messages: [
          {
            role: 'system',
            content: [
              {
                text: '你是智能AI助理,可以帮用户识别图像,并仔细遵循用户的问题,使用markdown回复。',
              },
            ],
          },
          ...messages,
        ],
      },
      parameters: {
        seed: 1646251034,
        incremental_output: true,
      },
    }),
  };
  const res = await fetch(url, body);
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    let errors = {} as any;
    errors = await res.json();
    throw new Error(errors);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
          try {
            const json = JSON.parse(data);
            if (json?.code) {
              throw new Error(json);
            }
            if (json.output?.finish_reason === 'stop') {
              controller.close();
              return;
            }
            const text =
              (json.output.choices.length > 0 &&
                json.output.choices[0].message?.content.length > 0 &&
                json.output.choices[0].message?.content[0].text) ||
              '';
            controller.enqueue(text);
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
