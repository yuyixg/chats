import prisma from '@/db/prisma';

export interface CreateUserModel {
  userId: string;
  models: string;
}

export class UserModelManager {
  static async findUserEnableModels(userId: string) {
    const userModel = await prisma.userModels.findFirst({
      where: { userId },
    });
    const models = JSON.parse(userModel?.models || '[]') as any[];
    return models.filter((x) => x.enabled).map((x) => x.modelId) || [];
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
      include: { user: { select: { username: true, role: true } } },
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
    id: string,
    modelId: string,
    token: number
  ) {
    const userModel = await prisma.userModels.findUnique({ where: { id } });
    let models = JSON.parse(userModel?.models || '[]') as any[];
    models = models.map((m) => {
      if (m.modelId === modelId) {
        if (m.tokens && m.tokens !== null) {
          m.tokens -= token;
        }
        if (m.counts && m.counts !== null) {
          m.counts -= 1;
        }
      }
      return m;
    });

    return await prisma.userModels.update({
      where: {
        id,
      },
      data: {
        models: JSON.stringify(models),
      },
    });
  }
}
