import { Content, Role } from '@/types/chat';
import { ChatsApiRequest } from '@/types/next-api';

import { ChatMessagesManager, ChatModelManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};
interface MessageNode {
  id: string;
  role: Role;
  parentId: string;
  content: Content;
  childrenIds?: string[];
  assistantChildrenIds?: string[];
  lastLeafId?: string;
  modelName: string;
}

const findChildren = (nodes: MessageNode[], parentId: string): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'user')
    .map((node) => node.id);
};

const findResponseChildren = (
  nodes: MessageNode[],
  parentId: string,
): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'assistant')
    .map((node) => node.id);
};

const calculateMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findChildren(nodes, node.id).reverse(),
    assistantChildrenIds: findResponseChildren(nodes, node.parentId),
  }));
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    const { chatId } = req.query as { chatId: string };
    const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
      chatId,
    );
    const chatModels = await ChatModelManager.findModels(true);
    const messages = chatMessages.map((x) => {
      const chatModel = chatModels.find((m) => m.id === x.chatModelId);
      return {
        id: x.id,
        parentId: x.parentId?.toLocaleLowerCase(),
        role: x.role,
        content: JSON.parse(x.messages),
        inputTokens: x.inputTokens,
        outputTokens: x.outputTokens,
        createdAt: x.createdAt,
        duration: x.duration,
        modelName: chatModel?.name,
      } as MessageNode;
    });
    return calculateMessages(messages);
  }
};

export default apiHandler(handler);
