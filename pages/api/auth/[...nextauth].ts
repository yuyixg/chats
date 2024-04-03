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
      console.log('signIn', params);
      const { account, user } = params;
      if (account && user) {
        return true;
      } else {
        return '/';
      }
    },
    async redirect(params: { url: string; baseUrl: string }) {
      const { url, baseUrl } = params;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
export default NextAuth(authOptions);
