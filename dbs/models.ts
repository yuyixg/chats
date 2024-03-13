import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { ChatModelImageConfig, ModelVersions, ChatModelConfig } from '@/types/model';
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
  declare id: string;
  declare modelVersion: ModelVersions;
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
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    modelVersion: { type: DataTypes.STRING },
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
