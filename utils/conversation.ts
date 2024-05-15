export const saveSelectChatId = (chatId: string) => {
  localStorage.setItem('selectedChatId', chatId);
};

export const getSelectChatId = () => {
  return localStorage.getItem('selectedChatId');
};

export const removeSelectChatId = () => {
  localStorage.removeItem('selectedChatId');
};