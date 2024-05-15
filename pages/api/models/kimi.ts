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

  const prompt = userModelConfig?.prompt || modelConfig.prompt;
  const temperature = +(
    userModelConfig?.temperature || modelConfig.temperature
  );

  let messagesToSend = [] as any[];

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
    return { role, content: messageContent.text } as GPT4Message;
  }

  messages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Message[];
    let _messages = [] as GPT4Message[] | GPT4VisionMessage[];

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
  let promptToSend = convertMessageToSend({ text: prompt }, 'system');
  messagesToSend.unshift(promptToSend);

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
