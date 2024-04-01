import { Users } from '@/db';
import prisma from '@/db/prisma';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export interface CreateUser {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUser {
  id: string;
  username: string;
  password: string;
  role: string;
}

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

  static async createUser(params: CreateUser) {
    const { username, password, role } = params;
    let hashPassword = await bcrypt.hashSync(password);
    return await Users.create({
      username,
      password: hashPassword,
      role,
    });
  }

  static async findUsers(query: string) {
    return await Users.findAll({
      where: { username: { [Op.like]: `%${query}%` } },
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateUserPassword(id: string, password: string) {
    return await Users.update(
      { password },
      {
        where: { id },
      }
    );
  }

  static async updateUser(params: UpdateUser) {
    return await Users.update(params, {
      where: {
        id: params.id,
      },
    });
  }
}
