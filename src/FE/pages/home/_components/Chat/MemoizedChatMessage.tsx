import { FC, memo } from 'react';

import { ChatMessage, Props } from '../../../_components/ChatMessage';

export const MemoizedChatMessage: FC<Props> = memo(
  ChatMessage,
  (prevProps, nextProps) =>
    prevProps.message.content === nextProps.message.content &&
    prevProps.messageIsStreaming === nextProps.messageIsStreaming,
);
