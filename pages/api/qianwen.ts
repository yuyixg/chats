import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatBody, QianWenContent, QianWenMessage } from '@/types/chat';
import { QianWenStream, StreamResult, Tokenizer } from '@/services/qianwen';
import {
  ChatMessageManager,
  ChatModelManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      res.status(401).end();
      return;
    }
    const { userId } = session;
    const { messageId, model, messages, prompt, temperature } =
      req.body as ChatBody;

    const enabledModels = await ChatModelManager.findModels();

    if (!enabledModels.find((x) => x.id === model.modelId)) {
      res.status(400).send(
        JSON.stringify({
          messages: 'The Model does not exist or access is denied.',
        })
      );
      return;
    }

    const chatModel = await UserModelManager.findUserModel(
      userId,
      model.modelId
    );
    if (!chatModel) {
      res.status(400).send(
        JSON.stringify({
          messages: 'The Model does not exist or access is denied.',
        })
      );
      return;
    }

    const chatMessages = await ChatMessageManager.findUserMessageById(
      messageId,
      userId
    );

    let messagesToSend: QianWenMessage[] = [];

    messagesToSend = messages.map((message) => {
      const messageContent = message.content;
      let content = [] as QianWenContent[];
      if (messageContent?.image) {
        messageContent.image.forEach((url) => {
          content.push({
            image: url,
          });
        });
      }
      if (messageContent?.text) {
        content.push({ text: messageContent.text });
      }

      return { role: message.role, content };
    });

    const stream = await QianWenStream(
      chatModel,
      prompt,
      temperature,
      messagesToSend
    );

    let assistantMessage = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as StreamResult;
      let tokenCount = 0;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value);
            assistantMessage += result.text;
          }
          if (done) {
            const { input_tokens, output_tokens, image_tokens } = result.usage;
            tokenCount += input_tokens + (image_tokens || 0) + output_tokens;
            messages.push({
              role: 'assistant',
              content: { text: assistantMessage },
            });
            if (chatMessages) {
              await ChatMessageManager.updateMessageById(
                chatMessages.id!,
                messages,
                tokenCount + chatMessages.tokenCount,
                chatMessages.chatCount + 1
              );
            } else {
              await ChatMessageManager.createMessage({
                id: messageId,
                messages,
                modelId: chatModel.id!,
                userId: userId,
                prompt: model.systemPrompt,
                tokenCount,
                chatCount: 1,
              });
            }
            res.end();
            break;
          }
          res.write(Buffer.from(result.text));
        }
      };

      streamResponse().catch((error) => {
        console.error(error);
        res.status(500).end();
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export default handler;
