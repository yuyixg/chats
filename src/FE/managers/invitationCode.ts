import prisma from '@/prisma/prisma';
import { equal } from 'assert';

export interface CreateInvitationCode {
  value: string;
  createUserId: string;
  count: number;
}

export class InvitationCodeManager {
  static async create(params: CreateInvitationCode) {
    const { value, createUserId, count } = params;
    return await prisma.invitationCode.create({
      data: { value, createUserId, count },
    });
  }

  static async updateCodeCount(id: string, count: number) {
    await prisma.invitationCode.update({ where: { id }, data: { count } });
  }

  static async delete(id: string) {
    await prisma.invitationCode.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  static async find() {
    return await prisma.invitationCode.findMany({
      where: { isDeleted: { equals: false } },
      include: {
        user: {
          select: { username: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return await prisma.invitationCode.findFirst({ where: { id } });
  }

  static async findByCode(code: string) {
    return await prisma.invitationCode.findFirst({
      where: { value: code },
    });
  }

  static async verifyCode(code: string) {
    return await prisma.invitationCode.findFirst({
      where: { value: code },
    });
  }

  static async createUserInvitation(userId: string, invitationCodeId: string) {
    return await prisma.userInvitation.create({
      data: { userId, invitationCodeId },
    });
  }
}
