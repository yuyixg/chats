import NextAuth, { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      // version: '2.0', // Double check your keycloak version
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      // params: { grant_type: 'authorization_code' },
      // scope: 'openid email profile console-prosa basic-user-attribute',
      wellKnown:
        'https://identity.starworks.cc/realms/MFF/.well-known/openid-configuration',
      // accessTokenUrl: `https://identity.starworks.cc/realms/MFF/protocol/openid-connect/token`,
      // requestTokenUrl: `https://identity.starworks.cc/realms/MFF/protocol/openid-connect/auth`,
      // profileUrl: `https://identity.starworks.cc/realms/MFF/protocol/openid-connect/userinfo`,
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      profile: (profile) => {
        return {
          ...profile,
          id: profile.sub,
        };
      },
      // authorizationParams: {
      //   response_type: 'code',
      // },
    },
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.KEYCLOAK_SECRET!,
    // signingKey: process.env.JWT_SIGNING_PRIVATE_KEY!,
  },
  secret: process.env.KEYCLOAK_SECRET!,
  callbacks: {
    async signIn(params: { user: any; account: any }) {
      // console.log('signIn', params);
      const { account, user } = params;
      if (account && user) {
        return true;
      } else {
        return '/unauthorized';
      }
    },
    async redirect(params: { url: string; baseUrl: string }) {
      const { url, baseUrl } = params;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session(params: { session: any; token: JWT }) {
      console.log('session', params);
      const { session, token } = params;
      if (token) {
        session.user = token.user;
        session.error = token.error;
        session.accessToken = token.accessToken;
      }
      return {
        ...session,
        expires: session.expires || null,
        error: session.error || null,
        accessToken: session.accessToken || null,
      };
    },
    async jwt(params) {
      // console.log('jwt', params);
      const { account, user, token } = params;
      if (account && user) {
        token.accessToken = account.accessToken;
        token.refreshToken = account.refreshToken;
        token.accessTokenExpired =
          Date.now() + (account.expires_at! - 15) * 1000;
        token.refreshTokenExpired =
          Date.now() + (account.expires_at! - 15) * 1000;
        token.user = user;
        return token;
      }
      return token;
    },
  },
};
export default NextAuth(authOptions);
