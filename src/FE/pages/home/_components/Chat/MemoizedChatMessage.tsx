import { FC, memo } from 'react';

import { ChatMessage, Props } from '@/components/ChatMessage';

const MemoizedChatMessage: FC<Props> = memo(
  ChatMessage,
  (prevProps, nextProps) =>
    prevProps.message.content === nextProps.message.content &&
    prevProps.messageIsStreaming === nextProps.messageIsStreaming,
);

export default MemoizedChatMessage;
