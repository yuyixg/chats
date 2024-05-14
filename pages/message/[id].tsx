import { getMessageDetails } from '@/apis/adminService';
import { ChatMessage as ChatMessageComponent } from '@/components/Admin/Messages/ChatMessage';
import { GetMessageDetailsResult } from '@/types/admin';
import { ChatMessage } from '@/types/chatMessage';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { getSelectMessages } from '@/utils/message';
import Decimal from 'decimal.js';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
          tokenUsed += x.tokenUsed!;
          calculatedPrice = calculatedPrice.plus(x.calculatedPrice!);
        });
        setChatSummary({ tokenUsed, calculatedPrice });
        const lastMessage = data.messages[data.messages.length - 1];
        const _selectMessages = getSelectMessages(
          data.messages,
          lastMessage.id
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
        <div className='flex justify-center gap-2 my-2 font-semibold'>
          <div>{chat?.modelName}</div>
          <div>{chat?.modelTemperature}­°C</div>
          <div>
            {chatSummary.tokenUsed}/{chatSummary.calculatedPrice.toFixed(2)}￥
          </div>
        </div>
      )}
      <div className='flex justify-center my-2'>{chat?.modelPrompt}</div>
      {chat &&
        selectMessages.map((current) => {
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
          return current.messages.map((message: any, index: number) => (
            <ChatMessageComponent
              currentSelectIndex={parentChildrenIds.findIndex(
                (x) => x === current.id
              )}
              id={current.id!}
              key={current.id + index}
              parentId={current.parentId}
              onChangeMessage={(messageId: string) => {
                onMessageChange(messageId);
              }}
              childrenIds={current.childrenIds}
              parentChildrenIds={parentChildrenIds}
              message={message}
            />
          ));
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
