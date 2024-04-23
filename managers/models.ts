import prisma from '@/prisma/prisma';
import { ModelType, ModelVersions } from '@/types/model';
import { Prisma } from '@prisma/client';

export class ChatModelManager {
  static async findModels(findAll: boolean = false) {
    const where = { enabled: true };
    return await prisma.chatModels.findMany({
      where: findAll ? {} : where,
      orderBy: [{ enabled: 'desc' }, { rank: 'asc' }, { createdAt: 'asc' }],
    });
  }

  static async findModelById(id: string) {
    const model = await prisma.chatModels.findUnique({ where: { id } });
    return {
      ...model,
      fileConfig: JSON.parse(model?.fileConfig || '{}'),
      modelConfig: JSON.parse(model?.modelConfig || '{}'),
      priceConfig: JSON.parse(model?.priceConfig || '{}'),
    };
  }

  static async findModelByModelKeyId(modelKeysId: string) {
    return await prisma.chatModels.findFirst({
      where: { modelKeysId },
    });
  }

  static async deleteModelById(id: string) {
    return await prisma.chatModels.delete({ where: { id } });
  }

  static async createModel(params: Prisma.ChatModelsCreateInput) {
    return await prisma.chatModels.create({
      data: {
        ...params,
      },
    });
  }

  static async updateModel(
    id: string,
    name: string,
    enabled: boolean,
    fileServerId: string,
    fileConfig: string,
    modelConfig: string,
    priceConfig: string,
    remarks: string
  ) {
    return await prisma.chatModels.update({
      where: { id },
      data: {
        name,
        enabled,
        fileServerId,
        fileConfig,
        priceConfig,
        modelConfig,
        remarks,
      },
    });
  }
}
