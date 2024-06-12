import prisma from '@/prisma/prisma';

export class SessionsManager {
  static async generateSession(userId: string) {
    const session = await prisma.sessions.findFirst({
      where: {
        userId,
      },
    });

    if (session) {
      await prisma.sessions.delete({
        where: {
          id: session.id,
        },
      });
    }

    return await prisma.sessions.create({
      data: {
        userId,
      },
    });
  }

  static async checkSession(userId: string) {
    const sessions = await prisma.sessions.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    sessions.filter((x) => {
      if(x.createdAt)
      return x;
    });
  }

  static async findSession(id: string) {
    const session = await prisma.sessions.findFirst({
      where: { id: id },
      include: { user: true },
    });
    return session;
  }
}
