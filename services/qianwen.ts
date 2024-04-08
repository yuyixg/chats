import { QianWenMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';


export interface QianWenStreamResult {
  text: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    image_tokens: number;
  };
}

export const QianWenStream = async (
  chatModel: any,
  prompt: string,
  temperature: number,
  messages: QianWenMessage[]
) => {
  const {
    apiConfig: { host, apiKey },
    modelVersion,
    modelConfig: { prompt: systemPrompt },
  } = chatModel;
  let url = `${host}/services/aigc/multimodal-generation/generation`;
  const body = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-DashScope-SSE': 'enable',
    },
    method: 'POST',
    body: JSON.stringify({
      model: modelVersion,
      input: {
        messages: [
          {
            role: 'system',
            content: [
              {
                text: prompt || systemPrompt,
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
    throw new Error(JSON.stringify(errors));
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
          try {
            const json = JSON.parse(data);
            if (json?.code) {
              throw new Error(JSON.stringify(json));
            }
            if (json.output?.choices.length > 0) {
              const text =
                (json.output.choices[0].message?.content.length > 0 &&
                  json.output.choices[0].message?.content[0].text) ||
                '';
              controller.enqueue(
                JSON.stringify({
                  text,
                  usage: json.usage,
                })
              );
              if (json.output?.choices[0]?.finish_reason === 'stop') {
                controller.close();
                return;
              }
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
  return stream;
};