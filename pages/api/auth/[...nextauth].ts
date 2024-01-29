import { UserManager } from '@/managers';
import NextAuth, { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

const refreshAccessToken = async (token: JWT) => {
  try {
    if (Date.now() > token.refreshTokenExpired) throw Error;
    const details = {
      client_id: process.env.KEYCLOAK_ID!,
      client_secret: process.env.KEYCLOAK_SECRET!,
      grant_type: ['refresh_token'],
      refresh_token: token.refreshToken,
    };
    const formBody: string[] = [];
    Object.entries(details).forEach(([key, value]: [string, any]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      formBody.push(encodedKey + '=' + encodedValue);
    });
    const formData = formBody.join('&');
    const url = `${process.env.KEYCLOAK_BASE_URL}/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formData,
    });
    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;
    const result = {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpired: (refreshedTokens.expires_at - 15) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      refreshTokenExpired:
        Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
    };
    return result;
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};
export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      checks: ['none'],
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      wellKnown: process.env.KEYCLOAK_WELL_KNOWN!,
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      profile: (profile) => {
        return {
          ...profile,
          id: profile.sub,
        };
      },
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
    async signIn(params) {
      // console.log('signIn', params);
      const { account, user } = params;
      if (account && user) {
        let currentUser = await UserManager.findUserById(user.id);
        if (!currentUser) {
          currentUser = await UserManager.createUser(user.id);
        }
        user.modelIds = currentUser.modelIds;
        user.permissions = currentUser.permissions;
        return true;
      } else {
        return '/unauthorized';
      }
    },
    async redirect(params: { url: string; baseUrl: string }) {
      const { url, baseUrl } = params;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session(params) {
      const { session, token } = params;
      console.log('params', params);
      if (token) {
        session.user = token.user;
        session.error = token.error;
        session.accessToken = token.accessToken;
        session.permissions = token.user.permissions || null;
        session.modelIds = token.user.modelIds || null;
      }
      return {
        ...session,
        expires: session.expires || null,
        error: session.error || null,
        accessToken: session.accessToken || null,
      } as any;
    },
    async jwt(params) {
      const { account, user, token } = params;
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpired = (account.expires_at - 15) * 1000;
        token.refreshTokenExpired =
          Date.now() + (account.refresh_expires_in - 15) * 1000;
        token.user = user;
        return token;
      }
      if (Date.now() < token.accessTokenExpired) return token;
      return refreshAccessToken(token);
    },
  },
};
export default NextAuth(authOptions);
