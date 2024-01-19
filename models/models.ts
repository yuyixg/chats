import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { ModelIds } from '@/types/model';
import { ModelType } from 'aws-sdk/clients/comprehend';

class ChatModels extends Model<
  InferAttributes<ChatModels>,
  InferCreationAttributes<ChatModels>
> {
  declare id?: string;
  declare modelId: ModelIds;
  declare name: string;
  declare type: ModelType;
  declare systemPrompt: string;
  declare maxLength?: number;
  declare tokenLimit?: number;
  declare fileSizeLimit?: number;
  declare appId?: string;
  declare apiType?: string;
  declare apiHost?: string;
  declare apiKey?: string;
  declare apiSecret?: string;
  declare apiVersion?: string;
  declare apiOrganization?: string;
  declare enable?: boolean;
}

ChatModels.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    modelId: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    systemPrompt: { type: DataTypes.STRING },
    maxLength: { type: DataTypes.INTEGER },
    tokenLimit: { type: DataTypes.INTEGER },
    fileSizeLimit: { type: DataTypes.INTEGER },
    appId: { type: DataTypes.STRING },
    apiType: { type: DataTypes.STRING },
    apiHost: { type: DataTypes.STRING },
    apiKey: { type: DataTypes.STRING },
    apiSecret: { type: DataTypes.STRING },
    apiVersion: { type: DataTypes.STRING },
    apiOrganization: { type: DataTypes.STRING },
    enable: { type: DataTypes.BOOLEAN },
  },
  {
    sequelize: connection,
    tableName: 'chat_models',
  }
);

export default ChatModels;
