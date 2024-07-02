import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';
import { CommonQueryParams } from '@/types/query';

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
    const { query, page, pageSize } = req.query as CommonQueryParams;
    const data = await UsersManager.findUsers(query, +page, +pageSize);
    const rows = data.rows.map((x) => {
      return {
        id: x.id,
        username: x.username,
        account: x.account,
        role: x.role,
        balance: x.userBalances?.balance,
        avatar: x.avatar,
        phone: x.phone,
        email: x.email,
        provider: x.provider,
        enabled: x.enabled,
        createdAt: x.createdAt,
        userModelId: x.UserModels[0].id,
        models: JSON.parse(x.UserModels[0].models || '[]'),
      };
    });
    return { rows, count: data.count };
  } else if (req.method === 'PUT') {
    const { id, username, password, role, enabled, phone, email } = req.body;
    let user = await UsersManager.findByUserId(id);
    if (!user) {
      throw new BadRequest('User not found');
    }
    const data = await UsersManager.updateUser({
      id,
      username,
      password: password ? password : user.password,
      role,
      enabled,
      phone,
      email,
    });
    return data;
  } else if (req.method === 'POST') {
    const { username, password, role } = req.body;
    let isFound = await UsersManager.findByAccount(username);
    if (isFound) {
      throw new BadRequest('User existed');
    }
    const user = await UsersManager.createUser({
      account: username,
      username,
      password,
      role,
    });
    await UsersManager.initialUser(user.id!, '-', null, req.session.userId);
    return user;
  }
};

export default apiHandler(handler);
