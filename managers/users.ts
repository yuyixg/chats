import prisma from '@/db/prisma';
import bcrypt from 'bcryptjs';

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
  static async findByUserId(id: string) {
    return await prisma.users.findUnique({ where: { id } });
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
    const { username, password, role } = params;
    let hashPassword = await bcrypt.hashSync(password);
    return prisma.users.create({
      data: {
        username,
        password: hashPassword,
        role,
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
}
