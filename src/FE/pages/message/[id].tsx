import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { getQueryId } from '@/utils/common';
import { getSelectedMessages } from '@/utils/message';

import { GetMessageDetailsResult } from '@/types/adminApis';
import { ChatMessage } from '@/types/chatMessage';

import { ChatMessageByReadOnly } from '@/components/ChatMessage/ChatMessageByReadOnly';

import { getMessageDetails } from '@/apis/adminApis';

export default function MessageDetails() {
  const router = useRouter();
  const [chat, setChat] = useState<GetMessageDetailsResult | null>(null);
  const [selectMessages, setSelectMessages] = useState<ChatMessage[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [chatSummary, setChatSummary] = useState<{
    tokenUsed: number;
    calculatedPrice: number;
  }>({
    tokenUsed: 0,
    calculatedPrice: 0,
  });

  useEffect(() => {
    if (!router.isReady) return;
    const messageId = getQueryId(router);
    getMessageDetails(messageId).then((data) => {
      document.title = data.name;
      if (data.messages.length > 0) {
        setChat(data);
        setCurrentMessages(data.messages);
        let tokenUsed = 0;
        let calculatedPrice = 0;
        data.messages.forEach((x) => {
          x.inputPrice = x.inputPrice || 0;
          tokenUsed += ((x.inputTokens || 0) + (x.outputTokens || 0))!;
          calculatedPrice += x.inputPrice + (x.outputPrice || 0);
        });
        setChatSummary({ tokenUsed, calculatedPrice });
        const lastMessage = data.messages[data.messages.length - 1];
        const _selectMessages = getSelectedMessages(
          data.messages,
          lastMessage.id,
        );
        setSelectMessages(_selectMessages);
      }
    });
  }, [router.isReady]);

  const onMessageChange = (messageId: string) => {
    const _selectMessages = getSelectedMessages(currentMessages, messageId);
    setSelectMessages(_selectMessages);
  };

  return (
    <>
      {selectMessages.length !== 0 && (
        <div className="flex justify-center gap-2 my-2 font-semibold">
          <div>{chat?.modelName}</div>
          <div>{chat?.modelTemperature}­°C</div>
          <div>
            {chatSummary.tokenUsed}/{chatSummary.calculatedPrice.toFixed(8)}￥
          </div>
        </div>
      )}
      {/* {chat &&
        selectMessages.map((current, index) => {
          let parentChildrenIds: string[] = [];
          if (!current.parentId) {
            parentChildrenIds = currentMessages
              .filter((x) => !x.parentId)
              .map((x) => x.id);
          } else {
            parentChildrenIds =
              currentMessages.find((x) => x.id === current.parentId) || [];
            parentChildrenIds = [...parentChildrenIds].reverse();
          }
          return (
            <ChatMessageByReadOnly
              currentSelectIndex={parentChildrenIds.findIndex(
                (x) => x === current.id,
              )}
              isLastMessage={selectMessages.length - 1 === index}
              key={current.id + index}
              parentId={current.parentId}
              onChangeMessage={(messageId: string) => {
                onMessageChange(messageId);
              }}
              childrenIds={current.childrenIds!}
              parentChildrenIds={parentChildrenIds}
              assistantChildrenIds={current.assistantChildrenIds!}
              assistantCurrentSelectIndex={current.assistantChildrenIds!.findIndex(
                (x) => x === current.id,
              )}
              modelName={current.modelName}
              message={{
                id: current.id!,
                role: current.role,
                content: current.content,
                duration: current.duration || 0,
                firstTokenLatency: current.firstTokenLatency || 0,
                inputTokens: current.inputTokens || 0,
                outputTokens: current.outputTokens || 0,
                reasoningTokens: current.reasoningTokens || 0,
                inputPrice: current.inputPrice || 0,
                outputPrice: current.outputPrice || 0,
              }}
            />
          );
        })} */}
    </>
  );
}
