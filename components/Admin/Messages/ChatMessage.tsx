import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconRefresh,
  IconRobot,
  IconUser,
} from '@/components/Icons/index';
import { FC, memo, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Message } from '@/types/chat';
import { CodeBlock } from '../../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../../Markdown/MemoizedReactMarkdown';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { HomeContext } from '@/pages/home/home';

export interface Props {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  currentSelectIndex: number;
  parentChildrenIds: string[];
  message: Message;
  onChangeMessage?: (messageId: string) => void;
  onEdit?: (editedMessage: Message, parentId: string | null) => void;
  onRegenerate?: () => void;
}

export const ChatMessage: FC<Props> = memo(
  ({ parentChildrenIds, currentSelectIndex, message, onChangeMessage }) => {
    const { t } = useTranslation('chat');

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const toggleEditing = () => {
      setIsEditing(!isEditing);
    };

    const handleInputChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setMessageContent({
        text: event.target.value,
        image: message.content.image,
      });
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(message.content.text || '').then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    useEffect(() => {
      setMessageContent(message.content);
    }, [message.content]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    return (
      <div
        className={`group md:px-4 ${
          message.role === 'assistant'
            ? 'text-gray-800 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-100'
        }`}
        style={{ overflowWrap: 'anywhere' }}
      >
        <div className='relative m-auto flex px-4 py-1 text-base md:max-w-2xl lg:max-w-2xl lg:px-0 xl:max-w-5xl'>
          <div className='min-w-[28px] text-right font-bold'>
            {message.role === 'assistant' ? (
              <IconRobot size={28} />
            ) : (
              <IconUser size={28} />
            )}
          </div>

          <div className='prose mt-[2px] px-4 w-full dark:prose-invert'>
            {message.role === 'user' ? (
              <>
                <div>
                  <div className='flex flex-wrap gap-2'>
                    {message.content?.image &&
                      message.content.image.map((img, index) => (
                        <img
                          className='rounded-md mr-2'
                          key={index}
                          style={{ maxWidth: 268, maxHeight: 168 }}
                          src={img}
                          alt=''
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

                {!isEditing && (
                  <div className='flex gap-2'>
                    <>
                      {parentChildrenIds.length > 1 && (
                        <div className='flex gap-1 text-sm'>
                          <button
                            className={
                              currentSelectIndex === 0
                                ? 'text-gray-400'
                                : 'cursor-pointer'
                            }
                            disabled={currentSelectIndex === 0}
                            onClick={() => {
                              if (onChangeMessage) {
                                const index = currentSelectIndex - 1;
                                onChangeMessage(parentChildrenIds[index]);
                              }
                            }}
                          >
                            &lt;
                          </button>
                          <span>
                            {`${currentSelectIndex + 1}/${
                              parentChildrenIds.length
                            }`}
                          </span>
                          <button
                            className={
                              currentSelectIndex ===
                              parentChildrenIds.length - 1
                                ? 'text-gray-400'
                                : 'cursor-pointer'
                            }
                            disabled={
                              currentSelectIndex ===
                              parentChildrenIds.length - 1
                            }
                            onClick={() => {
                              if (onChangeMessage) {
                                const index = currentSelectIndex + 1;
                                onChangeMessage(parentChildrenIds[index]);
                              }
                            }}
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className='pr-4 md:pr-0'>
                  <MemoizedReactMarkdown
                    className='prose dark:prose-invert flex-1'
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeMathjax]}
                    components={{
                      code({ node, className, inline, children, ...props }) {
                        if (children.length) {
                          if (children[0] == '▍') {
                            return (
                              <span className='animate-pulse cursor-default mt-1'>
                                ▍
                              </span>
                            );
                          }

                          children[0] = (children[0] as string).replace(
                            '`▍`',
                            '▍'
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
                          <table className='border-collapse border border-black px-3 py-1 dark:border-white'>
                            {children}
                          </table>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className='break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white'>
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className='break-words border border-black px-3 py-1 dark:border-white'>
                            {children}
                          </td>
                        );
                      },
                    }}
                  >
                    {`${message.content.text}`}
                  </MemoizedReactMarkdown>
                </div>

                <div className='flex gap-2'>
                  {messagedCopied ? (
                    <IconCheck className='text-green-500 dark:text-green-400' />
                  ) : (
                    <button
                      className='invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      onClick={copyOnClick}
                    >
                      <IconCopy />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);
ChatMessage.displayName = 'ChatMessage';
