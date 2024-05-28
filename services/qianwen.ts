import { QianWenMessage } from '@/types/chat';
import { ChatModels } from '@/types/chatModel';
import { ModelVersions } from '@/types/model';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export const QianWenStream = async (
  chatModel: ChatModels,
  temperature: number,
  messages: QianWenMessage[],
  enableSearch: boolean = false
) => {
  const {
    apiConfig: { host, apiKey },
    modelVersion,
    modelConfig: { version },
  } = chatModel;
  let url = `${host}/services/aigc/${
    modelVersion === ModelVersions.QWen ? 'text' : 'multimodal'
  }-generation/generation`;
  const body = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-DashScope-SSE': 'enable',
    },
    method: 'POST',
    body: JSON.stringify({
      model: version,
      input: {
        messages: messages,
      },
      parameters: {
        ...(modelVersion === ModelVersions.QWen && {
          enable_search: enableSearch,
        }),
        temperature,
        seed: Math.floor(Math.random() * 2147483647),
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
            if (modelVersion === ModelVersions.QWen) {
              const text = json.output.text;
              const { input_tokens, output_tokens, image_tokens } =
                json?.usage || {};
              controller.enqueue(
                JSON.stringify({
                  text,
                  usage: {
                    inputTokens: input_tokens,
                    outputTokens: output_tokens,
                    totalTokens:
                      +(input_tokens || 0) +
                      +(output_tokens || 0) +
                      +(image_tokens || 0),
                  },
                })
              );
              if (json.output.finish_reason === 'stop') {
                controller.close();
                return;
              }
            } else {
              if (json.output.choices.length > 0) {
                const text =
                  (json.output.choices[0].message?.content.length > 0 &&
                    json.output.choices[0].message?.content[0].text) ||
                  '';
                const { input_tokens, output_tokens, image_tokens } =
                  json?.usage || {};
                controller.enqueue(
                  JSON.stringify({
                    text,
                    usage: {
                      inputTokens: input_tokens,
                      outputTokens: output_tokens,
                      totalTokens:
                        +(input_tokens || 0) +
                        +(output_tokens || 0) +
                        +(image_tokens || 0),
                    },
                  })
                );
                if (json.output.choices[0].finish_reason === 'stop') {
                  controller.close();
                  return;
                }
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
