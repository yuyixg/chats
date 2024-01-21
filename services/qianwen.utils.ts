import { ChatModels } from '@/models';
import { QianWenMessage } from '@/types/chat';

export const QianWenTokenizer = async (
  chatModel: ChatModels,
  messages: any[],
  prompt: string
) => {
  const { modelId, apiHost, apiKey, systemPrompt } = chatModel;
  let url = `${apiHost}/tokenizer`;
  const body = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'qwen-plus',
      input: {
        messages: [
          ...messages,
        ],
      },
    }),
  };
  const res = await fetch(url, body);
  console.log(res.status);
  if (res.status === 200) {
    const result = await res.json();
    return result.usage.input_tokens;
  } else {
    let errors = {} as any;
    errors = await res.json();
    throw new Error(JSON.stringify(errors));
  }
};
