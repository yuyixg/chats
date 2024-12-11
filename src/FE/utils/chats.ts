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

export function preprocessLaTeX(content?: string) {
  if (!content) {
    return '';
  }
  // Replace block-level LaTeX delimiters \[ \] with $$ $$

  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`,
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`,
  );
  return inlineProcessedContent;
}
