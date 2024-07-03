import { FC, memo, useContext, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Message } from '@/types/chat';
import { PropsMessage } from '@/types/components/chat';

import { HomeContext } from '@/pages/home/home';

import { IconRobot } from '@/components/Icons/index';

import { CodeBlock } from '../../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../../Markdown/MemoizedReactMarkdown';
import ChangeModelAction from './ChangeModelAction';
import CopyAction from './CopyAction';
import GenerateInformationAction from './GenerateInformationAction';
import PaginationAction from './PaginationAction';
import RegenerateAction from './RegenerateAction';
import UserMessage from './UserMessage';

import { cn } from '@/lib/utils';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export interface Props {
  readonly?: boolean;
  parentId: string | null;
  childrenIds: string[];
  assistantChildrenIds: string[];
  currentSelectIndex: number;
  assistantCurrentSelectIndex: number;
  parentChildrenIds: string[];
  modelName?: string;
  lastMessageId: string;
  message: PropsMessage;
  onChangeMessage?: (messageId: string) => void;
  onEdit?: (editedMessage: Message, parentId: string | null) => void;
  onRegenerate?: (modelId?: string) => void;
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
    lastMessageId,
    message,
    onEdit,
    onChangeMessage,
    onRegenerate,
  }) => {
    const {
      state: { messageIsStreaming, chatError, currentChatMessageId },
    } = useContext(HomeContext);

    return (
      <div
        className={`group md:px-4 ${
          message.role === 'assistant'
            ? 'text-gray-800 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-100'
        }`}
        style={{ overflowWrap: 'anywhere' }}
      >
        <div className="relative m-auto flex px-4 py-[10px] text-base md:max-w-2xl lg:max-w-2xl lg:px-0 xl:max-w-5xl">
          <div className="min-w-[28px] text-right font-bold">
            {message.role === 'assistant' && <IconRobot size={28} />}
          </div>

          <div className="prose mt-[2px] w-full px-4 dark:prose-invert">
            {message.role === 'user' ? (
              <UserMessage
                message={message}
                parentId={parentId}
                currentSelectIndex={currentSelectIndex}
                parentChildrenIds={parentChildrenIds}
                onChangeMessage={onChangeMessage}
                onEdit={onEdit}
              />
            ) : (
              <>
                <div className="pr-4 md:pr-0">
                  <MemoizedReactMarkdown
                    className="prose dark:prose-invert flex-1"
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeMathjax]}
                    components={{
                      code({ node, className, inline, children, ...props }) {
                        if (children.length) {
                          if (children[0] == '▍') {
                            return (
                              <span className="animate-pulse cursor-default mt-1">
                                ▍
                              </span>
                            );
                          }

                          children[0] = (children[0] as string).replace(
                            '`▍`',
                            '▍',
                          );
                        }

                        const match = /language-(\w+)/.exec(className || '');

                        return !inline ? (
                          <CodeBlock
                            key={Math.random()}
                            language={(match && match[1]) || ''}
                            value={String(children).replace(/\n$/, '')}
                            {...props}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      table({ children }) {
                        return (
                          <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                            {children}
                          </table>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className="break-words border border-black px-3 py-1 dark:border-white">
                            {children}
                          </td>
                        );
                      },
                    }}
                  >
                    {`${message.content.text}${
                      messageIsStreaming && message.id == currentChatMessageId
                        ? '`▍`'
                        : ''
                    }`}
                  </MemoizedReactMarkdown>
                </div>

                {!messageIsStreaming ? (
                  <div className="flex gap-1 flex-wrap ml-[-8px]">
                    <PaginationAction
                      hidden={assistantChildrenIds.length <= 1}
                      disabledPrev={
                        assistantCurrentSelectIndex === 0 || messageIsStreaming
                      }
                      disabledNext={
                        assistantCurrentSelectIndex ===
                          assistantChildrenIds.length - 1 || messageIsStreaming
                      }
                      messageIds={assistantChildrenIds}
                      currentSelectIndex={assistantCurrentSelectIndex}
                      onChangeMessage={onChangeMessage}
                    />
                    <div
                      className={cn(
                        lastMessageId === message.id ? 'visible' : 'invisible',
                        'flex gap-0 items-center  group-hover:visible focus:visible',
                      )}
                    >
                      <CopyAction text={message.content.text} />
                      <GenerateInformationAction message={message} />
                      <RegenerateAction
                        hidden={chatError}
                        onRegenerate={onRegenerate}
                      />
                      <ChangeModelAction
                        readonly={readonly}
                        onChangeModel={(modelId: string) => {
                          onRegenerate && onRegenerate(modelId);
                        }}
                        modelName={modelName!}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-9"></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';
