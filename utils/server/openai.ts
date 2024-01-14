import { GPT4Message, GPT4VisionMessage } from '@/types/chat';

import {
  OPENAI_API_HOST,
  OPENAI_API_HOST_VISION,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Model, ModelIds } from '@/types/model';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: Model,
  systemPrompt: string,
  temperature: number,
  messages: GPT4Message[] | GPT4VisionMessage[]
) => {
  let url = `${OPENAI_API_HOST}/v1/chat/completions`;
  if (OPENAI_API_TYPE === 'azure') {
    const host =
      model.id === ModelIds.GPT_4_Vision
        ? OPENAI_API_HOST_VISION
        : OPENAI_API_HOST;
    url = `${host}/openai/deployments/${model.id.replaceAll(
      '.',
      ''
    )}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  }
  const body = {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'azure' && {
        'api-key':
          model.id === ModelIds.GPT_4_Vision
            ? `${process.env.OPENAI_API_KEY_VISION}`
            : `${process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'openai' &&
        OPENAI_ORGANIZATION && {
          'OpenAI-Organization': OPENAI_ORGANIZATION,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === 'openai' && { model: model.id }),
      messages: [
        {
          role: 'system',
          content:
            systemPrompt ||
            "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        },
        ...messages,
      ],
      ...(model.id === ModelIds.GPT_4_Vision ? { max_tokens: 4096 } : {}),
      temperature: temperature,
      stream: true,
    }),
  };
  const res = await fetch(url, body);
  const contentType = res.headers.get('content-type');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  if (res.status !== 200) {
    console.log('error body', body);
    let result = {} as any;
    if (contentType?.includes('application/json')) {
      result = await res.json();
    } else if (contentType?.startsWith('text/event-stream')) {
      result = await res.body;
    }
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result) ||
          decoder.decode(result?.value) ||
          result.statusText
        }`
      );
    }
  }
  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            if (data === '[DONE]') {
              return;
            } else {
              const json = JSON.parse(data);
              if (
                json.choices[0]?.finish_details != null ||
                json.choices[0]?.finish_reason != null
              ) {
                controller.close();
                return;
              }
              const text =
                (json.choices.length > 0 && json.choices[0].delta?.content) ||
                '';
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        console.log('chunk', decoder.decode(chunk));
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
};
