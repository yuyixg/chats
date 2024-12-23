import { ChatRole, ChatStatus } from '@/types/chat';
import { ChatMessage, ChatMessageNode, MessageNode } from '@/types/chatMessage';

function findMessageChildren(
  conversations: ChatMessage[],
  nodeId: string,
  messages: ChatMessage[],
) {
  const message = conversations.findLast((x) => x.parentId === nodeId);
  if (message) {
    messages.push(message);
    return findMessageChildren(conversations, message.id, messages);
  }
  return messages;
}

function findMessageParent(
  conversations: ChatMessage[],
  nodeId: string | null,
  messages: ChatMessage[],
) {
  if (!nodeId) return messages;
  const message = conversations.find((x) => x.id === nodeId);
  if (message) {
    messages.push(message);
    return findMessageParent(conversations, message.parentId, messages);
  }
  return messages.reverse();
}

export function getSelectedMessages(
  conversations: ChatMessage[],
  nodeId: string,
): ChatMessage[] {
  let selectMessages: ChatMessage[] = [];
  const message = conversations.find((node) => node.id === nodeId);
  if (!message) {
    return [];
  }
  const messageChildren = findMessageChildren(conversations, message.id, []);
  if (!message.parentId) {
    selectMessages.push(message);
  } else {
    const messageParent = findMessageParent(
      conversations,
      message.parentId,
      [],
    );
    messageParent.reverse();
    selectMessages = selectMessages.concat([...messageParent, message]);
  }
  selectMessages = selectMessages.concat(messageChildren);
  return selectMessages;
}

const findUserMessageChildren = (
  nodes: MessageNode[],
  parentId: string,
): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'user')
    .map((node) => node.id);
};

const findResponseMessageChildren = (
  nodes: MessageNode[],
  parentId: string | null,
): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId && node.role === 'assistant')
    .map((node) => node.id);
};

export const formatMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findUserMessageChildren(nodes, node.id).reverse(),
    assistantChildrenIds: findResponseMessageChildren(nodes, node.parentId),
  }));
};

export function findLastLeafId(
  messages: ChatMessageNode[],
  id: string,
): string {
  const childrenMap: Record<string, ChatMessageNode[]> = {};
  for (const message of messages) {
    if (message.parentId) {
      if (!childrenMap[message.parentId]) {
        childrenMap[message.parentId] = [];
      }
      childrenMap[message.parentId].push(message);
    }
  }

  function dfs(nodeId: string): string {
    const children = childrenMap[nodeId];
    if (!children || children.length === 0) {
      return nodeId;
    }
    return dfs(children[children.length - 1].id);
  }

  return dfs(id);
}

export function findSelectedMessageByLeafId(
  messages: ChatMessageNode[],
  leafId: string,
): ChatMessageNode[][] {
  const messageMap = new Map<string, ChatMessageNode>();
  messages.forEach((m) => messageMap.set(m.id, m));

  const path: ChatMessageNode[][] = [];
  let currentMessage = messageMap.get(leafId);

  if (!currentMessage) return path;

  while (currentMessage) {
    const parentId: string | null = currentMessage.parentId;
    let prevUserMessage: ChatMessageNode | null = null;

    if (currentMessage.role === ChatRole.User) {
      const siblingIds = messages
        .filter((m) => m.parentId === parentId && m.role === ChatRole.User)
        .map((x) => x.id);

      const currentOutputMessage: ChatMessageNode = {
        ...currentMessage,
        siblingIds,
      };
      prevUserMessage = currentOutputMessage;
      path.unshift([currentOutputMessage]);
    } else if (currentMessage.role === ChatRole.Assistant) {
      const assistantSiblings = messages.filter(
        (m) => m.parentId === parentId && m.role === ChatRole.Assistant,
      );
      const groupedSiblings = groupBy(assistantSiblings, 'spanId');

      const group: ChatMessageNode[] = [];
      groupedSiblings.forEach((siblingGroup) => {
        const siblingIds = siblingGroup.map((x) => x.id);
        let selectedMessage: ChatMessageNode | null = null;

        siblingGroup.forEach((x) => {
          if (x.id === currentMessage!.id) {
            selectedMessage = {
              ...x,
              siblingIds,
              isActive: true,
              status: x.content?.error ? ChatStatus.Failed : ChatStatus.None,
            };
          } else if (prevUserMessage && prevUserMessage.parentId === x.id) {
            selectedMessage = {
              ...x,
              siblingIds,
              isActive: true,
              status: x.content?.error ? ChatStatus.Failed : ChatStatus.None,
            };
          }
        });

        if (!selectedMessage) {
          const lastMessage = siblingGroup[siblingGroup.length - 1];
          selectedMessage = {
            ...lastMessage,
            siblingIds,
            isActive: false,
            status: lastMessage.content?.error
              ? ChatStatus.Failed
              : ChatStatus.None,
          };
        }

        group.push(selectedMessage);
      });

      path.unshift(group);
    }

    currentMessage = parentId ? messageMap.get(parentId) : undefined;
  }

  return path;
}

function groupBy<T>(array: T[], key: keyof T): T[][] {
  const groups: { [key: string]: T[] } = {};
  for (const item of array) {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
  }
  return Object.values(groups);
}
