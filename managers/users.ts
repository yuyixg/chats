import prisma from '@/prisma/prisma';
import bcrypt from 'bcryptjs';
import { ChatModelManager, UserBalancesManager, UserModelManager } from '.';
import Decimal from 'decimal.js';
import { ProviderType } from '@/types/user';
import { weChatAuth } from '@/utils/weChat';
import { LoginServiceManager } from './loginService';

export interface CreateUser {
  account?: string;
  username?: string;
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
  email?: string;
  phone?: string;
  enabled?: boolean;
}

export interface IWeChatAuthResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  errcode: string;
  errmsg: string;
}

export class UsersManager {
  static async findByUserId(id: string) {
    return await prisma.users.findUnique({ where: { id } });
  }

  static async findByUserByProvider(provider: string, sub: string) {
    return await prisma.users.findFirst({ where: { provider, sub } });
  }

  static async findByAccount(account: string) {
    return await prisma.users.findFirst({
      where: { account: account?.toLowerCase() },
    });
  }

  static async findByUnique(value: string) {
    const _value = value.toLocaleLowerCase();
    return await prisma.users.findFirst({
      where: {
        OR: [
          {
            account: _value,
          },
          {
            phone: _value,
          },
          {
            email: _value,
          },
        ],
        AND: [
          {
            enabled: true,
          },
        ],
      },
    });
  }

  static async singIn(username: string, password: string) {
    const user = await this.findByUnique(username);
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
        OR: [
          {
            username: { contains: query },
          },
          {
            phone: { contains: query },
          },
          {
            email: { contains: query },
          },
        ],
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
    const chatModels = await ChatModelManager.findDefaultModels();
    const userModels = chatModels.map((x) => ({
      modelId: x.id,
      enabled: true,
      tokens: '-',
      counts: '-',
      expires: '-',
    }));
    await UserModelManager.createUserModel({
      userId: userId,
      models: JSON.stringify(userModels),
    });
    await UserBalancesManager.createBalance(
      userId,
      new Decimal(0),
      createUserId || userId
    );
  }

  static async weChatLogin(code: string) {
    const configs = await LoginServiceManager.findConfigsByType(
      ProviderType.WeChat
    );
    const result = await weChatAuth(configs.appId, configs.secret, code);
    if (!result) {
      return null;
    }
    let user = await this.findByUserByProvider(
      ProviderType.WeChat,
      result.openid
    );
    if (!user) {
      user = await this.createUser({
        account: result.openid,
        username: '微信用户',
        password: '-',
        role: '-',
        provider: ProviderType.WeChat,
        sub: result.openid,
      });
      await this.initialUser(user.id);
    }
    return user;
  }
}
