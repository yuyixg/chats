import { NextApiRequest, NextApiResponse } from 'next';
import { SessionsManager, UsersManager } from '@/managers';

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
      return res.status(200).json({
        sessionId: session.id,
        username: user.username,
        role: user.role,
      });
    }
    return res.status(400).json('Username or password is incorrect.');
  } catch (error: any) {
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
