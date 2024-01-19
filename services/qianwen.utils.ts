import { ChatModels } from '@/models';
import { QianWenMessage } from '@/types/chat';

export const QianWenTokenizer = async (
  chatModel: ChatModels,
  messages: QianWenMessage[],
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
      model: modelId,
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
    }),
  };
  const res = await fetch(url, body);
  return 1;
};
