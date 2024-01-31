import { ChatModels } from '@/models';

export class ChatModelManager {
  static async findEnableModels() {
    return await ChatModels.findAll({
      where: {
        enable: true,
      },
      order: [['rank', 'DESC']],
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
