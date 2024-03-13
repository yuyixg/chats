import { ChatModels } from '@/dbs';
import { ChatModelApiConfig } from '@/dbs/models';
import {
  ChatModelConfig,
  ChatModelImageConfig,
  ModelType,
  ModelVersions,
} from '@/types/model';

export class ChatModelManager {
  static async findModels(findAll: boolean = false) {
    const where = { enable: true };
    return await ChatModels.findAll({
      where: findAll ? {} : where,
      order: [['rank', 'asc']],
    });
  }

  static async findModelById(id: string) {
    return await ChatModels.findOne({
      where: {
        id,
      },
    });
  }

  static async deleteModelById(id: string) {
    return await ChatModels.destroy({
      where: {
        id,
      },
    });
  }

  static async findModelByName(name: string) {
    return await ChatModels.findOne({
      where: {
        name,
      },
    });
  }

  static async createModel(
    type: ModelType,
    modelVersion: ModelVersions,
    name: string,
    enable: boolean,
    modelConfig: ChatModelConfig,
    apiConfig: ChatModelApiConfig,
    imgConfig: ChatModelImageConfig
  ) {
    return await ChatModels.create({
      type,
      modelVersion,
      name,
      enable,
      modelConfig,
      apiConfig,
      imgConfig,
    });
  }

  static async updateModel(
    id: string,
    name: string,
    enable: boolean,
    modelConfig: ChatModelConfig,
    apiConfig: ChatModelApiConfig,
    imgConfig: ChatModelImageConfig
  ) {
    return await ChatModels.update(
      {
        name,
        enable,
        modelConfig,
        apiConfig,
        imgConfig,
      },
      {
        where: { id },
      }
    );
  }
}
