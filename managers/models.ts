import { ChatModels } from '@/models';

export class ChatModelManager {
  static async findModelById(modelId: string) {
    return await ChatModels.findOne({
      where: {
        modelId,
      },
    });
  }
}
