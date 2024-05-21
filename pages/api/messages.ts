import { ChatMessagesManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { Content, Role } from '@/types/chat';
import { ChatsApiRequest } from '@/types/next-api';
import { BadRequest } from '@/utils/error';
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
  resChildrenIds?: string[];
  lastLeafId?: string;
}

const findChildren = (nodes: MessageNode[], parentId: string): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'user')
    .map((node) => node.id);
};

const findResponseChildren = (
  nodes: MessageNode[],
  parentId: string
): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'assistant')
    .map((node) => node.id);
};

const calculateMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findChildren(nodes, node.id).reverse(),
    resChildrenIds: findResponseChildren(nodes, node.id).reverse(),
  }));
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    const { chatId } = req.query as { chatId: string };
    const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
      chatId
    );
    const messages = chatMessages.map((x) => {
      return {
        id: x.id,
        parentId: x.parentId?.toLocaleLowerCase(),
        role: x.role,
        content: JSON.parse(x.messages),
        createdAt: x.createdAt,
      } as MessageNode;
    });
    return calculateMessages(messages);
  }
};

export default apiHandler(handler);
