import { Users } from '@/models';

export class UserManager {
  static async findUserById(userId: string) {
    return await Users.findByPk(userId);
  }

  static async createUser(
    id: string,
    modelIds: string[] = [],
    permissions: string[] = [],
    userInfo: Object = {}
  ) {
    return await Users.create({
      id,
      modelIds,
      permissions,
      userInfo,
    });
  }
}
