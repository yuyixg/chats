import { ChatMessage, MessageNode } from '@/types/chatMessage';
import { ChatModelPriceConfig } from '@/types/model';
import Decimal from 'decimal.js';

export const calcTokenPrice = (
  priceConfig: ChatModelPriceConfig,
  inputTokenCount: number,
  outTokenCount: number
) => {
  return new Decimal(
    calcInputTokenPrice(inputTokenCount, priceConfig.input) +
      calcOutTokenPrice(outTokenCount, priceConfig.out)
  );
};

export const calcInputTokenPrice = (
  inputTokenCount: number,
  inputPrice: number
) => {
  return inputTokenCount * inputPrice;
};

export const calcOutTokenPrice = (outTokenCount: number, outPrice: number) => {
  return outTokenCount * outPrice;
};

function findMessageChildren(
  conversations: ChatMessage[],
  nodeId: string,
  messages: ChatMessage[]
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
  messages: ChatMessage[]
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
  nodeId: string
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
      []
    );
    messageParent.reverse();
    selectMessages = selectMessages.concat([...messageParent, message]);
  }
  selectMessages = selectMessages.concat(messageChildren);
  return selectMessages;
}

const findChildren = (nodes: MessageNode[], parentId: string): string[] => {
  return nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => node.id);
};

export const calculateMessages = (nodes: MessageNode[]): MessageNode[] => {
  return nodes.map((node) => ({
    ...node,
    childrenIds: findChildren(nodes, node.id).reverse(),
  }));
};
