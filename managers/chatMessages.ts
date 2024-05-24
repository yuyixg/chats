import prisma from '@/prisma/prisma';
import { Role } from '@/types/chat';
import { MessageNode } from '@/types/chatMessage';
import { calculateMessages } from '@/utils/message';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { ChatModelManager } from './models';

export interface CreateChatMessage {
  role: Role;
  userId: string;
  chatId: string;
  messages: string;
  parentId?: string | null;
  calculatedPrice?: Decimal;
  tokenUsed?: number;
  chatModelId?: string;
}

export class ChatMessagesManager {
  static async findByUserMessageId(id: string, userId: string) {
    return await prisma.chatMessages.findUnique({
      where: { id, AND: { userId } },
    });
  }

  static async create(params: CreateChatMessage) {
    return await prisma.chatMessages.create({ data: { ...params } });
  }

  static async findUserMessageByChatId(chatId: string, all: boolean = false) {
    let where: Prisma.ChatMessagesWhereInput = {
      chatId,
      ...(!all && {
        role: {
          notIn: ['system'],
        },
      }),
    };
    return await prisma.chatMessages.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  static async findUserMessageDetailByChatId(chatId: string) {
    const chatMessages = await this.findUserMessageByChatId(chatId);
    const chatModels = await ChatModelManager.findModels(true);
    const messages = chatMessages.map((x) => {
      return {
        id: x.id,
        parentId: x.parentId,
        createdAt: x.createdAt,
        tokenUsed: x.tokenUsed,
        calculatedPrice: x.calculatedPrice,
        role: x.role,
        content: JSON.parse(x.messages),
        modelName: chatModels.find((m) => m.id === x.chatModelId)?.name,
      } as MessageNode;
    });
    return calculateMessages(messages);
  }

  static async deleteByChatId(chatId: string, userId: string) {
    return await prisma.chatMessages.deleteMany({
      where: { chatId, AND: { userId } },
    });
  }

  static async checkIsFirstChat(chatId: string) {
    const count = await prisma.chatMessages.count({ where: { chatId } });
    return count === 0;
  }

  static async findMessageById(id: string) {
    return await prisma.chatMessages.findUnique({ where: { id } });
  }
}
