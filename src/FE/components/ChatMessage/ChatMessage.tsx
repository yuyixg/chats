import { FC, memo } from 'react';

import { AdminModelDto } from '@/types/adminApis';
import { ChatRole, ChatSpanStatus, IChat, Message } from '@/types/chat';
import { IChatMessage, ReactionMessageType } from '@/types/chatMessage';

import ChatError from '../ChatError/ChatError';
import { IconRobot } from '../Icons';
import ResponseMessage from './ResponseMessage';
import ResponseMessageActions from './ResponseMessageActions';
import UserMessage from './UserMessage';

import { cn } from '@/lib/utils';

export interface Props {
  selectedMessages: IChatMessage[][];
  selectedChat: IChat;
  models?: AdminModelDto[];
  messagesEndRef: any;
  readonly?: boolean;
  onChangeChatLeafMessageId?: (messageId: string) => void;
  onEditMessageSend?: (editedMessage: Message, parentId?: string) => void;
  onRegenerate?: (spanId: number, messageId: string, modelId: number) => void;
  onReactionMessage?: (type: ReactionMessageType, messageId: string) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({
    selectedMessages,
    selectedChat,
    models = [],
    messagesEndRef,
    readonly,
    onChangeChatLeafMessageId,
    onEditMessageSend,
    onRegenerate,
    onReactionMessage,
  }) => {
    const hasMultipleSpan = selectedMessages.find((x) => x.length > 1);
    return (
      <div
        className={cn(
          'w-11/12 m-auto p-0 md:p-4',
          !hasMultipleSpan && 'w-full md:w-4/5',
        )}
      >
        {selectedMessages.map((messages, index) => {
          return (
            <div
              key={'message-group-' + index}
              className={cn(
                messages.find((x) => x.role === ChatRole.User)
                  ? 'flex w-full justify-end'
                  : 'md:grid md:grid-cols-[repeat(auto-fit,minmax(375px,1fr))] gap-4',
              )}
            >
              {messages.map((message) => {
                return (
                  <>
                    {message.role === ChatRole.User && (
                      <div
                        key={'user-message-' + message.id}
                        className={cn(
                          'prose w-full dark:prose-invert rounded-r-md group',
                          index > 0 && 'mt-6',
                        )}
                      >
                        <UserMessage
                          selectedChat={selectedChat}
                          message={message}
                          onChangeMessage={onChangeChatLeafMessageId}
                          onEdit={onEditMessageSend}
                        />
                      </div>
                    )}
                    {message.role === ChatRole.Assistant && (
                      <div
                        onClick={() =>
                          hasMultipleSpan &&
                          onChangeChatLeafMessageId &&
                          onChangeChatLeafMessageId(message.id)
                        }
                        key={'response-message-' + message.id}
                        className={cn(
                          'border-[1px] rounded-md flex w-full',
                          hasMultipleSpan &&
                            message.isActive &&
                            'border-primary/50',
                          hasMultipleSpan && 'p-4',
                          !hasMultipleSpan && 'border-none',
                        )}
                      >
                        {!hasMultipleSpan && (
                          <div className="w-9 h-9 hidden md:block">
                            <IconRobot className="w-7 h-7 mr-1" />
                          </div>
                        )}
                        <div className="prose dark:prose-invert rounded-r-md flex-1 overflow-auto text-base">
                          <ResponseMessage
                            key={'response-message-' + message.id}
                            message={message}
                          />
                          {message.status === ChatSpanStatus.Failed && (
                            <ChatError error={message.content.error} />
                          )}
                          <ResponseMessageActions
                            key={'response-actions-' + message.id}
                            readonly={readonly}
                            models={models}
                            chatStatus={message.status}
                            message={message as any}
                            onChangeMessage={onChangeChatLeafMessageId}
                            onReactionMessage={onReactionMessage}
                            onRegenerate={(
                              messageId: string,
                              modelId: number,
                            ) => {
                              onRegenerate &&
                                onRegenerate(
                                  message.spanId!,
                                  messageId,
                                  modelId,
                                );
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          );
        })}
        <div className="h-[162px] bg-background" ref={messagesEndRef} />
      </div>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';
