import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { FileServiceManager } from '@/managers';
import { addAsterisk, checkKey } from '@/utils/common';
import { FileServices } from '@prisma/client';
import { apiHandler } from '@/middleware/api-handler';
import { InternalServerError } from '@/utils/error';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req.cookies);
  if (!session) {
    return res.status(401).end();
  }
  const role = session.role;
  if (role !== UserRole.admin) {
    res.status(401).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { select } = req.query;
      const servers = await FileServiceManager.findFileServices();
      let data = [];
      if (select) {
        data = servers
          .filter((x: FileServices) => x.enabled)
          .map((x: FileServices) => {
            return { id: x.id, name: x.name };
          });
      } else {
        data = servers.map((x: FileServices) => {
          const configs = JSON.parse(x?.configs || '{}');
          return {
            id: x.id,
            name: x.name,
            type: x.type,
            configs: {
              endpoint: configs.endpoint,
              bucketName: configs.bucketName,
              region: configs.region,
              accessKey: addAsterisk(configs.accessKey),
              storageFolderName: configs.storageFolderName,
              accessSecret: addAsterisk(configs.accessSecret),
            },
            enabled: x.enabled,
            createdAt: x.createdAt,
          };
        });
      }
      return data;
    } else if (req.method === 'PUT') {
      const { id, type, name, enabled, configs: configsJSON } = req.body;
      let fileServer = await FileServiceManager.findById(id);
      if (!fileServer) {
        return res.status(404).send('File server not found');
      }

      let configs = JSON.parse(configsJSON);
      configs.accessKey = checkKey(
        fileServer.configs.accessKey,
        configs.accessKey
      );
      configs.accessSecret = checkKey(
        fileServer.configs.accessSecret,
        configs.accessSecret
      );

      await FileServiceManager.updateFileServices({
        id,
        name,
        type,
        configs: JSON.stringify(configs),
        enabled,
      });
      await FileServiceManager.initFileServer(type, configs);
    } else {
      const { type, name, enabled, configs } = req.body;
      let isFound = await FileServiceManager.findByName(name);
      if (isFound) {
        return res.status(400).send('Name existed');
      }
      const fileServer = await FileServiceManager.createFileServices({
        type,
        name,
        enabled,
        configs,
      });
      await FileServiceManager.initFileServer(type, configs);
      return fileServer;
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
