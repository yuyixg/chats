export interface UserSession {
  sessionId: string;
  username: string;
  password: string;
  role: string;
}

export interface UserInfo {
  username: string;
  role: string;
}

export const saveUserInfo = (user: UserInfo) => {
  const json = JSON.stringify(user);
  const value = btoa(btoa(encodeURIComponent(json)));
  localStorage.setItem('user', value);
};
export const clearUserInfo = () => {
  localStorage.removeItem('user');
};

export const getUserInfo = () => {
  const value = localStorage.getItem('user');
  const user = decodeURIComponent(atob(atob(value || '')));
  if (!user) {
    return null;
  }
  return JSON.parse(user) as UserInfo;
};

export const getLoginUrl = () => {
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

export const getUserSession = (): string => {
  if (typeof localStorage === 'undefined') return '';
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  if (session?.expires && session?.expires > new Date().getTime())
    return session.sessionId;
  return '';
};

export const clearUserSession = () => {
  localStorage.removeItem('session');
};
