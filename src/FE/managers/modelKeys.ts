import { BadRequest } from '@/utils/error';

import { ChatModelManager } from './models';

import prisma from '@/prisma/prisma';
import { Prisma } from '@prisma/client';

export class ModelKeysManager {
  static async findById(id: string) {
    const modelKeys = await prisma.modelKeys.findUnique({ where: { id } });
    return {
      ...modelKeys,
      configs: JSON.parse(modelKeys?.configs || '{}'),
    };
  }

  static async findConfigsById(id: string) {
    const modelKeys = await prisma.modelKeys.findFirst({ where: { id } });
    return JSON.parse(modelKeys?.configs || '{}');
  }

  static async create(params: Prisma.ModelKeysCreateInput) {
    return await prisma.modelKeys.create({ data: { ...params } });
  }

  static async update(params: Prisma.ModelKeysUpdateInput) {
    return await prisma.modelKeys.update({
      where: { id: params.id?.toString() },
      data: { ...params },
    });
  }

  static async findAll() {
    return await prisma.modelKeys.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async delete(id: string) {
    const chatModel = await ChatModelManager.findModelByModelKeyId(id);
    if (chatModel) {
      throw new BadRequest('This key is used by the model');
    }
    await prisma.modelKeys.delete({
      where: { id },
    });
  }
}
