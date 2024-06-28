import { ChatsApiRequest } from '@/types/next-api';

import { UsersManager } from '@/managers';
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
    return await UsersManager.getUserInitialConfig();
  } else if (req.method === 'PUT') {
    const { id, name, models, price, loginType, invitationCodeId } = req.body;
    const data = await UsersManager.updateUserInitialConfig({
      id,
      name,
      models: JSON.stringify(models),
      price,
      loginType,
      invitationCodeId,
    });
    return data;
  } else if (req.method === 'POST') {
    const { name, models, price, loginType, invitationCodeId } = req.body;
    const data = await UsersManager.createUserInitialConfig({
      name,
      models: JSON.stringify(models),
      price,
      loginType,
      invitationCodeId,
    });
    return data;
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    return await UsersManager.deleteUserInitialConfig(id);
  }
};

export default apiHandler(handler);
