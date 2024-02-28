import Sessions from '@/models/sessions';
import { Session } from '@/types/session';

export class SessionsManager {
  static async generateSession(params: Session) {
    const where = {
      where: {
        userId: params.userId,
      },
    };
    const session = await Sessions.findOne(where);
    console.log('session', session);
    if (session) {
      await Sessions.destroy(where);
    }

    return await Sessions.create({
      userId: params.userId,
      username: params.username,
      role: params.role,
    });
  }

  static async findSession(id: string) {
    return await Sessions.findByPk(id);
  }
}
