import { ChatModels } from '@/models';
import { ChatModelApiConfig } from '@/models/models';
import { ChatModelConfig, ChatModelImageConfig } from '@/types/model';

export class ChatModelManager {
  static async findEnableModels(all: boolean = false) {
    const where = { enable: true };
    return await ChatModels.findAll({
      where: all ? {} : where,
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
