import { GPT4Message, GPT4VisionMessage } from '@/types/chat';
import { ChatModels } from '@/types/chatModel';
import { ModelProviders, ModelVersions } from '@/types/model';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export const OpenAIStream = async (
  chatModel: ChatModels,
  temperature: number,
  messages: GPT4Message[] | GPT4VisionMessage[]
) => {
  const {
    apiConfig: { host, apiKey },
    modelVersion,
    modelProvider,
    modelConfig: { version, organization, deploymentName },
  } = chatModel;
  let url = `${host}/v1/chat/completions`;
  if (modelProvider === ModelProviders.Azure) {
    const apiHost = host;
    url = `${apiHost}/openai/deployments/${
      deploymentName ? deploymentName : modelVersion.replaceAll('.', '')
    }/chat/completions?api-version=${version}`;
  }
  const body = {
    headers: {
      'Content-Type': 'application/json',
      ...(modelProvider === ModelProviders.OpenAI && {
        Authorization: `Bearer ${apiKey}`,
      }),
      ...(modelProvider === ModelProviders.Azure && {
        'api-key': apiKey,
      }),
      ...(modelProvider === ModelProviders.OpenAI &&
        organization && {
          'OpenAI-Organization': organization,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(modelProvider === ModelProviders.OpenAI && {
        model: deploymentName || modelVersion,
      }),
      messages: messages,
      ...(modelVersion === ModelVersions.GPT_4_Vision && { max_tokens: 4096 }),
      temperature,
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
