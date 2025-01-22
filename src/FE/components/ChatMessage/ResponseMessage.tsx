import { useEffect, useRef, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { preprocessLaTeX } from '@/utils/chats';

import { AdminModelDto } from '@/types/adminApis';
import { ChatSpanStatus, Content } from '@/types/chat';
import { ReactionMessageType } from '@/types/chatMessage';

import { CodeBlock } from '@/components/Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';

import ChatError from '../ChatError/ChatError';
import { Button } from '../ui/button';
import ResponseMessageActions from './ResponseMessageActions';

import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export interface ResponseMessage {
  id: string;
  content: Content;
  status: ChatSpanStatus;
  spanId: number | null;
}

interface Props {
  readonly?: boolean;
  message: ResponseMessage;
  models: AdminModelDto[];
  onChangeChatLeafMessageId?: (messageId: string) => void;
  onRegenerate?: (spanId: number, messageId: string, modelId: number) => void;
  onReactionMessage?: (type: ReactionMessageType, messageId: string) => void;
  onEditResponseMessage?: (
    messageId: string,
    content: Content,
    isCopy?: boolean,
  ) => void;
  onDeleteResponseMessage?: (messageId: string) => void;
}

const ResponseMessage = (props: Props) => {
  const {
    message,
    readonly,
    models,
    onChangeChatLeafMessageId,
    onRegenerate,
    onReactionMessage,
    onEditResponseMessage,
    onDeleteResponseMessage,
  } = props;
  const { t } = useTranslation();

  const { id: messageId, status: chatStatus, content } = message;
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageContent, setMessageContent] = useState(message.content);

  const handleEditMessage = (isCopyAndSave: boolean = false) => {
    if (isCopyAndSave || content != messageContent) {
      onEditResponseMessage &&
        onEditResponseMessage(messageId, messageContent, isCopyAndSave);
    }
    setIsEditing(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent({
      text: event.target.value,
      fileIds: content.fileIds,
    });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault();
      handleEditMessage();
    }
  };

  const handleToggleEditing = () => {
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    setMessageContent(content);
  }, [content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return isEditing ? (
    <div className="flex relative">
      <div className="flex w-full flex-col">
        <textarea
          ref={textareaRef}
          className="w-full h-auto outline-none resize-none whitespace-pre-wrap border-none rounded-md bg-muted"
          value={messageContent.text}
          onChange={handleInputChange}
          onKeyDown={handlePressEnter}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            padding: '10px',
            paddingBottom: '60px',
            margin: '0',
            overflow: 'hidden',
          }}
        />

        <div className="absolute right-2 bottom-2 flex justify-end space-x-4">
          <Button
            variant="link"
            className="rounded-md px-4 py-1 text-sm font-medium"
            onClick={() => {
              handleEditMessage(true);
            }}
            disabled={(messageContent.text || '')?.trim().length <= 0}
          >
            {t('Save As Copy')}
          </Button>
          <Button
            variant="default"
            className="rounded-md px-4 py-1 text-sm font-medium"
            onClick={() => {
              handleEditMessage();
            }}
            disabled={(messageContent.text || '')?.trim().length <= 0}
          >
            {t('Save')}
          </Button>
          <Button
            variant="outline"
            className="rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            onClick={() => {
              setMessageContent(content);
              setIsEditing(false);
            }}
          >
            {t('Cancel')}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <>
      <MemoizedReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex as any]}
        components={{
          code({ node, className, inline, children, ...props }) {
            if (children.length) {
              if (children[0] == '▍') {
                return (
                  <span className="animate-pulse cursor-default mt-1">▍</span>
                );
              }

              children[0] = (children[0] as string).replace('`▍`', '▍');
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
          p({ children }) {
            return <p className="md-p">{children}</p>;
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
        {`${preprocessLaTeX(message.content.text!)}${
          chatStatus === ChatSpanStatus.Chatting ? '`▍`' : ''
        }`}
      </MemoizedReactMarkdown>
      {message.status === ChatSpanStatus.Failed && (
        <ChatError error={message.content.error} />
      )}
      <ResponseMessageActions
        key={'response-actions-' + message.id}
        readonly={readonly}
        models={models}
        chatStatus={message.status}
        message={message as any}
        onToggleEditingMessage={handleToggleEditing}
        onChangeMessage={onChangeChatLeafMessageId}
        onReactionMessage={onReactionMessage}
        onRegenerate={(messageId: string, modelId: number) => {
          onRegenerate && onRegenerate(message.spanId!, messageId, modelId);
        }}
        onDeleteResponseMessage={onDeleteResponseMessage}
      />
    </>
  );
};

export default ResponseMessage;
