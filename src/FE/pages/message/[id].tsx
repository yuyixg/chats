import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { getSelectMessages } from '@/utils/message';

import { GetMessageDetailsResult } from '@/types/adminApis';
import { ChatMessage } from '@/types/chatMessage';

import { ChatMessage as ChatMessageComponent } from '@/components/Admin/Messages/ChatMessage';

import { getMessageDetails } from '@/apis/adminApis';
import Decimal from 'decimal.js';

export default function MessageDetails() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [chat, setChat] = useState<GetMessageDetailsResult | null>(null);
  const [selectMessages, setSelectMessages] = useState<ChatMessage[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [chatSummary, setChatSummary] = useState<{
    tokenUsed: number;
    calculatedPrice: Decimal;
  }>({
    tokenUsed: 0,
    calculatedPrice: new Decimal(0),
  });

  useEffect(() => {
    getMessageDetails(id!).then((data) => {
      document.title = data.name;
      if (data.messages.length > 0) {
        setChat(data);
        setCurrentMessages(data.messages);
        let tokenUsed = 0;
        let calculatedPrice = new Decimal(0);
        data.messages.forEach((x) => {
          x.inputPrice = new Decimal(x.inputPrice || 0);
          tokenUsed += ((x.inputTokens || 0) + (x.outputTokens || 0))!;
          calculatedPrice = calculatedPrice.plus(
            x.inputPrice.plus(x.outputPrice || 0),
          );
        });
        setChatSummary({ tokenUsed, calculatedPrice });
        const lastMessage = data.messages[data.messages.length - 1];
        const _selectMessages = getSelectMessages(
          data.messages,
          lastMessage.id,
        );
        setSelectMessages(_selectMessages);
      }
    });
  }, [router.isReady]);

  const onMessageChange = (messageId: string) => {
    const _selectMessages = getSelectMessages(currentMessages, messageId);
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
      {chat &&
        selectMessages.map((current, index) => {
          let parentChildrenIds: string[] = [];
          if (!current.parentId) {
            parentChildrenIds = currentMessages
              .filter((x) => !x.parentId)
              .map((x) => x.id);
          } else {
            parentChildrenIds =
              currentMessages.find((x) => x.id === current.parentId)
                ?.childrenIds || [];
            parentChildrenIds = [...parentChildrenIds].reverse();
          }
          return (
            <ChatMessageComponent
              currentSelectIndex={parentChildrenIds.findIndex(
                (x) => x === current.id,
              )}
              isLastMessage={selectMessages.length - 1 === index}
              id={current.id!}
              key={current.id + index}
              parentId={current.parentId}
              onChangeMessage={(messageId: string) => {
                onMessageChange(messageId);
              }}
              childrenIds={current.childrenIds}
              parentChildrenIds={parentChildrenIds}
              assistantChildrenIds={current.assistantChildrenIds}
              assistantCurrentSelectIndex={current.assistantChildrenIds.findIndex(
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
                inputPrice: new Decimal(current.inputPrice || 0),
                outputPrice: new Decimal(current.outputPrice || 0),
              }}
            />
          );
        })}
    </>
  );
}
