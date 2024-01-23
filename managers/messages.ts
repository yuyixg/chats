import { ChatMessages } from '@/models';
import { Message } from '@/types/chat';

export class ChatMessageManager {
  static async findUserMessageById(id: string, userId: string) {
    return await ChatMessages.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  static async updateMessageById(
    id: string,
    messages: Message[],
    tokenCount: number,
    chatCount: number
  ) {
    return await ChatMessages.update(
      {
        messages,
        tokenCount,
        chatCount,
      },
      {
        where: {
          id,
        },
      }
    );
  }
}
