import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import connection from './connection';
import { ChatModels } from '.';

class ChatMessages extends Model<
  InferAttributes<ChatMessages>,
  InferCreationAttributes<ChatMessages>
> {
  declare model: ChatModels;
  declare messages: [];
  declare name: string;
  declare prompt: string;
}

ChatMessages.init(
  {
    model: { type: DataTypes.JSON },
    messages: { type: DataTypes.JSON },
    name: { type: DataTypes.STRING },
    prompt: { type: DataTypes.STRING },
  },
  {
    sequelize: connection,
    tableName: 'chat_messages',
  }
);

export default ChatMessages;
