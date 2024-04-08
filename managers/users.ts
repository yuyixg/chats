import prisma from '@/db/prisma';
import bcrypt from 'bcryptjs';
import { UserBalancesManager, UserModelManager } from '.';
import Decimal from 'decimal.js';
import { useFetch } from '@/hooks/useFetch';
import { ProviderType } from '@/types/user';

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
  email?: string;
  phone?: string;
  enabled?: boolean;
}

export interface IWeChatLoginResult {
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

  static async findByUsername(username: string) {
    return await prisma.users.findFirst({
      where: { username: username.toLowerCase() },
    });
  }

  static async findByUnique(value: string) {
    const _value = value.toLocaleLowerCase();
    return await prisma.users.findFirst({
      where: {
        OR: [
          {
            username: _value,
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

  static async weChatLogin(code: string) {
    console.log('weChatLogin', code);
    const fetchServer = useFetch();
    const res = await fetchServer.get<IWeChatLoginResult>(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_SECRET}&code=${code}&grant_type=authorization_code`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('weChatLogin res', JSON.stringify(res));
    if (res.errcode) {
      return null;
    } else {
      const user = await this.findByUserByProvider(
        ProviderType.WeChat,
        res.openid
      );
      if (!user) {
        return await this.createUser({
          username: res.openid,
          password: '-',
          role: '-',
          provider: ProviderType.WeChat,
          sub: res.openid,
        });
      }
      return user;
    }
  }
}
