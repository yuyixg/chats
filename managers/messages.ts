import { ChatMessages } from '@/models';
import { Message } from '@/types/chat';

export interface CreateMessage {
  id: string;
  messages: Message[];
  modelId: string;
  userId: string;
  prompt: string;
  tokenCount: number;
  chatCount: number;
}

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

  static async createMessage(params: CreateMessage) {
    const { id, messages, modelId, userId, prompt, tokenCount, chatCount } =
      params;
    return await ChatMessages.create({
      id,
      messages,
      modelId,
      name: messages[0].content.text!.substring(0, 30),
      userId,
      prompt,
      tokenCount,
      chatCount: 1,
    });
  }
}
