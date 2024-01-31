import { UserModels, Users } from '@/models';
import { ChatModelManager, UserModelManager } from '.';

export class UserManager {
  static async findUserById(userId: string) {
    return await Users.findByPk(userId);
  }

  static async initUser(
    id: string,
    permissions: string[] = [],
    userInfo: Object = {}
  ) {
    const models = await ChatModelManager.findEnableModels();
    const user = await Users.create({
      id,
      permissions,
      userInfo,
    });
    const userModels = models.map((x) => {
      return {
        userId: user.id,
        modelId: x.id,
      } as UserModels;
    });
    await UserModelManager.createBulkUserModel(userModels);
    return user;
  }
}
