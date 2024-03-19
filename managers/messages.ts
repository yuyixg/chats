import { ChatMessages, ChatModels, Users } from '@/dbs';
import { Message } from '@/types/chat';
import { UserModelManager } from './userModels';
import UserModels, { UserModel } from '@/dbs/userModels';
import { Op } from 'sequelize';
import { UserChatMessage } from '@/types/message';
import { PageResult } from '@/types/page';

export interface CreateMessage {
  id: string;
  messages: Message[];
  modelId: string;
  userId: string;
  prompt: string;
  tokenCount: number;
  chatCount: number;
}

export class ChatMessageManager {
  static async findUserMessageById(id: string, userId: string) {
    return await ChatMessages.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  static async findMessages(query: string) {
    const messages = (await ChatMessages.findAndCountAll({
      include: {
        attributes: ['username', 'role'],
        model: Users,
        where: {
          [Op.or]: [
            {
              username: { [Op.like]: `%${query}%` },
            },
            {
              role: { [Op.like]: `%${query}%` },
            },
          ],
        },
      },
    })) as PageResult<UserChatMessage[]>;
    return messages;
  }

  static async updateMessageById(
    id: string,
    messages: Message[],
    tokenCount: number,
    chatCount: number
  ) {
    return await ChatMessages.update(
      {
        messages,
        tokenCount,
        chatCount,
      },
      {
        where: {
          id,
        },
      }
    );
  }

  static async createMessage(params: CreateMessage) {
    const { id, messages, modelId, userId, prompt, tokenCount, chatCount } =
      params;
    return await ChatMessages.create({
      id,
      messages,
      modelId,
      name: messages[0].content.text!.substring(0, 30),
      userId,
      prompt,
      tokenCount,
      chatCount: 1,
    });
  }

  static async recordChat(
    messageId: string,
    userId: string,
    userModelId: string,
    messages: Message[],
    tokenCount: number,
    promptToSend: string,
    chatModel: ChatModels,
    userModel: UserModel
  ) {
    const chatMessages = await ChatMessageManager.findUserMessageById(
      messageId,
      userId
    );
    if (chatMessages) {
      await ChatMessageManager.updateMessageById(
        chatMessages.id!,
        messages,
        tokenCount + chatMessages.tokenCount,
        chatMessages.chatCount + 1
      );
    } else {
      await ChatMessageManager.createMessage({
        id: messageId,
        messages,
        modelId: chatModel.id!,
        userId: userId,
        prompt: promptToSend,
        tokenCount,
        chatCount: 1,
      });
    }
    await UserModelManager.updateUserModelTokenCount(
      userModelId,
      userModel.modelId,
      tokenCount
    );
  }
}
