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
  parentId: string | null;
  messages: any[];
  childrenIds?: string[];
  lastLeafId?: string;
}

function calculateMessages(nodes: MessageNode[]): MessageNode[] {
  const parentToChildrenMap = new Map<string, string[]>();
  nodes.forEach((node) => {
    if (node.parentId !== null) {
      if (!parentToChildrenMap.has(node.parentId)) {
        parentToChildrenMap.set(node.parentId, []);
      }
      parentToChildrenMap.get(node.parentId)?.push(node.id);
    }
  });

  const findLastLeafId = (nodeId: string): string => {
    const children = parentToChildrenMap.get(nodeId);
    if (!children || children.length === 0) {
      return nodeId;
    } else {
      return findLastLeafId(children[children.length - 1]);
    }
  };
  nodes = nodes.map((node) => {
    const children = parentToChildrenMap.get(node.id);
    node.childrenIds = children || [];
    node.lastLeafId = children ? findLastLeafId(node.id) : node.id;
    return node;
  });

  return nodes;
}

const handler = async (req: ChatsApiRequest) => {
  const { userId } = req.session;
  if (req.method === 'GET') {
    const { chatId } = req.query as { chatId: string };
    const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
      userId,
      chatId
    );
    const messages = chatMessages.map((x) => {
      return {
        id: x.id,
        parentId: x.parentId,
        messages: JSON.parse(x.messages),
      } as MessageNode;
    });

    return calculateMessages(messages);
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const message = await ChatMessagesManager.findByUserMessageId(id, userId);
    if (!message) {
      throw new BadRequest();
    }
    await ChatMessagesManager.delete(id);
  }
};

export default apiHandler(handler);
