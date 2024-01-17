import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server/openai';

import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  GPT4VisionContent,
} from '@/types/chat';

// import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

// import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
// import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
import { ModelIds } from '@/types/model';
import { ChatModels } from '@/models';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  // runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { model, messages, prompt, temperature } =
      (await req.body) as ChatBody;

    const chatModel = await ChatModels.findOne({
      where: { modelId: model.modelId },
    });

    if (chatModel === null) {
      throw '';
    }

    // await init((imports: WebAssembly.Imports) =>
    //   WebAssembly.instantiate(wasm, imports)
    // );
    // const encoding = new Tiktoken(
    //   tiktokenModel.bpe_ranks,
    //   tiktokenModel.special_tokens,
    //   tiktokenModel.pat_str
    // );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    // const prompt_tokens = encoding.encode(promptToSend);

    // let tokenCount = prompt_tokens.length;
    let messagesToSend: GPT4Message[] | GPT4VisionMessage[] = [];

    // for (let i = messages.length - 1; i >= 0; i--) {
    //   const message = messages[i];
    //   const tokens = encoding.encode(message.content.text!);

    //   if (tokenCount + tokens.length + 1000 > chatModel.tokenLimit!) {
    //     break;
    //   }
    //   tokenCount += tokens.length;
    // }

    if (chatModel.modelId === ModelIds.GPT_4_Vision) {
      messagesToSend = messages.map((message) => {
        const messageContent = message.content;
        let content = [] as GPT4VisionContent[];
        if (messageContent?.image) {
          messageContent.image.forEach((url) => {
            content.push({
              type: 'image_url',
              image_url: { url },
            });
          });
        }
        if (messageContent?.text) {
          content.push({ type: 'text', text: messageContent.text });
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

    // encoding.free();

    const stream = await OpenAIStream(
      chatModel,
      promptToSend,
      temperatureToUse,
      messagesToSend
    );

    try {
      res.setHeader('Content-Type', 'application/octet-stream');
      if (stream.getReader) {
        const reader = stream.getReader();
        const streamResponse = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(Buffer.from(value));
          }
        };

        streamResponse().catch((error) => {
          console.error('Stream reading error:', error);
          res.status(500).end();
        });
      } else {
        res.status(500).end('Stream is not readable.');
      }
    } catch (error) {
      res.status(500).end(`Server Error: ${error}`);
    }
  } catch (error: any) {
    if (error instanceof OpenAIError) {
      console.log(error);
      res.status(500).send({ statusText: error.message });
    } else {
      console.log(error);
      res.status(500).send('');
    }
  }
};

export default handler;
