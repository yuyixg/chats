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
  declare avatar?: string;
  declare username: string;
  declare password: string;
  declare balance: number;
  declare role?: UserRole;
  declare enabled?: boolean;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    avatar: { type: DataTypes.STRING, defaultValue: null },
    password: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING },
    balance: { type: DataTypes.INTEGER, defaultValue: 0 },
    role: { type: DataTypes.STRING, defaultValue: null },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize: connection,
    tableName: 'users',
  }
);

export default Users;
