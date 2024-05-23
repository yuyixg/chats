import { SessionsManager, UsersManager } from '@/managers';
import { KeyCloakProvider } from '@/utils/authProvider';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const keyCloak = await KeyCloakProvider();
  const providers = [keyCloak];
  return await NextAuth(req, res, {
    providers,
    secret: 'bmV4dC1hdXRoLXNlY3JldA==',
    callbacks: {
      async signIn(params: { user: any; account: any }) {
        const { account, user } = params;
        if (account && user) {
          return true;
        } else {
          return '/login';
        }
      },
      async redirect(params: { url: string; baseUrl: string }) {
        const { url, baseUrl } = params;
        return url.startsWith(baseUrl) ? url : baseUrl;
      },
      async session(params) {
        return { ...params.token } as any;
      },
      async jwt({ token, profile, trigger }) {
        if (trigger === 'signIn' || trigger === 'update') {
          let user = await UsersManager.findByUserByProvider(
            'keycloak',
            profile?.sub!
          );
          if (!user) {
            user = await UsersManager.createUser({
              provider: 'keycloak',
              sub: profile?.sub,
              account: profile?.name,
              username: profile?.name,
              password: '-',
              role: '-',
              email: profile?.email,
            });
            await UsersManager.initialUser(user.id!);
          }

          const session = await SessionsManager.generateSession(user.id!);
          return {
            sessionId: session.id,
            username: user.username,
            role: user.role,
          };
        }
        return {
          sessionId: token?.sessionId || null,
          username: token?.username || null,
          role: token?.role || null,
        };
      },
    },
  });
}
