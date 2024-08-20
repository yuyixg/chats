import { FC, memo, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { formatNumberAsMoney } from '@/utils/common';

import { Content, Message, Role } from '@/types/chat';

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconInfo,
  IconRobot,
  IconUser,
} from '@/components/Icons/index';
import Tips from '@/components/Tips/Tips';
import { Label } from '@/components/ui/label';

import { CodeBlock } from '../../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../../Markdown/MemoizedReactMarkdown';
import { Button } from '../../ui/button';

import Decimal from 'decimal.js';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import { preprocessLaTeX } from '@/utils/chats';

interface PropsMessage {
  id: string;
  role: Role;
  content: Content;
  inputTokens: number;
  outputTokens: number;
  inputPrice: Decimal;
  outputPrice: Decimal;
  duration?: number;
}

export interface Props {
  id: string;
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
    id,
    isLastMessage,
    parentChildrenIds,
    assistantChildrenIds,
    currentSelectIndex,
    assistantCurrentSelectIndex,
    modelName,
    message,
    onChangeMessage,
  }) => {
    const [messagedCopied, setMessageCopied] = useState(false);
    const { t } = useTranslation('chat');

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(message.content.text || '').then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    const GenerateInformation = (props: { name: string; value: string }) => {
      const { name, value } = props;
      return (
        <Label key={name} className="text-xs">
          {t(name)}
          {': '}
          {value}
        </Label>
      );
    };

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
                    {message.content?.image &&
                      message.content.image.map((img, index) => (
                        <img
                          className="rounded-md mr-2"
                          key={index}
                          style={{ maxWidth: 268, maxHeight: 168 }}
                          src={img}
                          alt=""
                        />
                      ))}
                  </div>
                  <div
                    className={`prose whitespace-pre-wrap dark:prose-invert ${
                      message.content?.image && message.content.image.length > 0
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
                          <IconChevronLeft stroke="#7d7d7d" />
                        </Button>
                        <span className="font-bold text-[#7d7d7d]">
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
                          <IconChevronRight stroke="#7d7d7d" />
                        </Button>
                      </div>
                    )}
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
                        <IconChevronLeft stroke="#7d7d7d" />
                      </Button>
                      <span className="font-bold text-[#7d7d7d]">
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
                        <IconChevronRight stroke="#7d7d7d" />
                      </Button>
                    </div>
                  )}
                  <div
                    className={`flex gap-1 ${
                      isLastMessage ? 'visible' : 'invisible'
                    } group-hover:visible focus:visible`}
                  >
                    {messagedCopied ? (
                      <Button variant="ghost" className="p-1 m-0 h-auto">
                        <IconCheck
                          stroke="#7d7d7d"
                          className="text-green-500 dark:text-green-400"
                        />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="p-1 m-0 h-auto"
                        onClick={copyOnClick}
                      >
                        <IconCopy stroke="#7d7d7d" />
                      </Button>
                    )}

                    <Tips
                      className="h-[28px]"
                      trigger={
                        <Button variant="ghost" className="p-1 m-0 h-auto">
                          <IconInfo stroke="#7d7d7d" />
                        </Button>
                      }
                      content={
                        <div className="w-50">
                          <div className="grid gap-4">
                            <div className="pt-1 pb-2">
                              <Label className="font-medium">
                                {t('Generate information')}
                              </Label>
                            </div>
                          </div>
                          <div className="grid">
                            <div className="grid grid-cols-1 items-center">
                              <GenerateInformation
                                name={'duration'}
                                value={
                                  message?.duration?.toLocaleString() + 'ms'
                                }
                              />
                              <GenerateInformation
                                name={'prompt_tokens'}
                                value={`${message.inputTokens}`}
                              />
                              <GenerateInformation
                                name={'response_tokens'}
                                value={`${message.outputTokens}`}
                              />
                              <GenerateInformation
                                name={'total_tokens'}
                                value={`${
                                  message.inputTokens + message.outputTokens
                                }`}
                              />
                              <GenerateInformation
                                name={'speed'}
                                value={
                                  message?.duration
                                    ? (
                                        (message.outputTokens /
                                          (message?.duration || 0)) *
                                        1000
                                      ).toFixed(2) + ' tokens/s'
                                    : '-'
                                }
                              />
                              <GenerateInformation
                                name={'prompt_price'}
                                value={
                                  '￥' +
                                  formatNumberAsMoney(+message.inputPrice, 6)
                                }
                              />
                              <GenerateInformation
                                name={'response_price'}
                                value={
                                  '￥' +
                                  formatNumberAsMoney(+message.outputPrice, 6)
                                }
                              />
                              <GenerateInformation
                                name={'total_price'}
                                value={
                                  '￥' +
                                  formatNumberAsMoney(
                                    +message.inputPrice + +message.outputPrice,
                                    6,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      }
                    />

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
ChatMessage.displayName = 'ChatMessage';
