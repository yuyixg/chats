import { LingYiStream, LingYiSteamResult } from '@/services/lingyi';
import {
  ChatBody,
  GPT4Message,
  GPT4VisionMessage,
  Message,
  Content,
  Role,
} from '@/types/chat';
import { ModelVersions } from '@/types/model';
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

  let prompt = null;
  if (!prompt) {
    prompt = modelConfig.prompt;
  }

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

  messages.forEach((m) => {
    const chatMessages = JSON.parse(m.messages) as Message[];
    let _messages = [] as GPT4Message[] | GPT4VisionMessage[];
    if (chatModel.modelVersion === ModelVersions.yi_vl_plus) {
      chatMessages.forEach((x) => {
        const content = convertToGPTVisionMessage(x.content, x.role);
        _messages.push(content as any);
      });
    } else {
      _messages = chatMessages.map((x) => {
        return convertMessageToSend(x.content, x.role);
      });
    }
    messagesToSend = [...messagesToSend, ..._messages];
  });

  const userMessageToSend =
    chatModel.modelVersion === ModelVersions.yi_vl_plus
      ? convertToGPTVisionMessage(userMessage)
      : convertMessageToSend(userMessage);

  const currentMessage = [
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const promptToSend =
    chatModel.modelVersion === ModelVersions.yi_vl_plus
      ? convertToGPTVisionMessage({ text: prompt }, 'system')
      : convertMessageToSend({ text: prompt }, 'system');

  messagesToSend.push(userMessageToSend);
  messagesToSend.unshift(promptToSend);

  const stream = await LingYiStream(
    chatModel,
    temperature,
    messagesToSend
  );
  let assistantMessage = '';
  res.setHeader('Content-Type', 'application/octet-stream');
  if (stream.getReader) {
    const reader = stream.getReader();
    let result = {} as LingYiSteamResult;
    const streamResponse = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          result = JSON.parse(value) as LingYiSteamResult;
          assistantMessage += result.text;
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
            content: { text: assistantMessage },
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
