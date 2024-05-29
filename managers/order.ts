import { OrderStatus } from '@/types/order';

import prisma from '@/prisma/prisma';

export interface CreateOrder {
  createUserId: string;
  amount: number;
  outTradeNo: string;
}

export interface CreateOrderCounterfoil {
  info: string;
  orderId: string;
}

export class OrdersManager {
  static async findById(id: string) {
    return await prisma.orders.findUnique({ where: { id } });
  }

  static async createOrder(params: CreateOrder) {
    return await prisma.orders.create({
      data: { ...params, status: OrderStatus.Waiting },
    });
  }

  static async updateOrderStatus(id: string, status: OrderStatus) {
    return await prisma.orders.update({
      where: { id },
      data: { status },
    });
  }

  static async createOrderCounterfoil(params: CreateOrderCounterfoil) {
    return await prisma.counterfoils.create({ data: { ...params } });
  }
}
