import { useEffect, useState } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

import { getSelectMessages } from '@/utils/message';

import { GetMessageDetailsResult } from '@/types/admin';
import { ChatMessage } from '@/types/chatMessage';
import { DEFAULT_LANGUAGE } from '@/utils/settings';

import { ChatMessage as ChatMessageComponent } from '@/components/Admin/Messages/ChatMessage';

import { getMessageDetails } from '@/apis/adminService';
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
          x.inputPrice = new Decimal(x.inputPrice);
          tokenUsed += (x.inputTokens + x.outputTokens)!;
          calculatedPrice = calculatedPrice.plus(x.inputPrice.plus(x.outputPrice!));
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
  }, []);

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
            {chatSummary.tokenUsed}/{chatSummary.calculatedPrice.toFixed(2)}￥
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
                duration: current.duration,
                inputTokens: current.inputTokens,
                outputTokens: current.outputTokens,
                inputPrice: current.inputPrice,
                outputPrice: current.outputPrice,
              }}
            />
          );
        })}
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'markdown',
      ])),
    },
  };
};
