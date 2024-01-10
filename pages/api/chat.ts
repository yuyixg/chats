import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server/openai';

import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  GPT4VisionMessageContent,
  Message,
} from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
import { ModelIds } from '@/types/model';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, prompt, temperature } =
      (await req.json()) as ChatBody;

    await init((imports: WebAssembly.Imports) =>
      WebAssembly.instantiate(wasm, imports)
    );
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: GPT4Message[] | GPT4VisionMessage[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content.text!);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
    }
    if (model.id === ModelIds.GPT_4_VISION) {
      messagesToSend = messages.map((message) => {
        const messageContent = message.content;
        let content = [] as GPT4VisionMessageContent[];
        if (messageContent?.text) {
          content.push({ type: 'text', text: messageContent.text });
        }
        if (messageContent?.image) {
          content.push({
            type: 'image_url',
            image_url: { url: messageContent.image },
          });
        }
        return { role: message.role, content };
      });
    } else {
      messagesToSend = messages.map((message) => {
        return {
          role: message.role,
          content: message.content.text,
        } as GPT4Message;
      });
    }

    encoding.free();

    console.log('Send messages \n', messagesToSend);

    const stream = await OpenAIStream(
      model,
      promptToSend,
      temperatureToUse,
      messagesToSend
    );

    return new Response(stream);
  } catch (error: any) {
    if (error instanceof OpenAIError) {
      console.log(error);
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      console.log(error);
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
