import { Message } from '@/types/chat';
import { UserModelManager } from './userModels';
import prisma from '@/db/prisma';
import Decimal from 'decimal.js';

export interface CreateMessage {
  id: string;
  messages: Message[];
  modelId: string;
  userId: string;
  prompt: string;
  tokenCount: number;
  chatCount: number;
  totalPrice: Decimal;
}

export class ChatMessageManager {
  static async findMessageById(id: string) {
    return await prisma.messages.findUnique({ where: { id } });
  }

  static async findUserMessageById(id: string, userId: string) {
    return await prisma.messages.findFirst({ where: { id, userId } });
  }

  static async findMessages(query: string, page: number, pageSize: number) {
    const messages = await prisma.messages.findMany({
      include: {
        user: { select: { username: true, role: true } },
        chatModel: { select: { name: true } },
      },
      where: {
        user: { username: { contains: query } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
    });
    const count = await prisma.messages.count({
      where: {
        user: { username: { contains: query } },
      },
    });
    return { rows: messages, count };
  }

  static async findUserMessages(userId: string) {
    return await prisma.messages.findMany({
      include: {
        chatModel: {
          select: {
            id: true,
            modelVersion: true,
            name: true,
            type: true,
            fileServerId: true,
            fileConfig: true,
            modelConfig: true,
          },
        },
      },
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            isDeleted: false,
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async updateMessageById(
    id: string,
    messages: string,
    tokenCount: number,
    chatCount: number,
    totalPrice: Decimal
  ) {
    return await prisma.messages.update({
      where: { id },
      data: { messages, tokenCount, chatCount, totalPrice },
    });
  }

  static async updateUserMessage(id: string, name: string, isShared: boolean) {
    return await prisma.messages.update({
      where: { id },
      data: { name, isShared },
    });
  }

  static async deleteMessageById(id: string) {
    const message = await this.findMessageById(id);
    if (message) {
      return await prisma.messages.update({
        where: { id },
        data: { isDeleted: true, isShared: false },
      });
    }
  }

  static async createMessage(params: CreateMessage) {
    const { id, messages, modelId, userId, prompt, tokenCount, totalPrice } =
      params;

    return await prisma.messages.create({
      data: {
        id,
        messages: JSON.stringify(messages),
        chatModelId: modelId,
        name: messages[0].content.text!.substring(0, 30),
        userId,
        prompt,
        tokenCount,
        chatCount: 1,
        totalPrice,
      },
    });
  }

  static async recordChat(
    messageId: string,
    userId: string,
    userModelId: string,
    messages: Message[],
    tokenCount: number,
    totalPrice: Decimal,
    promptToSend: string,
    modelId: string
  ) {
    const chatMessages = await prisma.messages.findFirst({
      where: {
        id: messageId,
        userId,
      },
    });
    if (chatMessages) {
      const _totalPrice = new Decimal(totalPrice);
      await ChatMessageManager.updateMessageById(
        chatMessages.id!,
        JSON.stringify(messages),
        tokenCount + chatMessages.tokenCount,
        chatMessages.chatCount + 1,
        _totalPrice.plus(chatMessages.totalPrice)
      );
    } else {
      await ChatMessageManager.createMessage({
        id: messageId,
        messages,
        modelId,
        userId: userId,
        prompt: promptToSend,
        tokenCount,
        chatCount: 1,
        totalPrice,
      });
    }
    await UserModelManager.updateUserModelTokenCount(
      userModelId,
      modelId,
      tokenCount
    );
  }
}
