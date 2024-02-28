import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';

class Sessions extends Model<
  InferAttributes<Sessions>,
  InferCreationAttributes<Sessions>
> {
  declare id?: string;
  declare userId: string;
  declare username: string;
  declare role?: string;
}

Sessions.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    userId: { type: DataTypes.UUID },
    username: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
  },
  {
    sequelize: connection,
    tableName: 'sessions',
  }
);

export default Sessions;
