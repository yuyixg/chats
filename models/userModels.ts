import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';

export interface UserModel {
  modelId: string;
  enable?: boolean;
  tokens?: number;
  counts?: number;
  expires?: number;
}

class UserModels extends Model<
  InferAttributes<UserModels>,
  InferCreationAttributes<UserModels>
> {
  declare id?: string;
  declare userId: string;
  declare models: UserModel[];
}

UserModels.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userId: { type: DataTypes.UUID },
    models: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    sequelize: connection,
    tableName: 'user_models',
  }
);
export default UserModels;
