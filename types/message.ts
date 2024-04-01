import { Message } from '@/types/chat';
import { Model } from 'sequelize';
import { ModelType } from './model';

export interface UserChatMessage extends Model {
  User: {
    username: string;
    role: string;
  };
  ChatModel: {
    name: string;
    fileConfig: string;
    id: string;
    modelVersion: string;
    systemPrompt: string;
    type: ModelType;
    fileServerId: string;
  };
  id?: string;
  userId: string;
  modelId: string;
  messages: Message[];
  name: string;
  prompt: string;
  tokenCount: number;
  chatCount: number;
  totalPrice: number;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}
