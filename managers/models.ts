import prisma from '@/prisma/prisma';
import { ModelType, ModelVersions } from '@/types/model';

export class ChatModelManager {
  static async findModels(findAll: boolean = false) {
    const where = { enabled: true };
    return await prisma.chatModels.findMany({
      where: findAll ? {} : where,
      orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
    });
  }

  static async findModelById(id: string) {
    const model = await prisma.chatModels.findUnique({ where: { id } });
    return {
      ...model,
      fileConfig: JSON.parse(model?.fileConfig || '{}'),
      apiConfig: JSON.parse(model?.apiConfig || '{}'),
      modelConfig: JSON.parse(model?.modelConfig || '{}'),
      priceConfig: JSON.parse(model?.priceConfig || '{}'),
    };
  }

  static async deleteModelById(id: string) {
    return await prisma.chatModels.delete({ where: { id } });
  }

  static async createModel(
    type: ModelType,
    modelVersion: ModelVersions,
    name: string,
    enabled: boolean,
    fileServerId: string,
    fileConfig: string,
    apiConfig: string,
    modelConfig: string,
    priceConfig: string,
    remarks: string
  ) {
    return await prisma.chatModels.create({
      data: {
        type,
        modelVersion,
        name,
        enabled,
        fileServerId,
        fileConfig,
        priceConfig,
        modelConfig,
        apiConfig,
        remarks,
      },
    });
  }

  static async updateModel(
    id: string,
    name: string,
    enabled: boolean,
    fileServerId: string,
    fileConfig: string,
    apiConfig: string,
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
        apiConfig,
        remarks,
      },
    });
  }
}
