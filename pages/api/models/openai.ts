import { OpenAIStream } from '@/services/openai';
import {
  ChatBody,
  GPT4Message,
  Content,
  Message,
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
  console.log(req.body);
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

  const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
    chatId
  );
  const isFirstChat = await ChatMessagesManager.checkIsFirstChat(chatId);
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
    id: string | null
  ): ChatMessages[] => {
    if (!id) return [];
    const currentItem = items.find((item) => item.id === id);
    if (currentItem && currentItem.parentId !== null) {
      return [currentItem, ...findParents(items, currentItem.parentId)];
    }
    return currentItem ? [currentItem] : [];
  };
  const messages = findParents(chatMessages, messageId);
  if (lastMessage?.role === 'user') {
    messages.pop();
  }

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

  messages.reverse().forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Content;
    let _messages = [] as GPT4Message[] | GPT4VisionMessage[];
    let content = {} as GPT4Message | GPT4VisionMessage;
    if (chatModel.modelVersion === ModelVersions.GPT_4_Vision) {
      content = convertToGPTVisionMessage(chatMessages, m.role as Role);
    } else {
      content = convertMessageToSend(chatMessages, m.role as Role);
    }
    _messages.push(content as any);
    messagesToSend = [...messagesToSend, ..._messages];
  });

  const userMessageToSend =
    chatModel.modelVersion === ModelVersions.GPT_4_Vision
      ? convertToGPTVisionMessage(userMessage)
      : convertMessageToSend(userMessage);

  const promptToSend =
    chatModel.modelVersion === ModelVersions.GPT_4_Vision
      ? convertToGPTVisionMessage({ text: prompt }, 'system')
      : convertMessageToSend({ text: prompt }, 'system');

  messagesToSend.push(userMessageToSend);
  messagesToSend.unshift(promptToSend);

  console.log('messagesToSend', JSON.stringify(messagesToSend));

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
