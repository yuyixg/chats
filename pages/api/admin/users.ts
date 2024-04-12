import { UsersManager } from '@/managers';
import { BadRequest } from '@/utils/error';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
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
    const { query } = req.query;
    const users = await UsersManager.findUsers(query as string);
    const data = users.map((x) => {
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
      };
    });
    return data;
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
  } else {
    const { account, password, role } = req.body;
    let isFound = await UsersManager.findByAccount(account);
    if (isFound) {
      throw new BadRequest('User existed');
    }
    const user = await UsersManager.createUser({
      account,
      password,
      role,
    });
    await UsersManager.initialUser(user.id!, req.session.userId);
    return user;
  }
};

export default apiHandler(handler);
