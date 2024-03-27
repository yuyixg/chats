import { Users } from '@/db';
import FileServer from '@/db/fileServer';
import { PostFileServerParams, PutFileServerParams } from '@/types/file';

export class FileServerManager {
  static async findById(id: string) {
    return await FileServer.findByPk(id);
  }

  static async findByName(name: string) {
    return await FileServer.findOne({ where: { name } });
  }

  static async createFileServer(params: PostFileServerParams) {
    return await FileServer.create(params);
  }

  static async findFileServers() {
    return await FileServer.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateFileServer(params: PutFileServerParams) {
    return await Users.update(params, {
      where: {
        id: params.id,
      },
    });
  }
}
