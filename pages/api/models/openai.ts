import { OpenAIStream } from '@/services/openai';
import { ChatBody, GPT4Message, Content, Message } from '@/types/chat';
import { get_encoding } from 'tiktoken';
import {
  ChatMessagesManager,
  ChatModelManager,
  ChatsManager,
  UserBalancesManager,
  UserModelManager,
} from '@/managers';
import {
  BadRequest,
  InternalServerError,
  ModelUnauthorized,
} from '@/utils/error';
import { verifyModel } from '@/utils/model';
import { calcTokenPrice } from '@/utils/message';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';
import { ChatMessages } from '@prisma/client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest, res: ChatsApiResponse) => {
  const { userId } = req.session;
  const { chatId, parentId, modelId, userMessage } = req.body as ChatBody;
  const userMessageText = userMessage.text!;

  const chatModel = await ChatModelManager.findModelById(modelId);
  if (!chatModel?.enabled) {
    throw new ModelUnauthorized();
  }

  const { modelConfig, priceConfig } = chatModel;

  const userModel = await UserModelManager.findUserModel(userId, modelId);
  if (!userModel || !userModel.enabled) {
    throw new ModelUnauthorized();
  }

  const verifyMessage = verifyModel(userModel, modelConfig);
  if (verifyMessage) {
    throw new BadRequest(verifyMessage);
  }

  const userBalance = await UserBalancesManager.findUserBalance(userId);
  if (userBalance.lte(0)) {
    throw new BadRequest('Insufficient balance');
  }

  let prompt = null;
  if (!prompt) {
    prompt = modelConfig.prompt;
  }

  let temperature = null;
  if (!temperature) {
    temperature = modelConfig.temperature;
  }

  const encoding = get_encoding('cl100k_base');

  const prompt_tokens = encoding.encode(prompt);

  let tokenUsed = prompt_tokens.length;
  let messagesToSend: GPT4Message[] = [];

  const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
    userId,
    chatId
  );
  const findParents = (
    items: ChatMessages[],
    id: string | null
  ): ChatMessages[] => {
    if (!id) return [];
    const currentItem = items.find((item) => item.id === id);
    if (currentItem && currentItem.parentId !== null) {
      return [currentItem, ...findParents(items, currentItem.parentId)];
    }
    return currentItem ? [currentItem] : [];
  };
  const messages = findParents(chatMessages, parentId);
  messages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Message[];
    const _messages = chatMessages.map((x) => {
      return { role: x.role, content: x.content.text } as GPT4Message;
    });
    messagesToSend = [...messagesToSend, ..._messages];
  });

  function convertMessageToSend<T>(userMessage: Content) {
    return { role: 'user', content: userMessageText } as T;
  }

  // function convertToGPTVisionMessage(userMessage: Content) {
  //   const message = { role: 'user' } as GPT4VisionMessage;
  //   message.content.push({ type: 'text', text: userMessage.text });
  //   userMessage.image?.forEach((url) => {
  //     message.content.push({
  //       type: 'image_url',
  //       image_url: { url },
  //     });
  //   });
  //   return message;
  // }

  const userMessageToSend = convertMessageToSend<GPT4Message>(userMessage);
  const currentMessage = [
    {
      role: 'user',
      content: userMessage,
    },
  ];
  messagesToSend.push(userMessageToSend);

  const stream = await OpenAIStream(
    chatModel,
    prompt,
    temperature,
    messagesToSend
  );
  let assistantResponse = '';
  res.setHeader('Content-Type', 'application/octet-stream');
  if (stream.getReader) {
    const reader = stream.getReader();
    const streamResponse = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          assistantResponse += value;
        }
        if (done) {
          let messageTokens = encoding.encode(assistantResponse).length;
          tokenUsed += messageTokens;
          const calculatedPrice = calcTokenPrice(
            priceConfig,
            tokenUsed,
            messageTokens
          );
          encoding.free();
          currentMessage.push({
            role: 'assistant',
            content: { text: assistantResponse },
          });
          await UserModelManager.updateUserModelTokenCount(
            userId,
            chatModel.id,
            tokenUsed
          );
          await UserBalancesManager.chatUpdateBalance(userId, calculatedPrice);

          let title = null;
          if (!(await ChatMessagesManager.checkIsFirstChat(chatId))) {
            title =
              userMessageText.length > 30
                ? userMessageText.substring(0, 30) + '...'
                : userMessageText;
          }
          const chatMessage = await ChatMessagesManager.create({
            chatId,
            userId,
            parentId,
            messages: JSON.stringify(currentMessage),
            tokenUsed,
            calculatedPrice,
          });
          const chat = await ChatsManager.update({
            id: chatId,
            ...(title && { title: title }),
            displayingLeafChatMessageNodeId: chatMessage.id,
            chatModelId: chatModel.id,
          });
          return res.send(
            `<end>${JSON.stringify({
              title: chat.title,
              displayingLeafChatMessageNodeId: chatMessage.id,
            })}</end>`
          );
        }
        res.write(Buffer.from(value));
      }
    };

    streamResponse().catch((error) => {
      throw new InternalServerError(
        JSON.stringify({ message: error?.message, stack: error?.stack })
      );
    });
  }
};

export default apiHandler(handler);
