import prisma from '@/db/prisma';
import { PayServiceType } from '@/types/pay';

export interface CreatePayService {
  type: string;
  enabled: boolean;
  configs: string;
}

export interface UpdatePayService extends CreatePayService {
  id: string;
}

export class PayServiceManager {
  static async findById(id: string) {
    const service = await prisma.payServices.findUnique({ where: { id } });
    return {
      ...service,
      configs: JSON.parse(service?.configs || '{}'),
    };
  }

  static async findConfigsByType(type: PayServiceType) {
    const service = await prisma.payServices.findFirst({ where: { type } });
    return JSON.parse(service?.configs || '{}');
  }

  static async create(params: CreatePayService) {
    return await prisma.payServices.create({ data: { ...params } });
  }

  static async update(params: UpdatePayService) {
    return await prisma.payServices.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async findAll() {
    return await prisma.payServices.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAllEnabled() {
    return await prisma.payServices.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
