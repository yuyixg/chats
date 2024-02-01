import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import connection from './connection';
import { ModelImageConfig, ModelIds } from '@/types/model';
import { ModelType } from 'aws-sdk/clients/comprehend';

interface ChatModelApiConfig {
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
  declare systemPrompt: string;
  declare maxLength?: number;
  declare tokenLimit?: number;
  declare imgConfig?: ModelImageConfig;
  declare apiConfig: ChatModelApiConfig;
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
    systemPrompt: { type: DataTypes.STRING },
    maxLength: { type: DataTypes.INTEGER },
    tokenLimit: { type: DataTypes.INTEGER },
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
