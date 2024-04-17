import { apiHandler } from '@/middleware/api-handler';
import { BadRequest } from '@/utils/error';
import { ChatsApiRequest } from '@/types/next-api';
import { LoginServiceManager } from '@/managers/loginService';
import { addAsterisk, checkKey } from '@/utils/common';
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
    const data = await LoginServiceManager.findAll();
    return data.map((x) => {
      const configs = JSON.parse(x?.configs || '{}');
      return {
        id: x.id,
        type: x.type,
        configs: {
          wellKnown: configs.wellKnown,
          clientId: configs.clientId,
          appId: configs.appId,
          secret: addAsterisk(configs.secret),
        },
        enabled: x.enabled,
        createdAt: x.createdAt,
      };
    });
  } else if (req.method === 'PUT') {
    const { id, type, enabled, configs: configsJSON } = req.body;
    let service = await LoginServiceManager.findById(id);
    if (!service) {
      throw new BadRequest('Service not found');
    }

    let configs = JSON.parse(configsJSON);
    configs.secret = checkKey(service.configs.secret, configs.secret);

    await LoginServiceManager.update({
      id,
      type,
      configs: JSON.stringify(configs),
      enabled,
    });
  } else {
    const { type, enabled, configs } = req.body;
    return await LoginServiceManager.create({
      type,
      enabled,
      configs,
    });
  }
};

export default apiHandler(handler);
