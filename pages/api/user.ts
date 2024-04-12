import { UsersManager } from '@/managers';
import { BadRequest } from '@/utils/error';
import bcrypt from 'bcryptjs';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

async function handler(req: ChatsApiRequest, res: ChatsApiResponse) {
  const { userId } = req.session;
  if (req.method === 'PUT') {
    const { newPassword } = req.body;
    const user = await UsersManager.findByUserId(userId);
    if (!user) {
      throw new BadRequest('Username or password incorrect');
    }
    const hashPassword = await bcrypt.hashSync(newPassword);
    const result = await UsersManager.updateUserPassword(
      user.id!,
      hashPassword
    );
    return result;
  }
}

export default apiHandler(handler);
