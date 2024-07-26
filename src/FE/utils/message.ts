import { ChatMessage, MessageNode } from '@/types/chatMessage';

import Decimal from 'decimal.js';

export const calcInputTokenPrice = (
  inputTokenCount: number,
  inputPrice: number,
) => {
  return new Decimal(inputTokenCount * inputPrice);
};

export const calcOutputTokenPrice = (
  outTokenCount: number,
  outPrice: number,
) => {
  return new Decimal(outTokenCount * outPrice);
};

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

export function getSelectMessages(
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

export const calculateMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findUserMessageChildren(nodes, node.id).reverse(),
    assistantChildrenIds: findResponseMessageChildren(nodes, node.parentId),
  }));
};
