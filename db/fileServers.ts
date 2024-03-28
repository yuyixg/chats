import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { FileServerType, IFileConfig } from '@/types/file';

class FileServers extends Model<
  InferAttributes<FileServers>,
  InferCreationAttributes<FileServers>
> {
  declare id?: string;
  declare name: string;
  declare enabled: boolean;
  declare type: FileServerType;
  declare configs: IFileConfig;
  declare createdAt?: string;
}

FileServers.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    name: { type: DataTypes.STRING },
    enabled: { type: DataTypes.BOOLEAN },
    type: { type: DataTypes.STRING },
    configs: { type: DataTypes.JSON },
    createdAt: {
      type: DataTypes.STRING,
      defaultValue: new Date().toLocaleString(),
    },
  },
  {
    sequelize: connection,
    tableName: 'file_servers',
  }
);

export default FileServers;
