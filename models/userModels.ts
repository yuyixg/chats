import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';

class UserModels extends Model<
  InferAttributes<UserModels>,
  InferCreationAttributes<UserModels>
> {
  declare id?: string;
  declare userId: string;
  declare modelId: string;
  declare enable?: boolean;
  declare tokens?: number;
  declare counts?: number;
  declare expires?: number;
}

UserModels.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userId: { type: DataTypes.UUID },
    modelId: { type: DataTypes.STRING },
    enable: { type: DataTypes.BOOLEAN, defaultValue: false },
    tokens: { type: DataTypes.INTEGER },
    counts: { type: DataTypes.INTEGER },
    expires: { type: DataTypes.INTEGER },
  },
  {
    sequelize: connection,
    tableName: 'user_models',
  }
);
export default UserModels;
