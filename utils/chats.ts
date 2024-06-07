import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
export const saveSelectChatId = (chatId: string) => {
  localStorage.setItem('selectedChatId', chatId);
};

export const getSelectChatId = () => {
  return localStorage.getItem('selectedChatId');
};

export const removeSelectChatId = () => {
  localStorage.removeItem('selectedChatId');
};

export const getPathChatId = (path: string) => {
  return path.substring(3);
};

export const checkChatIsStopped = (chatId: string) => {
  return !publicRuntimeConfig.chattingIds[chatId.toUpperCase()];
};

export const addChat = (chatId: string) => {
  publicRuntimeConfig.chattingIds[chatId.toUpperCase()] = new Date().getTime();
};

export const stopChat = (chatId: string) => {
  delete publicRuntimeConfig.chattingIds[chatId.toUpperCase()];
  const currentTimeStamp = new Date().getTime() - 1000 * 60 * 5;
  Object.keys(publicRuntimeConfig.chattingIds).forEach((key) => {
    if (
      new Date(publicRuntimeConfig.chattingIds[key]).getTime() <
      currentTimeStamp
    ) {
      delete publicRuntimeConfig.chattingIds[key];
    }
  });
};
