import { Client } from 'tencentcloud-sdk-nodejs-hunyuan/tencentcloud/services/hunyuan/v20230901/hunyuan_client';

import { objectToSSE } from '@/utils/sse';

import { HunYuanMessage } from '@/types/chat';
import { ChatModels } from '@/types/chatModel';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export const HunYuanStream = async (
  chatModel: ChatModels,
  temperature: number,
  messages: HunYuanMessage[],
) => {
  const {
    modelConfig: { model },
    apiConfig: { host, secret, apiKey },
  } = chatModel;

  const client = new Client({
    credential: {
      secretId: secret,
      secretKey: apiKey,
    },
  });

  const res = await client.ChatCompletions({
    Model: model!,
    Messages: messages,
    Stream: true,
    Temperature: temperature,
  });

  if (res.ErrorMsg) {
    throw res.ErrorMsg;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = JSON.parse(event.data);
          try {
            const json = JSON.parse(data);
            const text = json.Choices[0].Delta.Content;
            const { PromptTokens, CompletionTokens, TotalTokens } =
              json?.Usage || {};
            controller.enqueue(
              JSON.stringify({
                text,
                usage: {
                  inputTokens: PromptTokens,
                  outputTokens: CompletionTokens,
                  totalTokens: TotalTokens,
                },
              }),
            );
            if (json.Choices[0].FinishReason === 'stop') {
              controller.close();
              return;
            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
      for await (const message of res as any) {
        parser.feed(objectToSSE(message.data));
      }
    },
  });

  return stream;
};
