import { NextApiRequest, NextApiResponse } from 'next';
import { SessionsManager, UsersManager } from '@/managers';
import { badRequest, internalServerError } from '@/utils/error';

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
    const { username, password } = req.body;
    const user = await UsersManager.singIn(username, password);
    if (user) {
      const session = await SessionsManager.generateSession({
        userId: user.id!,
        username: user.username,
        role: user.role,
      });
      return res.json({
        sessionId: session.id,
        username: user.username,
        role: user.role,
      });
    }
    return badRequest(res, 'Username or password incorrect.');
  } catch (error: any) {
    return internalServerError(res);
  }
}
