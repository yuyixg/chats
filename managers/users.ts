import { Users } from '@/models';
import bcrypt from 'bcryptjs';

export class UsersManager {
  static async findByUserId(userId: string) {
    return await Users.findByPk(userId);
  }

  static async findByUsername(username: string) {
    const users = await Users.findOne({
      where: { username: username?.toLowerCase() },
    });
    return users;
  }

  static async singIn(username: string, password: string) {
    const user = await this.findByUsername(username);
    if (user) {
      const match = await bcrypt.compareSync(password, user.password);
      if (match) {
        return user;
      }
    }
    return null;
  }

  static async createUser(username: string, password: string) {
    return await Users.create({
      username,
      password,
    });
  }

  static async findUsers() {
    return await Users.findAll();
  }
}
