import prisma from '@/db/prisma';
import bcrypt from 'bcryptjs';
import { UserBalancesManager, UserModelManager } from '.';
import Decimal from 'decimal.js';

export interface CreateUser {
  username: string;
  password: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
  provider?: string;
  sub?: string;
}

export interface UpdateUser {
  id: string;
  username: string;
  password: string;
  role: string;
}

export class UsersManager {
  static async findByUserId(id: string) {
    return await prisma.users.findUnique({ where: { id } });
  }

  static async findByUserByProvider(provider: string, sub: string) {
    return await prisma.users.findFirst({ where: { provider, sub } });
  }

  static async findByUsername(username: string) {
    return await prisma.users.findFirst({
      where: { username: username.toLowerCase() },
    });
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
    const { password } = params;
    let hashPassword = await bcrypt.hashSync(password);
    return prisma.users.create({
      data: {
        ...params,
        password: hashPassword,
      },
    });
  }

  static async findUsers(query: string) {
    return await prisma.users.findMany({
      include: { userBalances: { select: { balance: true } } },
      where: {
        username: {
          contains: query,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async updateUserPassword(id: string, password: string) {
    return await prisma.users.update({ where: { id }, data: { password } });
  }

  static async updateUser(params: UpdateUser) {
    return await prisma.users.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async initialUser(userId: string, createUserId?: string) {
    await UserModelManager.createUserModel({
      userId: userId,
      models: '[]',
    });
    await UserBalancesManager.createBalance(
      userId,
      new Decimal(0),
      createUserId || userId
    );
  }
}
