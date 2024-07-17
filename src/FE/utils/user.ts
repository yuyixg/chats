export interface UserSession {
  sessionId: string;
  username: string;
  password: string;
  role: string;
  canRecharge: boolean;
}

export interface UserInfo {
  username: string;
  role: string;
  canRecharge: boolean;
}

export interface StorageSession {
  sessionId: string;
  expires: number;
}

export const saveUserInfo = (user: UserInfo) => {
  localStorage.setItem('user', JSON.stringify(user));
};
export const clearUserInfo = () => {
  localStorage.removeItem('user');
};

export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }
  return JSON.parse(user) as UserInfo;
};

export const getLoginUrl = (locale?: string) => {
  // const _locale = locale || getSettingsLanguage();
  // return (_locale ? '/' + _locale : '') + '/login';
  return '/login';
};

export const setUserSession = (sessionId: string) => {
  let expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10080);
  localStorage.setItem(
    'session',
    JSON.stringify({
      sessionId,
      expires: expires.getTime(),
    }),
  );
};

export const getUserSession = () : string => {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  if (session?.expires && session?.expires > new Date().getTime())
    return session.sessionId;
  return '';
};

export const clearUserSession = () => {
  localStorage.removeItem('session');
};

export function replacePassword(value: string): string {
  return value.replace(/("password":")([^"]*)"/, '$1"');
}
