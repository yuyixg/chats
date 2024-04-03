import prisma from '@/db/prisma';
import Decimal from 'decimal.js';

export class UserBalancesManager {
  static async chatUpdateBalance(userId: string, value: Decimal) {
    const userBalance = await prisma.userBalances.findFirst({
      where: { userId },
    });
    const _value = value.negated();
    const result = await prisma.userBalances.update({
      where: { id: userBalance?.id },
      data: { balance: new Decimal(userBalance!.balance).add(_value) },
    });
    await this.createBalanceLog(userId, _value, userId);
    return result;
  }

  static async createBalance(
    userId: string,
    value: Decimal,
    createUserId: string
  ) {
    await prisma.userBalances.create({ data: { userId, balance: value } });
    await this.createBalanceLog(userId, value, createUserId);
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
    await this.createBalanceLog(userId, value, createUserId);
  }

  static async createBalanceLog(
    userId: string,
    value: Decimal,
    createUserId: string
  ) {
    await prisma.balanceLogs.create({
      data: { userId, value, createUserId },
    });
  }
}
