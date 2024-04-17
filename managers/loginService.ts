import prisma from '@/db/prisma';
import { ProviderType } from '@/types/user';
import { LoginTemplateAllProperty } from '@/utils/login';

export interface CreateLoginService {
  type: string;
  enabled: boolean;
  configs: string;
}

export interface UpdateLoginService extends CreateLoginService {
  id: string;
}

export class LoginServiceManager {
  static async findById(id: string) {
    const service = await prisma.loginServices.findUnique({ where: { id } });
    return {
      ...service,
      configs: JSON.parse(service?.configs || '{}'),
    };
  }

  static async findConfigsByType(type: ProviderType) {
    const service = await prisma.loginServices.findFirst({ where: { type } });
    return JSON.parse(service?.configs || '{}') as LoginTemplateAllProperty;
  }

  static async create(params: CreateLoginService) {
    return await prisma.loginServices.create({ data: { ...params } });
  }

  static async update(params: UpdateLoginService) {
    return await prisma.loginServices.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async findAll() {
    return await prisma.loginServices.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAllEnabled() {
    return await prisma.loginServices.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
