import { FileServers } from '@/db';
import { PostFileServerParams, PutFileServerParams } from '@/types/file';

export class FileServerManager {
  static async findById(id: string) {
    return await FileServers.findByPk(id);
  }

  static async findByName(name: string) {
    return await FileServers.findOne({ where: { name } });
  }

  static async createFileServer(params: PostFileServerParams) {
    return await FileServers.create(params);
  }

  static async findFileServers(findAll: boolean = true) {
    const where = { enabled: true };
    return await FileServers.findAll({
      where: findAll ? {} : where,
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateFileServer(params: PutFileServerParams) {
    return await FileServers.update(params, {
      where: {
        id: params.id,
      },
    });
  }
}
