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
