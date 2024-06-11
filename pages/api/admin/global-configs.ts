import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

import { ConfigsManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    return await ConfigsManager.find();
  } else if (req.method === 'PUT') {
    const { key, value, description } = req.body;
    const config = await ConfigsManager.findByKey(key);
    if (!config) {
      throw new BadRequest('Config is not Found');
    }

    const data = await ConfigsManager.update({
      key,
      value,
      description,
    });
    return data;
  } else if (req.method === 'POST') {
    const { key, value, description } = req.body;

    const data = await ConfigsManager.create({
      key,
      value,
      description,
    });
    return data;
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const config = await ConfigsManager.findByKey(id);
    if (config) {
      await ConfigsManager.delete(id);
    } else throw new BadRequest('Config is not Found!');
  }
};

export default apiHandler(handler);
