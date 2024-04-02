import prisma from '@/db/prisma';
import Decimal from 'decimal.js';

export class UserBalancesManager {
  static async updateBalance(userId: string, value: Decimal) {
    const userBalance = await prisma.userBalances.findFirst({
      where: { userId },
    });

    const result = await prisma.userBalances.update({
      where: { id: userBalance?.id },
      data: { balance: new Decimal(userBalance!.balance).sub(value) },
    });

    await prisma.balanceLogs.create({
      data: { userId, value: value.negated() },
    });
    return result;
  }
}
