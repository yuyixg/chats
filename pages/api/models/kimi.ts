import {
  ChatBody,
  Content,
  GPT4Message,
  GPT4VisionMessage,
  Message,
  Role,
} from '@/types/chat';
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
import { KimiSteamResult, KimiStream } from '@/services/kimi';
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
  const allMessages = [...messages, ...systemMessages].reverse();
  allMessages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Content;
    const content = convertMessageToSend(chatMessages, m.role as Role);
    messagesToSend.push(content);
  });

  const userMessageToSend = convertMessageToSend(userMessage);

  messagesToSend.push(userMessageToSend);
  
  try {
    const stream = await KimiStream(chatModel, temperature, messagesToSend);
    let assistantResponse = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as KimiSteamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();

          if (value) {
            result = JSON.parse(value) as KimiSteamResult;
            assistantResponse += result.text;
          }

          if (done) {
            const { total_tokens, prompt_tokens, completion_tokens } =
              result.usage;

            const tokenUsed = total_tokens;
            const calculatedPrice = calcTokenPrice(
              priceConfig,
              prompt_tokens,
              completion_tokens
            );

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
          res.write(Buffer.from(result.text));
        }
      };

      streamResponse().catch((error) => {
        throw new InternalServerError(
          JSON.stringify({ message: error?.message, stack: error?.stack })
        );
      });
    }
  } catch (error: any) {
    if (lastMessage && lastMessage.id !== messageId) {
      await ChatMessagesManager.delete(lastMessage.id, userId);
    }
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
