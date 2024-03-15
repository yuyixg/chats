import { GPT4Message, GPT4VisionMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { ModelVersions } from '@/types/model';
import { ChatModels } from '@/dbs';

export const OpenAIStream = async (
  chatModel: ChatModels,
  prompt: string,
  temperature: number,
  messages: GPT4Message[] | GPT4VisionMessage[]
) => {
  const {
    apiConfig: { host, type, version, apiKey, organization },
    modelVersion,
    modelConfig: { prompt: systemPrompt },
  } = chatModel;
  let url = `${host}/v1/chat/completions`;
  if (type === 'azure') {
    const apiHost = host;
    url = `${apiHost}/openai/deployments/${modelVersion.replaceAll(
      '.',
      ''
    )}/chat/completions?api-version=${version}`;
  }
  const body = {
    headers: {
      'Content-Type': 'application/json',
      ...(type === 'openai' && {
        Authorization: `Bearer ${apiKey}`,
      }),
      ...(type === 'azure' && {
        'api-key': apiKey,
      }),
      ...(type === 'openai' &&
        organization && {
          'OpenAI-Organization': organization,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(type === 'openai' && { model: modelVersion }),
      messages: [
        {
          role: 'system',
          content: prompt || systemPrompt,
        },
        ...messages,
      ],
      ...(modelVersion === ModelVersions.GPT_4_Vision
        ? { max_tokens: 4096 }
        : {}),
      temperature: temperature,
      stream: true,
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
            if (
              json.choices[0]?.finish_details != null ||
              json.choices[0]?.finish_reason != null
            ) {
              controller.close();
              return;
            }
            const text =
              (json.choices.length > 0 && json.choices[0].delta?.content) || '';
            controller.enqueue(text);
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
