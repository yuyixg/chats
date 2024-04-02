import { NextApiRequest, NextApiResponse } from 'next';
import { SessionsManager, UsersManager } from '@/managers';
import { badRequest, internalServerError } from '@/utils/error';
import bcrypt from 'bcryptjs';
import { getSession } from '@/utils/session';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const { username, password } = req.body;
      const user = await UsersManager.singIn(username, password);
      if (user) {
        const session = await SessionsManager.generateSession(user.id!);
        return res.json({
          sessionId: session.id,
          username: user.username,
          role: user.role,
        });
      }
      return badRequest(res, 'Username or password incorrect');
    } else if (req.method === 'PUT') {
      const session = await getSession(req.cookies);
      if (!session) {
        return res.status(401).end();
      }
      const { newPassword } = req.body;
      const user = await UsersManager.findByUserId(session.userId);
      if (!user) {
        return badRequest(res, 'User not found');
      }
      const hashPassword = await bcrypt.hashSync(newPassword);
      const result = await UsersManager.updateUserPassword(
        user.id!,
        hashPassword
      );
      return res.json(result);
    }
  } catch (error: any) {
    return internalServerError(res);
  }
}
