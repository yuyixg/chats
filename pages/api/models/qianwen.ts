import {
  ChatBody,
  Content,
  Message,
  QianWenContent,
  QianWenMessage,
  Role,
} from '@/types/chat';
import { QianWenStream, QianWenStreamResult } from '@/services/qianwen';
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
  const { chatId, parentId, modelId, userMessage, messageId } =
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

  let prompt = null;
  if (!prompt) {
    prompt = modelConfig.prompt;
  }

  let temperature = null;
  if (!temperature) {
    temperature = modelConfig.temperature;
  }

  let messagesToSend: QianWenMessage[] = [];

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

  messages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Message[];
    let _messages = [] as QianWenMessage[];

    _messages = chatMessages.map((x) => {
      return convertMessageToSend(x.content, x.role);
    });

    messagesToSend = [...messagesToSend, ..._messages];
  });
  const userMessageToSend = convertMessageToSend(userMessage);

  const currentMessage = [
    {
      role: 'user',
      content: userMessage,
    },
  ];

  messagesToSend.push(userMessageToSend);

  const stream = await QianWenStream(
    chatModel,
    prompt,
    temperature,
    messagesToSend
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
            input_tokens + image_tokens,
            output_tokens
          );
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
          if (messageId) {
            await ChatMessagesManager.delete(messageId, userId);
          }
          await ChatMessagesManager.create({
            chatId,
            userId,
            parentId,
            messages: JSON.stringify(currentMessage),
            tokenUsed,
            calculatedPrice,
          });
          await ChatsManager.update({
            id: chatId,
            ...(title && { title: title }),
            chatModelId: chatModel.id,
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
