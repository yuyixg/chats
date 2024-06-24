import { KimiStream } from '@/services/kimi';
import { LingYiStream } from '@/services/lingyi';
import { OpenAIStream } from '@/services/openai';
import { QianFanStream } from '@/services/qianfan';
import { QianWenStream } from '@/services/qianwen';
import ChatStreamResult from '@/services/type';
import { ZhiPuAIStream } from '@/services/zhipuai';

import { addChat, checkChatIsStopped, stopChat } from '@/utils/chats';
import {
  BadRequest,
  InternalServerError,
  ModelUnauthorized,
} from '@/utils/error';
import { calcTokenPrice } from '@/utils/message';
import { verifyChat } from '@/utils/model';

import {
  ChatBody,
  Content,
  GPT4Message,
  GPT4VisionMessage,
  QianFanMessage,
  QianWenContent,
  QianWenMaxMessage,
  QianWenMessage,
  Role,
} from '@/types/chat';
import { ModelProviders, ModelVersions } from '@/types/model';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';

import {
  ChatMessagesManager,
  ChatModelManager,
  ChatModelRecordManager,
  UserBalancesManager,
  UserModelManager,
} from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
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
  addChat(chatId);

  const chatModel = await ChatModelManager.findModelById(modelId);
  if (!chatModel?.enabled) {
    throw new ModelUnauthorized();
  }

  const { modelConfig, priceConfig } = chatModel;

  const userModel = await UserModelManager.findUserModel(userId, modelId);
  if (!userModel || !userModel.enabled) {
    throw new ModelUnauthorized();
  }

  let usages = {
    balance: false,
    tokens: false,
    counts: false,
    expires: false,
  };

  const userBalance = await UserBalancesManager.findUserBalance(userId);

  const verified = verifyChat(userModel, userBalance);
  if (!verified.expires) {
    throw new BadRequest('Subscription has expired');
  }
  usages = { ...verified };
  if (!usages.balance && !verified.counts && !verified.tokens) {
    throw new BadRequest('Insufficient balance');
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
    true,
  );
  let lastMessage = null;
  let resParentId = messageId;
  if (messageId) {
    lastMessage = await ChatMessagesManager.findByUserMessageId(
      messageId,
      userId,
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
    foundItems: ChatMessages[],
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
    role: Role = 'user',
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

  function convertToQianWenMessage(
    messageContent: Content,
    role: Role = 'user',
  ) {
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

  const allMessages = [...messages, ...systemMessages].reverse();

  try {
    let stream: ReadableStream<any>;
    if (
      chatModel.modelProvider === ModelProviders.Azure ||
      chatModel.modelProvider === ModelProviders.OpenAI
    ) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        let content = {} as GPT4Message | GPT4VisionMessage;
        if (chatModel.modelVersion === ModelVersions.GPT_4_Vision) {
          content = convertToGPTVisionMessage(chatMessages, m.role as Role);
        } else {
          content = convertMessageToSend(chatMessages, m.role as Role);
        }
        messagesToSend.push(content);
      });

      const userMessageToSend =
        chatModel.modelVersion === ModelVersions.GPT_4_Vision
          ? convertToGPTVisionMessage(userMessage)
          : convertMessageToSend(userMessage);

      messagesToSend.push(userMessageToSend);
      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }
      stream = await OpenAIStream(chatModel, temperature, messagesToSend);
    } else if (chatModel.modelProvider === ModelProviders.Moonshot) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        const content = convertMessageToSend(chatMessages, m.role as Role);
        messagesToSend.push(content);
      });

      const userMessageToSend = convertMessageToSend(userMessage);
      messagesToSend.push(userMessageToSend);
      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }
      stream = await KimiStream(chatModel, temperature, messagesToSend);
    } else if (chatModel.modelProvider === ModelProviders.QianWen) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        let content = {} as QianWenMessage | QianWenMaxMessage;
        if (chatModel.modelVersion === ModelVersions.QWen_Vl) {
          content = convertToQianWenMessage(chatMessages, m.role as Role);
        } else {
          content = convertMessageToSend(chatMessages, m.role as Role);
        }
        messagesToSend.push(content);
      });

      const userMessageToSend =
        chatModel.modelVersion === ModelVersions.QWen_Vl
          ? convertToQianWenMessage(userMessage)
          : convertMessageToSend(userMessage);

      messagesToSend.push(userMessageToSend);

      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }

      stream = await QianWenStream(
        chatModel,
        temperature,
        messagesToSend,
        enableSearch,
      );
    } else if (chatModel.modelProvider === ModelProviders.QianFan) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        let content = {} as QianFanMessage;
        content = convertMessageToSend(chatMessages, m.role as Role);
        messagesToSend.push(content);
      });
      const userMessageToSend = convertMessageToSend(userMessage);

      messagesToSend.push(userMessageToSend);
      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }
      stream = await QianFanStream(chatModel, messagesToSend, {
        temperature,
        top_p: 0.7,
        penalty_socre: 1,
        request_timeout: 60000,
      });
    } else if (chatModel.modelProvider === ModelProviders.LingYi) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        let _messages = [] as GPT4Message[] | GPT4VisionMessage[];
        let content = {} as GPT4Message | GPT4VisionMessage;
        if (chatModel.modelVersion === ModelVersions.yi_vl_plus) {
          content = convertToGPTVisionMessage(chatMessages, m.role as Role);
        } else {
          content = convertMessageToSend(chatMessages, m.role as Role);
        }
        _messages.push(content as any);
        messagesToSend.push(..._messages);
      });

      const userMessageToSend =
        chatModel.modelVersion === ModelVersions.yi_vl_plus
          ? convertToGPTVisionMessage(userMessage)
          : convertMessageToSend(userMessage);

      messagesToSend.push(userMessageToSend);
      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }

      stream = await LingYiStream(chatModel, temperature, messagesToSend);
    } else if (chatModel.modelProvider === ModelProviders.ZhiPuAI) {
      allMessages.forEach((m) => {
        const chatMessages = JSON.parse(m.messages) as Content;
        let content = {} as GPT4Message | GPT4VisionMessage;
        if (chatModel.modelVersion === ModelVersions.GLM_4V) {
          content = convertToGPTVisionMessage(chatMessages, m.role as Role);
        } else {
          content = convertMessageToSend(chatMessages, m.role as Role);
        }
        messagesToSend.push(content);
      });

      const userMessageToSend =
        chatModel.modelVersion === ModelVersions.GLM_4V
          ? convertToGPTVisionMessage(userMessage)
          : convertMessageToSend(userMessage);

      messagesToSend.push(userMessageToSend);
      if (lastMessage?.role === 'user') {
        messagesToSend.pop();
      }
      stream = await ZhiPuAIStream(chatModel, temperature, messagesToSend);
    } else {
      throw new InternalServerError(
        JSON.stringify({ message: 'Model Not Found' }),
      );
    }
    let assistantResponse = '';
    if (stream.getReader) {
      const reader = stream.getReader();
      let result = {} as ChatStreamResult;
      const streamResponse = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (value) {
            result = JSON.parse(value) as ChatStreamResult;
            assistantResponse += result.text;
          }
          if (done || checkChatIsStopped(chatId)) {
            stopChat(chatId);
            const { totalTokens, inputTokens, outputTokens } = result.usage;

            const tokenUsed = totalTokens;
            const calculatedPrice = calcTokenPrice(
              priceConfig,
              inputTokens,
              outputTokens,
            );
            await ChatModelRecordManager.recordTransfer({
              usages,
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
                userModelConfig: JSON.stringify({
                  ...(userModelConfig?.enableSearch && {
                    enableSearch,
                  }),
                  ...(userModelConfig?.temperature && {
                    temperature,
                  }),
                }),
              },
            });
            return res.end();
          }
          res.write(
            Buffer.from(
              `data:${JSON.stringify({
                result: result.text,
                success: true,
              })}\n`,
            ),
          );
        }
      };
      try {
        await streamResponse();
      } catch (error: any) {
        res.write(
          Buffer.from(
            `data:${JSON.stringify({
              success: false,
            })}\n`,
          ),
        );
        throw new InternalServerError(
          JSON.stringify({
            message: typeof error === 'string' ? error : JSON.stringify(error),
            stack: error?.stack,
          }),
        );
      }
    }
  } catch (error: any) {
    if (lastMessage && lastMessage.id !== messageId) {
      await ChatMessagesManager.delete(lastMessage.id, userId);
    }
    res.write(
      Buffer.from(
        `data:${JSON.stringify({
          success: false,
        })}\n`,
      ),
    );
    throw new InternalServerError(
      JSON.stringify({
        message: typeof error === 'string' ? error : JSON.stringify(error),
        stack: error?.stack,
      }),
    );
  }
};

export default apiHandler(handler);
