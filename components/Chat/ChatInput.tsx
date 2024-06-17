import {
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { isMobile } from '@/utils/common';

import { Content, Message } from '@/types/chat';
import { Prompt } from '@/types/prompt';

import { HomeContext } from '@/pages/home/home';

import {
  IconArrowDown,
  IconCircleX,
  IconPaperclip,
  IconSend,
  IconStopFilled,
} from '@/components/Icons/index';

import UploadButton from '../UploadButton';
import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';

import { stopChat } from '@/apis/userService';

interface Props {
  onSend: (message: Message) => void;
  onScrollDownClick: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  showScrollDownButton: boolean;
}

export const ChatInput = ({
  onSend,
  onScrollDownClick,
  stopConversationRef,
  textareaRef,
  showScrollDownButton,
}: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectModelId,
      messageIsStreaming,
      models,
      prompts,
      selectChatId,
      chatError,
    },
    getModel,
  } = useContext(HomeContext);

  const { fileConfig, fileServerConfig, modelConfig } =
    getModel(models, selectModelId!) || {};

  const [content, setContent] = useState<Content>({
    text: '',
    image: [],
  });
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const promptListRef = useRef<HTMLUListElement | null>(null);
  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
  );
  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (modelConfig && value.length > modelConfig.maxLength) {
      toast.error(
        t(
          `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength: modelConfig.maxLength, valueLength: value.length },
        ),
      );
      return;
    }

    setContent({ ...content, text: value });
    updatePromptListVisibility(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content.text) {
      toast.error(t('Please enter a message'));
      return;
    }
    onSend({ role: 'user', content });
    setContent({ text: '', image: [] });

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleStopChat = () => {
    stopConversationRef.current = true;
    stopChat(selectChatId!);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent.text?.replace(
          /\/\w*$/,
          prompt.content,
        );
        return { ...prevContent, text: updatedContent };
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex];
    if (selectedPrompt) {
      setContent((prevContent) => {
        const newContent = prevContent.text?.replace(
          /\/\w*$/,
          selectedPrompt.content,
        );
        return { ...prevContent, text: newContent };
      });
      handlePromptSelect(selectedPrompt);
    }
    setShowPromptList(false);
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = content.text?.replace(/{{(.*?)}}/g, (_, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setContent({ ...content, text: newContent });

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  useEffect(() => {
    setContent({ ...content, image: [] });
  }, [selectModelId, selectChatId]);

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#262630] dark:to-[#262630] md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-5xl">
        {!chatError ? (
          <div className="relative flex w-full flex-grow flex-col rounded-md bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            <div className="absolute mb-1 bottom-full mx-auto flex w-full justify-start z-10">
              {content?.image &&
                content.image.map((img, index) => (
                  <div className="relative group" key={index}>
                    <div className="mr-1 w-[32px] h-[32px] rounded overflow-hidden">
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover shadow-lg"
                      />
                      <button
                        onClick={() => {
                          setContent((pre) => {
                            const image = pre.image?.filter((x) => x !== img);
                            return {
                              text: pre.text,
                              image,
                            };
                          });
                        }}
                        className="absolute top-[-5px] right-[-1px]"
                      >
                        <IconCircleX
                          className="text-black/50 dark:text-white/50"
                          size={12}
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <textarea
              ref={textareaRef}
              className="m-0 w-full resize-none border-none outline-none bg-transparent rounded-md p-0 py-2 pr-16 pl-4 text-black dark:bg-[#202123] dark:text-white md:py-3 md:pl-4"
              style={{
                resize: 'none',
                bottom: `${textareaRef?.current?.scrollHeight}px`,
                maxHeight: '400px',
                overflow: `${
                  textareaRef.current && textareaRef.current.scrollHeight > 400
                    ? 'auto'
                    : 'hidden'
                }`,
              }}
              placeholder={
                t('Type a message or type "/" to select a prompt...') || ''
              }
              value={content?.text}
              rows={1}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />

            <div className="flex">
              <button
                className="absolute right-2 md:top-2.5 top-1.5 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-accent hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
                onClick={handleSend}
              >
                {messageIsStreaming ? (
                  <IconStopFilled
                    onClick={handleStopChat}
                    className="h-4 w-4"
                  />
                ) : (
                  <IconSend size={18} />
                )}
              </button>
              {fileServerConfig &&
                !uploading &&
                content?.image?.length !== fileConfig?.maxCount && (
                  <UploadButton
                    fileServerConfig={fileServerConfig}
                    fileConfig={fileConfig!}
                    onUploading={() => setUploading(true)}
                    onFailed={() => setUploading(false)}
                    onSuccessful={(url: string) => {
                      setContent((pre) => {
                        const image = pre.image!.concat(url);
                        return {
                          text: pre.text,
                          image,
                        };
                      });
                      setUploading(false);
                    }}
                  >
                    <IconPaperclip size={18} />
                  </UploadButton>
                )}
            </div>

            {showScrollDownButton && (
              <div className="absolute bottom-12 right-0 lg:bottom-0 lg:-right-10">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
                  onClick={onScrollDownClick}
                >
                  <IconArrowDown size={18} />
                </button>
              </div>
            )}

            {showPromptList && filteredPrompts.length > 0 && (
              <div className="absolute bottom-12 w-full">
                <PromptList
                  activePromptIndex={activePromptIndex}
                  prompts={filteredPrompts}
                  onSelect={handleInitModal}
                  onMouseOver={setActivePromptIndex}
                  promptListRef={promptListRef}
                />
              </div>
            )}

            {isModalVisible && (
              <VariableModal
                prompt={filteredPrompts[activePromptIndex]}
                variables={variables}
                onSubmit={handleSubmit}
                onClose={() => setIsModalVisible(false)}
              />
            )}
          </div>
        ) : (
          <></>
          // <div className='flex flex-col w-full items-center gap-2'>
          //   <Button onClick={handleSend}>
          //     {t('Regenerate response')}
          //   </Button>
          //   <div className='text-black/50 dark:text-white/50'>
          //     {t('Error generating response, click to regenerate response.')}
          //   </div>
          // </div>
        )}
      </div>
      <div className="px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
        {/* .
        {t(
          "Copyright."
        )} */}
      </div>
    </div>
  );
};
