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
  declare permissions: string[];
  declare userInfo?: Object;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    permissions: { type: DataTypes.JSON, defaultValue: [] },
    userInfo: { type: DataTypes.JSON },
  },
  {
    sequelize: connection,
    tableName: 'users',
  }
);

export default Users;
