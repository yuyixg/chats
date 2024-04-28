import prisma from '@/prisma/prisma';
import { ChatMessagesManager } from './chatMessages';

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
  isShared?: boolean;
  displayingLeafChatMessageNodeId: string;
}

export class ChatsManager {
  static async findByUserChatId(id: string, userId: string) {
    return await prisma.chats.findUnique({ where: { id, AND: { userId } } });
  }
  static async create(params: CreateChat) {
    return await prisma.chats.create({ data: { ...params } });
  }

  static async update(params: UpdateChat) {
    if (!(await ChatMessagesManager.checkIsFirstChat(params.id))) {
      delete params.title;
    }
    return await prisma.chats.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async findUserChats(userId: string) {
    return await prisma.chats.findMany({
      where: { userId, isDeleted: false },
      include: { chatModel: true },
    });
  }

  static async delete(id: string) {
    return await prisma.chats.delete({
      where: { id },
    });
  }
}
