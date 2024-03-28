import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import {
  ChatModelFileConfig,
  ModelVersions,
  ChatModelConfig,
} from '@/types/model';
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
  declare id?: string;
  declare modelVersion: ModelVersions;
  declare name: string;
  declare type: ModelType;
  declare fileConfig?: ChatModelFileConfig;
  declare apiConfig: ChatModelApiConfig;
  declare modelConfig: ChatModelConfig;
  declare fileServerId?: string;
  declare rank?: number;
  declare enabled?: boolean;
}

ChatModels.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    fileServerId: { type: DataTypes.STRING },
    modelVersion: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    modelConfig: { type: DataTypes.JSON },
    fileConfig: { type: DataTypes.JSON },
    apiConfig: { type: DataTypes.JSON },
    rank: { type: DataTypes.INTEGER },
    enabled: { type: DataTypes.BOOLEAN },
  },
  {
    sequelize: connection,
    tableName: 'chat_models',
  }
);

export default ChatModels;
