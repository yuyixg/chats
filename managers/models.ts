import prisma from '@/prisma/prisma';
import { ModelProviders, ModelType, ModelVersions } from '@/types/model';
import { InternalServerError } from '@/utils/error';

interface CreateModel {
  name: string;
  isDefault: boolean;
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  enabled?: boolean;
  modelKeysId?: string;
  fileServerId?: string;
  fileConfig?: string;
  modelConfig?: string;
  priceConfig?: string;
  remarks?: string;
}
interface UpdateModel {
  id: string;
  name: string;
  isDefault: boolean;
  enabled?: boolean;
  modelKeysId?: string;
  fileServerId?: string;
  fileConfig?: string;
  modelConfig: string;
  priceConfig: string;
  remarks: string;
}

export class ChatModelManager {
  static async findModels(findAll: boolean = false) {
    const where = { enabled: true };
    return await prisma.chatModels.findMany({
      where: findAll ? {} : where,
      orderBy: [{ enabled: 'desc' }, { rank: 'asc' }, { createdAt: 'asc' }],
    });
  }

  static async findModelById(id: string) {
    const model = await prisma.chatModels.findUnique({
      include: { ModelKeys: true },
      where: { id },
    });
    if (!model) {
      throw new InternalServerError('Model not found');
    }
    return {
      id: model.id,
      enabled: model.enabled,
      modelProvider: model.modelProvider as ModelProviders,
      modelVersion: model.modelVersion as ModelVersions,
      apiConfig: JSON.parse(model.ModelKeys?.configs || '{}'),
      fileConfig: JSON.parse(model.fileConfig || '{}'),
      modelConfig: JSON.parse(model.modelConfig || '{}'),
      priceConfig: JSON.parse(model.priceConfig || '{}'),
    };
  }

  static async findModelByModelKeyId(modelKeysId: string) {
    return await prisma.chatModels.findFirst({
      where: { modelKeysId },
    });
  }

  static async findDefaultModels() {
    return await prisma.chatModels.findMany({
      where: { isDefault: true },
    });
  }

  static async deleteModelById(id: string) {
    return await prisma.chatModels.delete({ where: { id } });
  }

  static async createModel(params: CreateModel) {
    return await prisma.chatModels.create({
      data: {
        ...params,
      },
    });
  }

  static async updateModel(params: UpdateModel) {
    return await prisma.chatModels.update({
      where: { id: params.id },
      data: {
        ...params,
      },
    });
  }
}
