import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError } from '@/utils/error';
import { FileServerManager } from '@/managers';
import { addAsterisk, checkKey } from '@/utils/common';
import { FileServices } from '@prisma/client';
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
      const servers = await FileServerManager.findFileServices();
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
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { id, type, name, enabled, configs: configsJSON } = req.body;
      let fileServer = await FileServerManager.findById(id);
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

      const data = await FileServerManager.updateFileServices({
        id,
        name,
        type,
        configs: JSON.stringify(configs),
        enabled,
      });
      await FileServerManager.initFileServer(type, configs);
      return res.send(data);
    } else {
      const { type, name, enabled, configs } = req.body;
      let isFound = await FileServerManager.findByName(name);
      if (isFound) {
        return res.status(400).send('Name existed');
      }
      const fileServer = await FileServerManager.createFileServices({
        type,
        name,
        enabled,
        configs,
      });
      await FileServerManager.initFileServer(type, configs);
      return res.json(fileServer);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
