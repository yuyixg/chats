import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import connection from './connection';
import { ChatModelImageConfig, ModelIds, ChatModelConfig } from '@/types/model';
import { ModelType } from 'aws-sdk/clients/comprehend';

export interface ChatModelApiConfig {
  appId?: string;
  type?: string;
  host?: string;
  apiKey?: string;
  secret?: string;
  version?: string;
  organization?: string;
}

class ChatModels extends Model<
  InferAttributes<ChatModels>,
  InferCreationAttributes<ChatModels>
> {
  declare id: ModelIds;
  declare name: string;
  declare type: ModelType;
  declare imgConfig?: ChatModelImageConfig;
  declare apiConfig: ChatModelApiConfig;
  declare modelConfig: ChatModelConfig;
  declare rank?: number;
  declare enable?: boolean;
}

ChatModels.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    modelConfig: { type: DataTypes.JSON },
    imgConfig: { type: DataTypes.JSON },
    apiConfig: { type: DataTypes.JSON },
    rank: { type: DataTypes.INTEGER },
    enable: { type: DataTypes.BOOLEAN },
  },
  {
    sequelize: connection,
    tableName: 'chat_models',
  }
);

export default ChatModels;
