import { AdminModelDto } from '@/types/adminApis';
import { ChatRole, ChatStatus, Content } from '@/types/chat';

import ChangeModelAction from './ChangeModelAction';
import CopyAction from './CopyAction';
import GenerateInformationAction from './GenerateInformationAction';
import PaginationAction from './PaginationAction';

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
  modelId: number;
  modelName: string;
}

interface Props {
  models: AdminModelDto[];
  message: ResponseMessage;
  chatStatus: ChatStatus;
  onChangeMessage?: (messageId: string) => void;
  onRegenerate?: (messageId: string, modelId: number) => void;
}

const ResponseMessageActions = (props: Props) => {
  const { models, message, onChangeMessage, onRegenerate, chatStatus } = props;
  const { id: messageId, siblingIds, modelId, modelName } = message;
  const currentMessageIndex = siblingIds.findIndex((x) => x === messageId);

  return (
    <>
      {chatStatus === ChatStatus.Chatting ? (
        <div className="h-9"></div>
      ) : (
        <div className="flex gap-1 flex-wrap mt-1">
          <PaginationAction
            hidden={siblingIds.length <= 1}
            disabledPrev={currentMessageIndex === 0}
            disabledNext={currentMessageIndex === siblingIds.length - 1}
            messageIds={siblingIds}
            currentSelectIndex={currentMessageIndex}
            onChangeMessage={onChangeMessage}
          />
          <div className="visible flex gap-0 items-center">
            <CopyAction text={message.content.text} />
            <GenerateInformationAction message={message} />
            <ChangeModelAction
              models={models}
              onChangeModel={(model) => {
                onRegenerate && onRegenerate(message.parentId!, model.modelId);
              }}
              showRegenerate={true}
              modelName={modelName!}
              modelId={modelId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseMessageActions;
