import prisma from '@/prisma/prisma';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

export interface CreateChatMessage {
  userId: string;
  chatId: string;
  parentId?: string | null;
  messages: string;
  calculatedPrice: Decimal;
  tokenUsed: number;
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

  static async findUserMessageByChatId(chatId: string) {
    let where: Prisma.ChatMessagesWhereInput = {
      chatId,
      isDeleted: false,
    };
    return await prisma.chatMessages.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  static async delete(id: string, userId: string) {
    const chatMessage = await prisma.chatMessages.findUnique({ where: { id } });
    if (chatMessage) {
      await prisma.chatMessages.delete({ where: { id, userId } });
    }
  }

  static async deleteByChatId(chatId: string, userId: string) {
    return await prisma.chatMessages.deleteMany({
      where: { chatId, AND: { userId } },
    });
  }

  static async checkIsFirstChat(chatId: string) {
    const message = await prisma.chatMessages.findFirst({ where: { chatId } });
    return message;
  }

  static async findMessageById(id: string) {
    return await prisma.chatMessages.findUnique({ where: { id } });
  }
}
