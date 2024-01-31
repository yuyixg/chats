import { ChatModels, UserModels, Users } from '@/models';

interface UserModelsWithRelations extends UserModels {
  ChatModel: ChatModels;
  User: Users;
}

export class UserModelManager {
  static async findEnableModels(userId: string) {
    const userModels = await UserModels.findAll({
      where: {
        userId,
        enable: true,
      },
    });
    return userModels.map((x) => x.modelId);
  }

  static async createBulkUserModel(records: UserModels[]) {
    return await UserModels.bulkCreate(records);
  }

  static async findUserModel(userId: string, modelId: string) {
    return (await UserModels.findOne({
      where: {
        userId,
        modelId,
        enable: true,
      },
      include: [
        {
          model: ChatModels,
        },
      ],
    })) as UserModelsWithRelations;
  }
}
