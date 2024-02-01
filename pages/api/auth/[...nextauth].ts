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

const doSignOut = async (jwt: JWT) => {
  const { idToken } = jwt;
  try {
    const params = new URLSearchParams();
    params.append('id_token_hint', idToken as any);
    await fetch(
      `${
        process.env.KEYCLOAK_ISSUER
      }/protocol/openid-connect/logout?${params.toString()}`
    );
  } catch (e) {
    console.error(JSON.stringify(e));
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
  events: {
    signOut: ({ token }) => doSignOut(token),
  },
  callbacks: {
    async signIn(params) {
      const { account, user } = params;
      if (account && user) {
        let currentUser = await UserManager.findUserById(user.id);
        if (!currentUser) {
          currentUser = await UserManager.initUser(
            user.id,
            user.preferred_username
          );
        }
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
      const { session: paramsSession, token } = params;
      let session = {};
      if (token) {
        let currentUser = await UserManager.findUserById(token.sub);
        session = {
          user: {
            email: token.user?.email || null,
            name: token.user.preferred_username,
            image: null,
          },
          userId: token.sub,
          error: token.error || null,
          permissions: currentUser?.role || null,
        };
      }
      return {
        ...session,
        expires: paramsSession.expires || null,
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
        token.idToken = account.id_token;
        return token;
      }
      if (Date.now() < token.accessTokenExpired) return token;
      return refreshAccessToken(token);
    },
  },
};
export default NextAuth(authOptions);
