import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { UserRole } from 'aws-sdk/clients/workmail';

class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare id?: string;
  declare userName: string;
  declare role?: UserRole;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userName: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: null },
  },
  {
    sequelize: connection,
    tableName: 'users',
  }
);

export default Users;
