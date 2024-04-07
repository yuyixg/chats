import { SessionsManager, UsersManager } from '@/managers';
import NextAuth, { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      wellKnown: process.env.KEYCLOAK_WELLKNOWN!,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_SECRET,
      profile: (profile) => {
        return {
          ...profile,
          id: profile.sub,
        };
      },
    },
  ],
  secret: process.env.KEYCLOAK_SECRET,
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
            username: profile?.name!,
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
        sessionId: token?.sessionId,
        username: token?.username,
        role: token?.role,
      };
    },
  },
};
export default NextAuth(authOptions);
