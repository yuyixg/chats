import { GPT4Message, GPT4VisionMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { ModelVersions } from '@/types/model';
import { ChatModels } from '@/types/chatModel';

export interface LingYiSteamResult {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const LingYiStream = async (
  chatModel: ChatModels,
  temperature: number,
  messages: GPT4Message[] | GPT4VisionMessage[]
) => {
  const {
    apiConfig: { host, apiKey },
    modelVersion,
  } = chatModel;
  let url = `${host}/v1/chat/completions`;

  const body = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: modelVersion,
      messages: messages,
      ...(modelVersion === ModelVersions.yi_vl_plus
        ? { max_tokens: 4096 }
        : {}),
      stream: true,
      temperature,
    }),
  };

  const res = await fetch(url, body);

  const contentType = res.headers.get('content-type');
  const decoder = new TextDecoder();
  if (res.status !== 200) {
    let errors = {} as any;
    if (contentType?.includes('application/json')) {
      errors = await res.json();
    } else if (contentType?.startsWith('text/event-stream')) {
      errors = await res.body;
    }
    throw new Error(JSON.stringify(errors));
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          let data = event.data;
          if (data === '[DONE]') {
            return;
          } else {
            const json = JSON.parse(data);
            const text =
              (json.choices.length > 0 && json.choices[0].delta?.content) || '';
            const { prompt_tokens, completion_tokens, total_tokens } =
              json?.usage || {};
            controller.enqueue(
              JSON.stringify({
                text,
                usage: {
                  promptTokens: prompt_tokens,
                  completionTokens: completion_tokens,
                  totalTokens: total_tokens,
                },
              })
            );
            if (json.choices[0]?.finish_reason === 'stop') {
              controller.close();
              return;
            }
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
