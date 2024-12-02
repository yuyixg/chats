import { useContext, useEffect, useRef, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { Message } from '@/types/chat';
import { PropsMessage } from '@/types/components/chat';

import { HomeContext } from '@/pages/home';

import { Button } from '@/components/ui/button';

import CopyAction from './CopyAction';
import EditAction from './EditAction';
import PaginationAction from './PaginationAction';

interface Props {
  hidden?: boolean;
  message: PropsMessage;
  parentId: string | null;
  currentSelectIndex: number;
  parentChildrenIds: string[];
  onChangeMessage?: (messageId: string) => void;
  onEdit?: (editedMessage: Message, parentId: string | null) => void;
}

const UserMessage = (props: Props) => {
  const {
    state: { selectChat, messageIsStreaming },
  } = useContext(HomeContext);
  const { t } = useTranslation();

  const {
    message,
    parentId,
    currentSelectIndex,
    parentChildrenIds,
    onChangeMessage,
    onEdit,
    hidden,
  } = props;
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageContent, setMessageContent] = useState(message.content);

  const handleEditMessage = () => {
    if (message.content != messageContent) {
      if (selectChat.id && onEdit) {
        onEdit({ ...message, content: messageContent }, parentId);
      }
    }
    setIsEditing(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent({
      text: event.target.value,
      image: message.content.image,
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
    setMessageContent(message.content);
  }, [message.content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  return (
    <>
      <div className="flex flex-row-reverse">
        {isEditing ? (
          <div className="flex w-full flex-col">
            <textarea
              ref={textareaRef}
              className="w-full outline-none resize-none whitespace-pre-wrap border-none rounded-md bg-[#ececec] dark:bg-[#2f2f2f]"
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

            <div className="absolute right-10 bottom-6  md:right-20 md:bottom-7 flex justify-end space-x-4">
              <Button
                variant="default"
                className="rounded-md px-4 py-1 text-sm font-medium"
                onClick={handleEditMessage}
                disabled={(messageContent.text || '')?.trim().length <= 0}
              >
                {t('Send')}
              </Button>
              <Button
                variant="outline"
                className="rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={() => {
                  setMessageContent(message.content);
                  setIsEditing(false);
                }}
              >
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[#ececec]/40 dark:bg-[#2f2f2f] py-2 px-3 rounded-md overflow-x-scroll">
            <div className="flex flex-wrap justify-end text-right gap-2">
              {message.content?.image &&
                message.content.image.map((img, index) => (
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
                message.content?.image && message.content.image.length > 0
                  ? 'mt-2'
                  : ''
              }`}
            >
              {message.content.text}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        {!isEditing && (
          <>
            <EditAction
              disabled={messageIsStreaming}
              onToggleEditing={handleToggleEditing}
            />
            <CopyAction
              triggerClassName="invisible group-hover:visible focus:visible"
              text={message.content.text}
            />
            <PaginationAction
              hidden={parentChildrenIds.length <= 1}
              disabledPrev={currentSelectIndex === 0 || messageIsStreaming}
              disabledNext={
                currentSelectIndex === parentChildrenIds.length - 1 ||
                messageIsStreaming
              }
              currentSelectIndex={currentSelectIndex}
              messageIds={parentChildrenIds}
              onChangeMessage={onChangeMessage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default UserMessage;
