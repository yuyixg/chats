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
  // 创建一个 Map 来保存 parentId 到它对应的 children 的映射
  const parentToChildrenMap = new Map<string, string[]>();

  // 遍历所有节点，构建 parentId 到 children 的映射关系
  nodes.forEach((node) => {
    if (node.parentId !== null) {
      if (!parentToChildrenMap.has(node.parentId)) {
        parentToChildrenMap.set(node.parentId, []);
      }
      parentToChildrenMap.get(node.parentId)?.push(node.id);
    }
  });

  // 用于查找最后一个子节点的方法
  const findLastLeafId = (nodeId: string): string => {
    const children = parentToChildrenMap.get(nodeId);
    if (!children || children.length === 0) {
      return nodeId; // 如果一个节点没有子节点，那它就是最后的叶子
    } else {
      // 否则，我们递归地在它的最后一个子节点中查找最后的叶子
      return findLastLeafId(children[children.length - 1]);
    }
  };

  // 根据构建的映射关系，为每个节点添加 childrenIds 和 lastLeafId 属性
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
