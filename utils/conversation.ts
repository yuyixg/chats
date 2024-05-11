export const saveSelectChatId = (chatId: string) => {
  localStorage.setItem('selectedChatId', chatId);
};

export const getSelectChatId = () => {
  localStorage.getItem('selectedChatId');
};

export const removeSelectChatId = () => {
  localStorage.removeItem('selectedChatId');
};