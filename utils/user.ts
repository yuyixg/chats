import Cookies from './cookie';

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

export const setUserSessionId = (sessionId: string) => {
  let expires = new Date();
  expires.setHours(expires.getHours() + 12);
  Cookies.setItem('sessionId', sessionId, expires, '/');
};

export const getUserSessionId = () => {
  return Cookies.getItem('sessionId');
};

export const clearUserSessionId = () => {
  const user = getUserInfo();
  user && Cookies.removeItem('sessionId', '/');
};

export function replacePassword(value: string): string {
  return value.replace(/("password":")([^"]*)"/, '$1"');
}
