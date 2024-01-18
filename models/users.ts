import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import connection from './connection';

class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare modelIds: string[];
  declare role: string;
  declare extends?: string;
  declare enable?: boolean;
}

Users.init(
  {
    modelIds: { type: DataTypes.JSON },
    role: { type: DataTypes.STRING },
    extends: { type: DataTypes.JSON },
    enable: { type: DataTypes.BOOLEAN },
  },
  {
    sequelize: connection,
    tableName: 'users',
  }
);

export default Users;
