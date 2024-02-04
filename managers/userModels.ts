import { ChatModels, UserModels, Users } from '@/models';
import { UserModel } from '@/models/userModels';
import { Op, where } from 'sequelize';

interface UserModelsWithRelations extends UserModels {
  User: Users;
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

  static async createUserModel(record: UserModels) {
    return await UserModels.create(record);
  }

  static async findUserModel(userId: string, modelId: string) {
    const data = await UserModels.findOne({
      where: {
        userId,
      },
    });
    const model = data?.models.find((x) => x.enable && x.modelId === modelId);
    return model ? ChatModels.findByPk(model?.modelId) : null;
  }

  static async findUsersModel() {
    const data = await UserModels.findAll({
      attributes: ['id', 'userId', 'models'],
      include: [
        {
          attributes: ['userName', 'role'],
          model: Users,
        },
      ],
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
}
