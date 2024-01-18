import { QianFanMessage } from '@/types/chat';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { Model, ModelIds } from '@/types/model';
import { QIANFAN_API_KEY, QIANFAN_SECRET_KEY } from '../utils/const';

export const ModelEndpoint = {
  [ModelIds.ERNIE_Bot_4]: 'completions_pro',
  [ModelIds.ERNIE_Bot_8K]: 'ernie_bot_8k',
};

async function getAccessTokenAsync() {
  let url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${QIANFAN_API_KEY}&client_secret=${QIANFAN_SECRET_KEY}`;
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const result = await resp.json();
  if (resp.status === 200) {
    return result?.access_token;
  } else {
    throw new Error(result);
  }
}

export const QianFanStream = async (
  model: Model,
  messages: QianFanMessage[],
  parameters: any
) => {
  const accessToken = await getAccessTokenAsync();
  const modelId =
    (model.modelId as ModelIds.ERNIE_Bot_4) || ModelIds.ERNIE_Bot_8K;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${ModelEndpoint[modelId]}?access_token=${accessToken}`;
  const body = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      model: model.modelId,
      messages: [...messages],
      stream: true,
      ...parameters,
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
            const text = json.result;
            controller.enqueue(text);
            if (json.is_end) {
              controller.close();
              return;
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
