import { useContext } from 'react';

import { PropsMessage } from '@/types/components/chat';

import { HomeContext } from '@/pages/home/home';

import ChangeModelAction from './ChangeModelAction';
import CopyAction from './CopyAction';
import GenerateInformationAction from './GenerateInformationAction';
import PaginationAction from './PaginationAction';
import RegenerateAction from './RegenerateAction';

import { cn } from '@/lib/utils';

interface Props {
  hidden?: boolean;
  readonly?: boolean;
  message: PropsMessage;
  modelName?: string;
  modelId?: string;
  lastMessageId: string | null;
  assistantCurrentSelectIndex: number;
  assistantChildrenIds: string[];
  onChangeMessage?: (messageId: string) => void;
  onRegenerate?: (modelId?: string) => void;
}

const ResponseMessageActions = (props: Props) => {
  const {
    state: { messageIsStreaming },
  } = useContext(HomeContext);

  const {
    readonly,
    message,
    modelName,
    modelId,
    lastMessageId,
    assistantCurrentSelectIndex,
    assistantChildrenIds,
    onChangeMessage,
    onRegenerate,
    hidden,
  } = props;

  return (
    <>
      {!hidden ? (
        <div className="flex gap-1 flex-wrap ml-[-8px] mt-1">
          <PaginationAction
            hidden={assistantChildrenIds.length <= 1}
            disabledPrev={
              assistantCurrentSelectIndex === 0 || messageIsStreaming
            }
            disabledNext={
              assistantCurrentSelectIndex === assistantChildrenIds.length - 1 ||
              messageIsStreaming
            }
            messageIds={assistantChildrenIds}
            currentSelectIndex={assistantCurrentSelectIndex}
            onChangeMessage={onChangeMessage}
          />
          <div
            className={cn(
              lastMessageId === message.id ? 'visible' : 'invisible',
              'flex gap-0 items-center group-hover:visible focus:visible',
            )}
          >
            <CopyAction text={message.content.text} />
            <GenerateInformationAction message={message} />
            <RegenerateAction
              onRegenerate={() => {
                onRegenerate && onRegenerate(modelId);
              }}
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
  );
};

export default ResponseMessageActions;
