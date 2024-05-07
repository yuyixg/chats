import { ChatMessagesManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
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
  parentId: string;
  messages: any[];
  childrenIds?: string[];
  lastLeafId?: string;
}

const findChildren = (nodes: MessageNode[], parentId: string): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => node.id);
};

const calculateMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findChildren(nodes, node.id).reverse(),
  }));
};

const handler = async (req: ChatsApiRequest) => {
  const { userId } = req.session;
  if (req.method === 'GET') {
    const { chatId } = req.query as { chatId: string };
    const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
      chatId
    );
    const messages = chatMessages.map((x) => {
      return {
        id: x.id,
        parentId: x.parentId,
        messages: JSON.parse(x.messages),
        createdAt: x.createdAt,
      } as MessageNode;
    });
    return calculateMessages(messages);
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const message = await ChatMessagesManager.findByUserMessageId(id, userId);
    if (!message) {
      throw new BadRequest();
    }
    await ChatMessagesManager.delete(id, userId);
  }
};

export default apiHandler(handler);
