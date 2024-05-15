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
  const promptToSend =
    chatModel.modelVersion === ModelVersions.QWen
      ? convertMessageTextToSend({ text: prompt }, 'system')
      : convertMessageToSend({ text: prompt }, 'system');

  const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
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
    let _messages = [] as any[];
    if (chatModel.modelVersion === ModelVersions.QWen) {
      _messages = chatMessages.map((x) => {
        return convertMessageTextToSend(x.content, x.role);
      });
    } else {
      chatMessages.forEach((x) => {
        const content = convertMessageToSend(x.content, x.role);
        _messages.push(content as any);
      });
    }
    messagesToSend = [...messagesToSend, ..._messages];
  });
  const userMessageToSend =
    chatModel.modelVersion === ModelVersions.QWen
      ? convertMessageTextToSend(userMessage)
      : convertMessageToSend(userMessage);

  const currentMessage = [
    {
      role: 'user',
      content: userMessage,
    },
  ];

  messagesToSend.push(userMessageToSend);
  messagesToSend.unshift(promptToSend);

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
          currentMessage.push({
            role: 'assistant',
            content: { text: assistantResponse },
          });

          await ChatModelRecordManager.recordTransfer({
            messageId,
            userId,
            chatId,
            tokenUsed,
            userMessageText,
            calculatedPrice,
            chatModelId: chatModel.id,
            createChatMessageParams: {
              chatId,
              userId,
              parentId,
              messages: JSON.stringify(currentMessage),
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
};

export default apiHandler(handler);
