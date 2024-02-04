import { UserModels, Users } from '@/models';
import { ChatModelManager, UserModelManager } from '.';

export class UserManager {
  static async findUserById(userId: string) {
    return await Users.findByPk(userId);
  }

  static async initUser(id: string, userName: string) {
    const models = await ChatModelManager.findEnableModels();
    const user = await Users.create({
      id,
      userName,
    });
    const userModels = models.map((x) => {
      return {
        modelId: x.id,
        enable: false,
      };
    });
    await UserModels.create({
      userId: user.id!,
      models: userModels,
    });
    return user;
  }

  static async findUsers() {
    return await Users.findAll();
  }
}
