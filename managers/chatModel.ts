import { BalanceType } from '@/types/order';

import { CreateChatMessage } from './chatMessages';
import { UpdateChat } from './chats';

import prisma from '@/prisma/prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import Decimal from 'decimal.js';

type TX = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface ChatRecord {
  userId: string;
  tokenUsed: number;
  calculatedPrice: Decimal;
  userMessageText: string;
  chatId: string;
  isFirstChat: boolean;
  chatModelId: string;
  updateChatParams: UpdateChat;
  createChatMessageParams: CreateChatMessage;
}

export class ChatModelRecordManager {
  static async recordTransfer(params: ChatRecord) {
    const {
      userId,
      isFirstChat,
      chatModelId,
      tokenUsed,
      calculatedPrice,
      userMessageText,
      createChatMessageParams,
      updateChatParams,
    } = params;
    prisma.$transaction(async (tx) => {
      if (isFirstChat) {
        updateChatParams.title =
          userMessageText.length > 30
            ? userMessageText.substring(0, 30) + '...'
            : userMessageText;
      }
      await this.updateChat(tx, updateChatParams);
      const chatMessage = await this.createChatMessage(
        tx,
        createChatMessageParams,
      );
      await this.updateUserModelTokenCount(tx, userId, chatModelId, tokenUsed);
      await this.chatUpdateBalance(tx, userId, calculatedPrice, chatMessage.id);
    });
  }

  static async getIsFirstChat(tx: TX, chatId: string) {
    const count = await tx.chatMessages.count({ where: { chatId } });
    return count === 0;
  }

  static async createChatMessage(tx: TX, params: CreateChatMessage) {
    return await tx.chatMessages.create({ data: { ...params } });
  }

  static async updateUserModelTokenCount(
    tx: TX,
    userId: string,
    modelId: string,
    token: number,
  ) {
    const userModel = await tx.userModels.findFirst({ where: { userId } });
    let models = JSON.parse(userModel?.models || '[]') as any[];
    models = models.map((m) => {
      if (m.modelId === modelId) {
        if (m.tokens && m.tokens !== '-') {
          m.tokens -= token;
        }
        if (m.counts && m.counts !== '-') {
          m.counts -= 1;
        }
      }
      return m;
    });

    return await tx.userModels.update({
      where: {
        id: userModel?.id,
      },
      data: {
        models: JSON.stringify(models),
      },
    });
  }

  static async chatUpdateBalance(
    tx: TX,
    userId: string,
    value: Decimal,
    messageId: string,
  ) {
    const userBalance = await tx.userBalances.findFirst({
      where: { userId },
    });
    const _value = value.negated();
    const result = await tx.userBalances.update({
      where: { id: userBalance?.id },
      data: { balance: new Decimal(userBalance!.balance).add(_value) },
    });
    await tx.balanceLogs.create({
      data: {
        userId,
        value,
        type: BalanceType.Consume,
        createUserId: userId,
        messageId,
      },
    });
    return result;
  }

  static async updateChat(tx: TX, params: UpdateChat) {
    return await tx.chats.update({
      where: { id: params.id },
      data: { ...params },
    });
  }
}
