import { FC, memo } from 'react';

import { IChat, Message } from '@/types/chat';
import { PropsMessage } from '@/types/components/chat';

import { IconRobot } from '@/components/Icons/index';

import ChatError from '../ChatError/ChatError';
import ResponseMessage from './ResponseMessage';
import ResponseMessageActions from './ResponseMessageActions';
import UserMessage from './UserMessage';

export interface Props {
  readonly?: boolean;
  parentId: string | null;
  childrenIds: string[];
  assistantChildrenIds: string[];
  currentSelectIndex: number;
  assistantCurrentSelectIndex: number;
  parentChildrenIds: string[];
  modelName?: string;
  modelId?: number;
  lastMessageId: string;
  currentChatMessageId: string;
  message: PropsMessage;
  messageIsStreaming: boolean;
  chatError: boolean;
  selectChat: IChat;
  onChangeMessage?: (messageId: string) => void;
  onEdit?: (editedMessage: Message, parentId: string | null) => void;
  onRegenerate?: (modelId?: number) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({
    readonly = false,
    parentChildrenIds,
    assistantChildrenIds,
    currentSelectIndex,
    assistantCurrentSelectIndex,
    parentId,
    modelName,
    modelId,
    lastMessageId,
    message,
    messageIsStreaming,
    currentChatMessageId,
    chatError,
    selectChat,
    onEdit,
    onChangeMessage,
    onRegenerate,
  }) => {
    return (
      <div className={'group md:px-4 text-gray-800 dark:text-gray-100'}>
        <div className="relative m-auto flex px-4 py-[10px] text-base md:max-w-2xl lg:max-w-2xl lg:px-0 xl:max-w-5xl">
          <div className="min-w-[28px] text-right font-bold hidden lg:block pr-2">
            {message.role === 'assistant' && <IconRobot size={28} />}
          </div>

          <div className="prose w-full dark:prose-invert rounded-r-md">
            {message.role === 'user' && (
              <UserMessage
                selectChat={selectChat}
                messageIsStreaming={messageIsStreaming}
                message={message}
                parentId={parentId}
                currentSelectIndex={currentSelectIndex}
                parentChildrenIds={parentChildrenIds}
                onChangeMessage={onChangeMessage}
                onEdit={onEdit}
              />
            )}

            {message.role === 'assistant' && (
              <ResponseMessage
                messageIsStreaming={messageIsStreaming}
                currentChatMessageId={currentChatMessageId}
                message={message}
                parentId={parentId}
                currentSelectIndex={currentSelectIndex}
                parentChildrenIds={parentChildrenIds}
              />
            )}

            {((lastMessageId === message.id && chatError) ||
              message.content.error) && (
              <ChatError error={message.content.error} />
            )}

            {message.role === 'assistant' && (
              <ResponseMessageActions
                messageIsStreaming={messageIsStreaming}
                readonly={readonly}
                message={message}
                lastMessageId={lastMessageId}
                modelName={modelName}
                modelId={modelId}
                assistantCurrentSelectIndex={assistantCurrentSelectIndex}
                assistantChildrenIds={assistantChildrenIds}
                onChangeMessage={onChangeMessage}
                onRegenerate={onRegenerate}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';
