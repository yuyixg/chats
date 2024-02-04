import { ChatModels } from '@/models';

export class ChatModelManager {
  static async findEnableModels(enable: boolean = true) {
    return await ChatModels.findAll({
      where: {
        enable,
      },
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
}
