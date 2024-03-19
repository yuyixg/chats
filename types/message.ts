import { Message } from '@/types/chat';
import { Model } from 'sequelize';

export interface UserChatMessage extends Model {
  User: {
    username: string;
    role: string;
  };
  id?: string;
  userId: string;
  modelId: string;
  messages: Message[];
  name: string;
  prompt: string;
  tokenCount: number;
  chatCount: number;
  createdAt: string;
  updatedAt: string;
}
