import { UserModels, Users } from '@/dbs';
import { UserModel } from '@/dbs/userModels';
import { Op } from 'sequelize';

interface UserModelsWithRelations extends UserModels {
  User: Users;
}

export interface CreateUserModel {
  userId: string;
  models: UserModel[];
}

export class UserModelManager {
  static async findEnableModels(userId: string) {
    const userModels = await UserModels.findOne({
      where: {
        userId,
      },
    });
    return (
      userModels?.models.filter((x) => x.enable).map((x) => x.modelId) || []
    );
  }

  static async createUserModel(params: CreateUserModel) {
    return await UserModels.create(params);
  }

  static async findUserModel(userId: string, modelId: string) {
    const data = await UserModels.findOne({
      where: {
        userId,
      },
    });
    const model = data?.models.find((x) => x.enable && x.modelId === modelId);
    return model ? { ...model, id: data?.id } : null;
  }

  static async findUsersModel(query: string) {
    const data = await UserModels.findAll({
      attributes: ['id', 'userId', 'models'],
      include: [
        {
          attributes: ['username', 'role'],
          model: Users,
          where: { username: { [Op.like]: `%${query}%` } },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return data as UserModelsWithRelations[];
  }

  static async updateUserModel(id: string, models: UserModel[]) {
    return await UserModels.update(
      { models },
      {
        where: {
          id,
        },
      }
    );
  }

  static async updateUserModelTokenCount(
    id: string,
    modelId: string,
    token: number
  ) {
    const userModel = await UserModels.findByPk(id);
    const models = userModel?.models.map((m) => {
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

    return await UserModels.update(
      { models },
      {
        where: {
          id,
        },
      }
    );
  }
}
