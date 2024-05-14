import prisma from '@/prisma/prisma';
import { Prisma } from '@prisma/client';

export interface CreateChat {
  title: string;
  userId: string;
  chatModelId?: string;
  userModelConfig?: string;
}

export interface UpdateChat {
  id: string;
  title?: string;
  chatModelId?: string;
  userModelConfig?: string;
  isShared?: boolean;
}

export class ChatsManager {
  static async findByUserChatId(id: string, userId: string) {
    return await prisma.chats.findUnique({ where: { id, AND: { userId } } });
  }
  static async create(params: CreateChat) {
    return await prisma.chats.create({ data: { ...params } });
  }

  static async update(params: UpdateChat) {
    return await prisma.chats.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async findUserChats(userId: string) {
    return await prisma.chats.findMany({
      where: { userId, isDeleted: false },
      include: { chatModel: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async delete(id: string) {
    return await prisma.chats.delete({
      where: { id },
    });
  }

  static async findChatById(id: string) {
    return await prisma.chats.findUnique({ where: { id } });
  }

  static async findChatIncludeAllById(id: string) {
    return await prisma.chats.findUnique({
      include: { chatModel: { select: { name: true, modelConfig: true } } },
      where: { id },
    });
  }

  static async findChatsByPage(query: string, page: number, pageSize: number) {
    const where: Prisma.ChatsWhereInput = {};
    if (query) {
      where.title = { contains: query };
    }
    const chats = await prisma.chats.findMany({
      where,
      include: {
        user: { select: { username: true } },
        chatModel: { select: { name: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.chats.count({
      where,
    });
    return { rows: chats, count };
  }
}
