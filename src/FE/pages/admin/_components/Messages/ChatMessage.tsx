import { FC, memo } from 'react';


import { preprocessLaTeX } from '@/utils/chats';

import { Content, Message, Role } from '@/types/chat';

import CopyAction from '@/pages/_components/ChatMessage/CopyAction';
import GenerateInformationAction from '@/pages/_components/ChatMessage/GenerateInformationAction';
import { CodeBlock } from '@/pages/_components/Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '@/pages/_components/Markdown/MemoizedReactMarkdown';

import {
  IconChevronLeft,
  IconChevronRight,
  IconRobot,
  IconUser,
} from '@/components/Icons/index';
import { Button } from '@/components/ui/button';

import Decimal from 'decimal.js';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface PropsMessage {
  id: string;
  role: Role;
  content: Content;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  inputPrice: Decimal;
  outputPrice: Decimal;
  duration: number;
  firstTokenLatency: number;
}

export interface Props {
  isLastMessage: boolean;
  parentId: string | null;
  childrenIds: string[];
  assistantChildrenIds: string[];
  currentSelectIndex: number;
  assistantCurrentSelectIndex: number;
  parentChildrenIds: string[];
  modelName?: string;
  message: PropsMessage;
  onChangeMessage?: (messageId: string) => void;
  onEdit?: (editedMessage: Message, parentId: string | null) => void;
  onRegenerate?: (modelId?: string) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({
    isLastMessage,
    parentChildrenIds,
    assistantChildrenIds,
    currentSelectIndex,
    assistantCurrentSelectIndex,
    modelName,
    message,
    onChangeMessage,
  }) => {
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
            {message.role === 'assistant' ? (
              <IconRobot size={28} />
            ) : (
              <IconUser size={28} />
            )}
          </div>

          <div className="prose mt-[2px] px-4 w-full dark:prose-invert">
            {message.role === 'user' ? (
              <>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {message.content?.fileIds &&
                      message.content.fileIds.map((img, index) => (
                        <img
                          className="rounded-md mr-2 not-prose"
                          key={index}
                          style={{ maxWidth: 268, maxHeight: 168 }}
                          src={img.url}
                          alt=""
                        />
                      ))}
                  </div>
                  <div
                    className={`prose whitespace-pre-wrap dark:prose-invert ${
                      message.content?.fileIds &&
                      message.content.fileIds.length > 0
                        ? 'mt-2'
                        : ''
                    }`}
                  >
                    {message.content.text}
                  </div>
                </div>

                <div className="flex">
                  <>
                    {parentChildrenIds.length > 1 && (
                      <div className="flex text-sm items-center ml-[-8px]">
                        <Button
                          variant="ghost"
                          className="p-1 m-0 h-auto disabled:opacity-50"
                          disabled={currentSelectIndex === 0}
                          onClick={() => {
                            if (onChangeMessage) {
                              const index = currentSelectIndex - 1;
                              onChangeMessage(parentChildrenIds[index]);
                            }
                          }}
                        >
                          <IconChevronLeft />
                        </Button>
                        <span className="font-bold">
                          {`${currentSelectIndex + 1}/${
                            parentChildrenIds.length
                          }`}
                        </span>
                        <Button
                          variant="ghost"
                          className="p-1 m-0 h-auto disabled:opacity-50"
                          disabled={
                            currentSelectIndex === parentChildrenIds.length - 1
                          }
                          onClick={() => {
                            if (onChangeMessage) {
                              const index = currentSelectIndex + 1;
                              onChangeMessage(parentChildrenIds[index]);
                            }
                          }}
                        >
                          <IconChevronRight />
                        </Button>
                      </div>
                    )}
                    <CopyAction text={message.content.text} />
                  </>
                </div>
              </>
            ) : (
              <>
                <div className="pr-4 md:pr-0">
                  <MemoizedReactMarkdown
                    className="prose dark:prose-invert flex-1"
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex as any]}
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
                    {preprocessLaTeX(message.content.text)}
                  </MemoizedReactMarkdown>
                </div>

                <div className="flex gap-1 pt-2 flex-wrap">
                  {assistantChildrenIds.length > 1 && (
                    <div className="flex text-sm items-center ml-[-8px]">
                      <Button
                        variant="ghost"
                        className="p-1 m-0 h-auto disabled:opacity-50"
                        disabled={assistantCurrentSelectIndex === 0}
                        onClick={() => {
                          if (onChangeMessage) {
                            const index = assistantCurrentSelectIndex - 1;
                            onChangeMessage(assistantChildrenIds[index]);
                          }
                        }}
                      >
                        <IconChevronLeft />
                      </Button>
                      <span className="font-bold">
                        {`${assistantCurrentSelectIndex + 1}/${
                          assistantChildrenIds.length
                        }`}
                      </span>
                      <Button
                        variant="ghost"
                        className="p-1 m-0 h-auto"
                        disabled={
                          assistantCurrentSelectIndex ===
                          assistantChildrenIds.length - 1
                        }
                        onClick={() => {
                          if (onChangeMessage) {
                            const index = assistantCurrentSelectIndex + 1;
                            onChangeMessage(assistantChildrenIds[index]);
                          }
                        }}
                      >
                        <IconChevronRight />
                      </Button>
                    </div>
                  )}
                  <div
                    className={`flex gap-1 ${
                      isLastMessage ? 'visible' : 'invisible'
                    } group-hover:visible focus:visible`}
                  >
                    <CopyAction text={message.content.text} />
                    <GenerateInformationAction message={message} />

                    <Button variant="ghost" className="p-1 m-0 h-auto">
                      {modelName}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
