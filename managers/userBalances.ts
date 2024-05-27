import prisma from '@/prisma/prisma';
import { BalanceType } from '@/types/order';
import Decimal from 'decimal.js';

export class UserBalancesManager {
  static async chatUpdateBalance(
    userId: string,
    value: Decimal,
    messageId: string
  ) {
    const userBalance = await prisma.userBalances.findFirst({
      where: { userId },
    });
    const _value = value.negated();
    const result = await prisma.userBalances.update({
      where: { id: userBalance?.id },
      data: { balance: new Decimal(userBalance!.balance).add(_value) },
    });
    await this.createChatMessageBalanceLog(userId, _value, userId, messageId);
    return result;
  }

  static async createBalance(
    userId: string,
    value: Decimal,
    createUserId: string
  ) {
    await prisma.userBalances.create({ data: { userId, balance: value } });
    await this.createBalanceLog(
      userId,
      value,
      BalanceType.Initial,
      createUserId
    );
  }

  static async updateBalance(
    userId: string,
    value: Decimal,
    createUserId: string
  ) {
    const userBalance = await prisma.userBalances.findUnique({
      where: { userId },
    });
    await prisma.userBalances.update({
      where: { userId },
      data: { userId, balance: userBalance!.balance.add(value) },
    });
    await this.createBalanceLog(
      userId,
      value,
      BalanceType.Recharge,
      createUserId
    );
  }

  static async createChatMessageBalanceLog(
    userId: string,
    value: Decimal,
    createUserId: string,
    messageId: string
  ) {
    await prisma.balanceLogs.create({
      data: {
        userId,
        value,
        type: BalanceType.Consume,
        createUserId,
        messageId,
      },
    });
  }

  static async createBalanceLog(
    userId: string,
    value: Decimal,
    type: BalanceType,
    createUserId: string
  ) {
    await prisma.balanceLogs.create({
      data: { userId, value, type, createUserId },
    });
  }

  static async findUserBalance(userId: string) {
    const userBalance = await prisma.userBalances.findFirst({
      where: { userId },
      select: { balance: true },
    });
    return userBalance!.balance;
  }

  static async findUserBalanceAndLogs(userId: string) {
    const userBalance = await prisma.userBalances.findFirst({
      where: { userId },
      select: { balance: true },
    });
    
    const now = new Date();
    const SevenDaysAgo = new Date(now);
    SevenDaysAgo.setDate(now.getDate() - 7);
    const balanceLogs = await prisma.balanceLogs.findMany({
      where: {
        createdAt: {
          gte: SevenDaysAgo,
          lt: now,
        },
        userId,
      },
      skip: 0,
      take: 7,
      orderBy: { createdAt: 'desc' },
    });
    return {
      balance: userBalance?.balance,
      balanceLogs,
    };
  }
}
