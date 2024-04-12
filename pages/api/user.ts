import { NextApiRequest, NextApiResponse } from 'next';
import { UsersManager } from '@/managers';
import { BadRequest, InternalServerError } from '@/utils/error';
import bcrypt from 'bcryptjs';
import { getSession } from '@/utils/session';
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
  try {
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
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
}

export default apiHandler(handler);
