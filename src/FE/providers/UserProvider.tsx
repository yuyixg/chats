'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { UserInfo, getUserInfo, redirectToLoginPage } from '@/utils/user';

const UserContext = createContext<UserInfo | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const fetchUser = () => {
    const userInfo = getUserInfo();
    if (!userInfo) {
      redirectToLoginPage();
      return;
    }
    setUser(userInfo);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserInfo = () => {
  const user = useContext(UserContext) || getUserInfo();
  if (!user) {
    redirectToLoginPage();
    return;
  }
  return user;
};
