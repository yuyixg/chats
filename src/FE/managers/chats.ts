import { UserRole } from '@/types/admin';

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

export interface FindChatsByPaging {
  query?: string;
  userId: string;
  page: number;
  pageSize: number;
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
    const now = new Date();
    const SevenDaysAgo = new Date(now);
    SevenDaysAgo.setDate(now.getDate() - 6);

    return await prisma.chats.findMany({
      where: {
        userId,
        isDeleted: false,
        createdAt: {
          gte: SevenDaysAgo,
          lt: now,
        },
      },
      include: { chatModel: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async findChatsByPaging(params: FindChatsByPaging) {
    const { userId, query, page, pageSize } = params;
    const where: Prisma.ChatsWhereInput = {
      userId,
      isDeleted: false,
    };

    if (query) {
      where.title = { contains: query };
    }

    const rows = await prisma.chats.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { chatModel: true },
      orderBy: { createdAt: 'desc' },
    });

    const count = await prisma.chats.count({
      where,
    });

    return { rows, count };
  }

  static async delete(id: string) {
    return await prisma.chats.update({
      where: { id },
      data: { isDeleted: true },
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

    const chats = await prisma.chats.findMany({
      where: {
        user: {
          role: { notIn: [UserRole.admin] },
          username: query ? { equals: query } : {},
        },
      },
      include: {
        user: { select: { username: true } },
        chatModel: { select: { name: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.chats.count({
      where: {
        user: {
          role: { notIn: [UserRole.admin] },
          username: query ? { equals: query } : {},
        },
      },
    });
    return { rows: chats, count };
  }
}
