import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { Message } from '@/types/chat';

class ChatMessages extends Model<
  InferAttributes<ChatMessages>,
  InferCreationAttributes<ChatMessages>
> {
  declare id?: string;
  declare userId: string;
  declare modelId: string;
  declare messages: Message[];
  declare name: string;
  declare prompt: string;
  declare tokenCount: number;
  declare chatCount: number;
}

ChatMessages.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userId: { type: DataTypes.UUID },
    modelId: { type: DataTypes.UUID },
    messages: { type: DataTypes.JSON },
    name: { type: DataTypes.STRING },
    prompt: { type: DataTypes.STRING },
    tokenCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    chatCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize: connection,
    tableName: 'chat_messages',
  }
);

export default ChatMessages;
