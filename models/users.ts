import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';

class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare id?: string;
  declare modelIds: string[];
  declare role: string;
  declare extends?: string;
  declare enable?: boolean;
  declare remainingTokens: number;
  declare expirationDate: Date;
  declare remainingCounts: number;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    modelIds: { type: DataTypes.JSON },
    role: { type: DataTypes.STRING },
    extends: { type: DataTypes.JSON },
    enable: { type: DataTypes.BOOLEAN },
    remainingTokens: { type: DataTypes.INTEGER },
    expirationDate: { type: DataTypes.DATE },
    remainingCounts: { type: DataTypes.INTEGER },
  },
  {
    sequelize: connection,
    tableName: 'users',
  }
);

export default Users;
