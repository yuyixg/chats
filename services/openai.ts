import { GPT4Message, GPT4VisionMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { ModelIds } from '@/types/model';
import { ChatModels } from '@/models';

export const OpenAIStream = async (
  chatModel: ChatModels,
  systemPrompt: string,
  temperature: number,
  messages: GPT4Message[] | GPT4VisionMessage[]
) => {
  const { modelId, apiHost, apiType, apiVersion, apiKey, apiOrganization } =
    chatModel;
  let url = `${apiHost}/v1/chat/completions`;
  if (apiType === 'azure') {
    const host = apiHost;
    url = `${host}/openai/deployments/${modelId.replaceAll(
      '.',
      ''
    )}/chat/completions?api-version=${apiVersion}`;
  }
  const body = {
    headers: {
      'Content-Type': 'application/json',
      ...(apiType === 'openai' && {
        Authorization: `Bearer ${apiKey}`,
      }),
      ...(apiType === 'azure' && {
        'api-key': apiKey,
      }),
      ...(apiType === 'openai' &&
        apiOrganization && {
          'OpenAI-Organization': apiOrganization,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(apiType === 'openai' && { model: modelId }),
      messages: [
        {
          role: 'system',
          content:
            systemPrompt ||
            "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        },
        ...messages,
      ],
      ...(modelId === ModelIds.GPT_4_Vision ? { max_tokens: 4096 } : {}),
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
