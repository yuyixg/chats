import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError } from '@/utils/error';
import { FileServerManager } from '@/managers/fileServer';
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
      const data = await FileServerManager.findFileServers();
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { id, type, name, enabled, configs } = req.body;
      let fileServer = await FileServerManager.findById(id);
      if (!fileServer) {
        return res.status(404).send('File server not found');
      }
      const data = await FileServerManager.updateFileServer({
        id,
        name,
        type,
        configs,
        enabled,
      });
      return res.send(data);
    } else {
      const { type, name, enabled, configs } = req.body;
      let isFound = await FileServerManager.findByName(name);
      if (isFound) {
        return res.status(400).send('Name existed');
      }
      const fileServer = await FileServerManager.createFileServer({
        type,
        name,
        enabled,
        configs,
      });
      return res.json(fileServer);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
