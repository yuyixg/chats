import prisma from '@/prisma/prisma';
import { ModelType, ModelVersions } from '@/types/model';
import { InternalServerError } from '@/utils/error';

interface CreateModel {
  name: string;
  type: ModelType;
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
      modelVersion: model.modelVersion,
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
