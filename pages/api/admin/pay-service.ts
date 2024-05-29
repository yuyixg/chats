import { addAsterisk, checkKey } from '@/utils/common';
import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

import { PayServiceManager } from '@/managers';
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
    const data = await PayServiceManager.findAll();
    return data.map((x) => {
      const configs = JSON.parse(x?.configs || '{}');
      return {
        id: x.id,
        type: x.type,
        configs: {
          appId: configs.appId,
          mchId: configs.mchId,
          apiV3Key: addAsterisk(configs.apiV3Key),
          secret: addAsterisk(configs.secret),
          apiClientCert: addAsterisk(configs.apiClientCert),
          apiClientKey: addAsterisk(configs.apiClientKey),
        },
        enabled: x.enabled,
        createdAt: x.createdAt,
      };
    });
  } else if (req.method === 'PUT') {
    const { id, type, enabled, configs: configsJSON } = req.body;
    let service = await PayServiceManager.findById(id);
    if (!service) {
      throw new BadRequest('Service not found');
    }
    let configs = JSON.parse(configsJSON);
    configs.secret = checkKey(service.configs.secret, configs.secret);
    configs.apiV3Key = checkKey(service.configs.apiV3Key, configs.apiV3Key);
    configs.apiClientCert = checkKey(
      service.configs.apiClientCert,
      configs.apiClientCert,
    );
    configs.apiClientKey = checkKey(
      service.configs.apiClientKey,
      configs.apiClientKey,
    );

    await PayServiceManager.update({
      id,
      type,
      configs: JSON.stringify(configs),
      enabled,
    });
  } else {
    const { type, enabled, configs } = req.body;
    return await PayServiceManager.create({
      type,
      enabled,
      configs,
    });
  }
};

export default apiHandler(handler);
