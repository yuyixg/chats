import { ChatModels, UserModels, Users } from '@/models';
import { Op } from 'sequelize';

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
    const data = await UserModels.findOne({
      where: {
        userId,
        modelId,
        enable: true,
      },
      include: [
        {
          model: ChatModels,
        },
        {
          attributes: ['userName'],
          model: Users,
        },
      ],
    });
    return data as UserModelsWithRelations;
  }

  static async findUsersModel(userIds: string[]) {
    const data = await UserModels.findAll({
      attributes: ['id', 'userId', 'expires', 'counts', 'enable'],
      include: [
        {
          attributes: ['id'],
          model: ChatModels,
        },
        {
          attributes: ['userName', 'role'],
          model: Users,
        },
      ],
      where: {
        userId: { [Op.in]: userIds },
      },
    });
    return data as UserModelsWithRelations[];
  }
}
