import { AdminModelDto } from '@/types/adminApis';
import { ChatRole, Content } from '@/types/chat';
import { PropsMessage } from '@/types/components/chat';

import ChangeModelAction from './ChangeModelAction';
import CopyAction from './CopyAction';
import GenerateInformationAction from './GenerateInformationAction';
import PaginationAction from './PaginationAction';
import RegenerateAction from './RegenerateAction';

import { cn } from '@/lib/utils';

export interface ResponseMessage {
  id: string;
  siblingIds: string[];
  parentId: string | null;
  role: ChatRole;
  content: Content;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  inputPrice: number;
  outputPrice: number;
  duration: number;
  firstTokenLatency: number;
}

interface Props {
  models: AdminModelDto[];
  message: ResponseMessage;
  modelName?: string;
  modelId?: number;
  messageIsStreaming: boolean;
  onChangeMessage?: (messageId: string) => void;
  onRegenerate?: (modelId?: number) => void;
}

const ResponseMessageActions = (props: Props) => {
  const {
    models,
    message,
    modelName,
    modelId,
    onChangeMessage,
    onRegenerate,
    messageIsStreaming,
  } = props;
  const { id: messageId, siblingIds, parentId, content } = message;
  const currentMessageIndex = siblingIds.findIndex((x) => x === messageId);

  return (
    <>
      {messageIsStreaming ? (
        <div className="h-9"></div>
      ) : (
        <div className="flex gap-1 flex-wrap mt-1">
          <PaginationAction
            hidden={siblingIds.length <= 1}
            disabledPrev={currentMessageIndex === 0 || messageIsStreaming}
            disabledNext={
              currentMessageIndex === siblingIds.length - 1 ||
              messageIsStreaming
            }
            messageIds={siblingIds}
            currentSelectIndex={currentMessageIndex}
            onChangeMessage={onChangeMessage}
          />
          <div
            className={cn(
              // lastMessageId === message.id ? 'visible' : 'invisible',
              'visible flex gap-0 items-center group-hover:visible focus:visible',
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
              models={models}
              onChangeModel={(modelId: number) => {
                onRegenerate && onRegenerate(modelId);
              }}
              modelName={modelName!}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseMessageActions;
