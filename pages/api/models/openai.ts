import { OpenAIStream } from '@/services/openai';
import {
  ChatBody,
  GPT4Message,
  Content,
  GPT4VisionMessage,
  Role,
} from '@/types/chat';
import { get_encoding } from 'tiktoken';
import {
  ChatMessagesManager,
  ChatModelManager,
  ChatModelRecordManager,
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
import { ModelVersions } from '@/types/model';

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
  const { chatId, modelId, userMessage, messageId, userModelConfig } =
    req.body as ChatBody;
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

  const prompt = userModelConfig?.prompt || modelConfig.prompt;
  const temperature = +(
    userModelConfig?.temperature || modelConfig.temperature
  );

  const encoding = get_encoding('cl100k_base');

  const prompt_tokens = encoding.encode(prompt);

  let tokenUsed = prompt_tokens.length;
  let messagesToSend = [] as any[];

  const isFirstChat = await ChatMessagesManager.checkIsFirstChat(chatId);
  if (isFirstChat) {
    await ChatMessagesManager.create({
      role: 'system',
      messages: JSON.stringify({ text: prompt }),
      chatId,
      userId,
    });
  }
  const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
    chatId,
    true
  );
  let lastMessage = null;
  let resParentId = messageId;
  if (messageId) {
    lastMessage = await ChatMessagesManager.findByUserMessageId(
      messageId,
      userId
    );

    if (lastMessage?.role === 'assistant') {
      lastMessage = await ChatMessagesManager.create({
        role: 'user',
        messages: JSON.stringify(userMessage),
        userId,
        chatId,
        parentId: messageId,
      });
      resParentId = lastMessage.id;
      chatMessages.push(lastMessage);
    }
  } else {
    lastMessage = await ChatMessagesManager.create({
      role: 'user',
      messages: JSON.stringify(userMessage),
      userId,
      chatId,
    });
    resParentId = lastMessage.id;
    chatMessages.push(lastMessage);
  }

  const findParents = (
    items: ChatMessages[],
    id: string | null,
    foundItems: ChatMessages[]
  ): ChatMessages[] => {
    if (!id) return [];
    const currentItem = items.find((item) => item.id === id);
    currentItem && foundItems.push(currentItem);
    if (currentItem && currentItem.parentId !== null) {
      return findParents(items, currentItem.parentId, foundItems);
    }
    return foundItems;
  };
  const messages = findParents(chatMessages, resParentId, []);

  const systemMessages = chatMessages.filter((x) => x.role === 'system');

  function convertMessageToSend(messageContent: Content, role: Role = 'user') {
    return { role, content: messageContent.text } as GPT4Message;
  }

  function convertToGPTVisionMessage(
    messageContent: Content,
    role: Role = 'user'
  ) {
    const message = { role, content: [] } as GPT4VisionMessage;
    message.content.push({ type: 'text', text: messageContent.text });
    messageContent.image?.forEach((url) => {
      message.content.push({
        type: 'image_url',
        image_url: { url },
      });
    });
    return message;
  }

  const allMessages = [...messages, ...systemMessages].reverse();
  allMessages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Content;
    let _messages = [] as GPT4Message[] | GPT4VisionMessage[];
    let content = {} as GPT4Message | GPT4VisionMessage;
    if (chatModel.modelVersion === ModelVersions.GPT_4_Vision) {
      content = convertToGPTVisionMessage(chatMessages, m.role as Role);
    } else {
      content = convertMessageToSend(chatMessages, m.role as Role);
    }
    _messages.push(content as any);
    messagesToSend.push(..._messages);
  });

  const userMessageToSend =
    chatModel.modelVersion === ModelVersions.GPT_4_Vision
      ? convertToGPTVisionMessage(userMessage)
      : convertMessageToSend(userMessage);

  messagesToSend.push(userMessageToSend);
  if (lastMessage?.role === 'user') {
    messagesToSend.pop();
  }
  console.log('messagesToSend \n', messagesToSend);

  const stream = await OpenAIStream(chatModel, temperature, messagesToSend);
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

          await ChatModelRecordManager.recordTransfer({
            isFirstChat,
            userId,
            chatId,
            tokenUsed,
            userMessageText,
            calculatedPrice,
            chatModelId: chatModel.id,
            createChatMessageParams: {
              role: 'assistant',
              chatId,
              userId,
              chatModelId: modelId,
              parentId: resParentId,
              messages: JSON.stringify({ text: assistantResponse }),
              tokenUsed,
              calculatedPrice,
            },
            updateChatParams: {
              id: chatId,
              chatModelId: chatModel.id,
              userModelConfig: JSON.stringify(userModelConfig),
            },
          });

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
