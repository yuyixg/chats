import { Conversation } from '@/types/chat';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[]
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const saveSelectChatId = (chatId: string) => {
  localStorage.setItem('selectedChatId', chatId);
};

export const getSelectChatId = () => {
  localStorage.getItem('selectedChatId');
};

export const removeSelectChatId = () => {
  localStorage.removeItem('selectedChatId');
};

export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
};

export const clearConversations = () => {
  localStorage.removeItem('selectedConversation');
  localStorage.removeItem('conversationHistory');
};
