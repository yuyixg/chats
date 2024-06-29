import { calculateMessages } from '@/utils/message';

import { Role } from '@/types/chat';
import { MessageNode } from '@/types/chatMessage';

import { ChatModelManager } from './models';

import prisma from '@/prisma/prisma';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

export interface CreateChatMessage {
  role: Role;
  userId: string;
  chatId: string;
  messages: string;
  parentId?: string | null;
  inputPrice?: Decimal;
  outputPrice?: Decimal;
  inputTokens?: number;
  outputTokens?: number;
  chatModelId?: string;
  duration?: number;
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
        inputTokens: x.inputTokens,
        outputTokens: x.outputTokens,
        inputPrice: x.inputPrice,
        outputPrice: x.outputPrice,
        role: x.role,
        content: JSON.parse(x.messages),
        modelName: chatModels.find((m) => m.id === x.chatModelId)?.name,
        duration: x.duration,
      } as MessageNode;
    });
    return calculateMessages(messages);
  }

  static async deleteByChatId(chatId: string, userId: string) {
    return await prisma.chatMessages.deleteMany({
      where: { chatId, AND: { userId } },
    });
  }

  static async delete(id: string, userId: string) {
    return await prisma.chatMessages.delete({
      where: { id, userId },
    });
  }

  static async checkIsFirstChat(chatId: string) {
    const count = await prisma.chatMessages.count({
      where: { chatId, role: { notIn: ['system'] } },
    });
    return count === 0;
  }

  static async findMessageById(id: string) {
    return await prisma.chatMessages.findUnique({ where: { id } });
  }
}
