import {
  ChatBody,
  Content,
  Message,
  QianWenContent,
  QianWenMaxMessage,
  QianWenMessage,
  Role,
} from '@/types/chat';
import { QianWenStream, QianWenStreamResult } from '@/services/qianwen';
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
  const { chatId, parentId, modelId, userMessage, messageId, userModelConfig } =
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

  function convertMessageToSend(messageContent: Content, role: Role = 'user') {
    const content = [] as QianWenContent[];
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
    return { role, content: content } as QianWenMessage;
  }
  function convertMessageTextToSend(
    messageContent: Content,
    role: Role = 'user'
  ) {
    return { role, content: messageContent.text } as QianWenMaxMessage;
  }

  const prompt = userModelConfig?.prompt || modelConfig.prompt;
  const temperature = +(
    userModelConfig?.temperature || modelConfig.temperature
  );
  const enableSearch =
    userModelConfig?.enableSearch != undefined
      ? userModelConfig?.enableSearch
      : modelConfig?.enableSearch;

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
  const allMessages = [...messages, ...systemMessages].reverse();
  allMessages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Content;
    let content = {} as QianWenMessage | QianWenMaxMessage;
    if (chatModel.modelVersion === ModelVersions.QWen) {
      content = convertMessageTextToSend(chatMessages, m.role as Role);
    } else {
      content = convertMessageToSend(chatMessages, m.role as Role);
    }
    messagesToSend.push(content);
  });

  const userMessageToSend =
    chatModel.modelVersion === ModelVersions.QWen
      ? convertMessageTextToSend(userMessage)
      : convertMessageToSend(userMessage);

  messagesToSend.push(userMessageToSend);

  if (lastMessage?.role === 'user') {
    messagesToSend.pop();
  }
  
  try {
    const stream = await QianWenStream(
      chatModel,
      temperature,
      messagesToSend,
      enableSearch
    );

    let assistantResponse = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as QianWenStreamResult;
      let tokenUsed = 0;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value);
            assistantResponse += result.text;
          }
          if (done) {
            const { input_tokens, output_tokens, image_tokens } = result.usage;
            tokenUsed += input_tokens + (image_tokens || 0) + output_tokens;
            const calculatedPrice = calcTokenPrice(
              priceConfig,
              input_tokens + (image_tokens || 0),
              output_tokens
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
