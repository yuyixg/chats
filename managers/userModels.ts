import { ModelUsage } from '@/types/model';

import prisma from '@/prisma/prisma';

export interface CreateUserModel {
  userId: string;
  models: string;
}

export class UserModelManager {
  static async findUserEnableModels(userId: string): Promise<ModelUsage[]> {
    const userModel = await prisma.userModels.findFirst({
      where: { userId },
    });
    const models = JSON.parse(userModel?.models || '[]') as any[];
    return models.filter((x) => x.enabled);
  }

  static async createUserModel(params: CreateUserModel) {
    return await prisma.userModels.create({ data: { ...params } });
  }

  static async findUserModel(userId: string, modelId: string) {
    const userModel = await prisma.userModels.findFirst({ where: { userId } });
    const models = JSON.parse(userModel?.models || '[]') as any[];
    const model = models.find((x) => x.enabled && x.modelId === modelId);
    return model ? { ...model, id: userModel?.id } : null;
  }

  static async findUserModelByIds(ids: string[]) {
    return await prisma.userModels.findMany({ where: { id: { in: ids } } });
  }

  static async findUsersModel(query: string) {
    return await prisma.userModels.findMany({
      include: {
        user: {
          include: { userBalances: { select: { balance: true } } },
        },
      },
      where: {
        OR: [
          {
            user: { username: { contains: query } },
          },
          { user: { role: { contains: query } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUserModel(id: string, models: string) {
    return await prisma.userModels.update({
      where: { id },
      data: { models },
    });
  }

  static async updateUserModelTokenCount(
    userId: string,
    modelId: string,
    token: number,
  ) {
    const userModel = await prisma.userModels.findFirst({ where: { userId } });
    let models = JSON.parse(userModel?.models || '[]') as any[];
    models = models.map((m) => {
      if (m.modelId === modelId) {
        if (m.tokens && m.tokens !== '-') {
          m.tokens -= token;
        }
        if (m.counts && m.counts !== '-') {
          m.counts -= 1;
        }
      }
      return m;
    });

    return await prisma.userModels.update({
      where: {
        id: userModel?.id,
      },
      data: {
        models: JSON.stringify(models),
      },
    });
  }

  static async findUserModelUsage(userId: string, modelId: string) {
    const userModels = await this.findUserEnableModels(userId);
    return userModels.find((x) => x.modelId === modelId);
  }
}
