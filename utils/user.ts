export interface UserSession {
  sessionId: string;
  username: string;
  password: string;
  role: string;
}

export const saveUserSession = (user: UserSession) => {
  localStorage.setItem('user', JSON.stringify(user));
};
export const clearUserSession = () => {
  localStorage.removeItem('user');
};

export const getUserSession = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }
  return JSON.parse(user) as UserSession;
};

export const getLoginUrl = (locale?: string) => {
  const _locale = locale || localStorage.getItem('locale');
  return (_locale ? '/' + _locale : '') + '/login';
};

export const setUserSessionId = (sessionId: string) => {
  let expires = new Date();
  expires.setDate(expires.getDate() + 1);
  document.cookie = `sessionId=${sessionId}; expires=${expires.toUTCString()}; path=/`;
};

export const clearUserSessionId = () => {
  const user = getUserSession();
  user &&
    (document.cookie = `sessionId=${user.sessionId}; expires=-2738049600; path=/`);
};
