import { ProviderType } from '@/types/user';

import { LoginServiceManager } from '@/managers/loginService';

export async function KeyCloakProvider(): Promise<any> {
  const configs = await LoginServiceManager.findConfigsByType(
    ProviderType.KeyCloak,
  );
  return {
    id: 'keycloak',
    name: 'Keycloak',
    type: 'oauth',
    authorization: {
      params: {
        scope: 'openid email profile',
      },
    },
    wellKnown: configs.wellKnown,
    clientId: configs.clientId,
    clientSecret: configs.secret,
    profile: (profile: any) => {
      return {
        ...profile,
        id: profile.sub,
      };
    },
  };
}
