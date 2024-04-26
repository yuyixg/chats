import { OpenAIStream } from '@/services/openai';
import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  GPT4VisionContent,
  Content,
} from '@/types/chat';
import { get_encoding } from 'tiktoken';
import { ModelVersions } from '@/types/model';
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
  const findParents = (items: ChatMessages[], id?: string): ChatMessages[] => {
    if (!id) return [];
    const currentItem = items.find((item) => item.id === id);
    if (currentItem && currentItem.parentId !== null) {
      return [currentItem, ...findParents(items, currentItem.parentId)];
    }
    return currentItem ? [currentItem] : [];
  };
  const messages = findParents(chatMessages, parentId);
  // for (let i = messages.length - 1; i >= 0; i--) {
  //   const message = messages[i];
  //   const assistantTokens = encoding.encode(message.assistantResponse);
  //   const userTokens = encoding.encode(message.userMessage);
  //   if (tokenUsed + sendTokens.length + 1000 > modelConfig.tokenLimit!) {
  //     break;
  //   }
  //   tokenUsed += sendTokens.length;
  // }

  messages.forEach((message) => {
    const userMessage = {
      role: 'user',
      content: message.userMessage,
    } as GPT4Message;
    const assistantResponse = {
      role: 'assistant',
      content: message.assistantResponse,
    } as GPT4Message;

    messagesToSend = [...messagesToSend, userMessage, assistantResponse];
  });

  if (chatModel.modelVersion === ModelVersions.GPT_4_Vision) {
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
        role: 'user',
        content: userMessage.text,
      } as GPT4Message;
    });
  }

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
          messages.push({
            role: 'assistant',
            content: { text: assistantResponse },
          });
          await ChatMessagesManager.create({
            chatId,
            userId,
            parentId,
            assistantResponse,
            tokenUsed,
            calculatedPrice,
          });
          await UserModelManager.updateUserModelTokenCount(
            userId,
            chatModel.id,
            tokenUsed
          );
          await UserBalancesManager.chatUpdateBalance(userId, calculatedPrice);
          await ChatsManager.update({ id: chatId, chatModelId: chatModel.id });
          return res.end();
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
