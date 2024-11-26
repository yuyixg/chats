import { FC, memo, useContext } from 'react';

import { Message } from '@/types/chat';
import { PropsMessage } from '@/types/components/chat';

import { HomeContext } from '@/pages/home';

import { IconRobot } from '@/components/Icons/index';

import ChatError from '../ChatError';
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
  message: PropsMessage;
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
    onEdit,
    onChangeMessage,
    onRegenerate,
  }) => {
    const {
      state: { messageIsStreaming, currentChatMessageId, chatError },
    } = useContext(HomeContext);

    return (
      <div className={'group md:px-4 text-gray-800 dark:text-gray-100'}>
        <div className="relative m-auto flex px-4 py-[10px] text-base md:max-w-2xl lg:max-w-2xl lg:px-0 xl:max-w-5xl">
          <div className="min-w-[28px] text-right font-bold hidden lg:block pr-2">
            {message.role === 'assistant' && <IconRobot size={28} />}
          </div>

          <div className="prose mt-[2px] w-full dark:prose-invert rounded-r-md">
            {message.role === 'user' && (
              <UserMessage
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
                hidden={messageIsStreaming}
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
