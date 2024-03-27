import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  UUIDV4,
} from 'sequelize';
import connection from './connection';
import { FileServerType, IFileConfig } from '@/types/file';

class FileServer extends Model<
  InferAttributes<FileServer>,
  InferCreationAttributes<FileServer>
> {
  declare id?: string;
  declare name: string;
  declare enabled: boolean;
  declare type: FileServerType;
  declare configs: IFileConfig;
}

FileServer.init(
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
  },
  {
    sequelize: connection,
    tableName: 'file_server',
  }
);

export default FileServer;
