import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import useTranslation from '@/hooks/useTranslation';

import { getQueryId } from '@/utils/common';
import { findLastLeafId, findSelectedMessageByLeafId } from '@/utils/message';

import { ChatStatus, IChat } from '@/types/chat';
import { IChatMessage } from '@/types/chatMessage';

import { ChatMessage } from '@/components/ChatMessage';
import PageNotFound from '@/components/PageNotFound/PageNotFound';
import { Button } from '@/components/ui/button';

import { getChat, getUserMessages } from '@/apis/clientApis';

export default function MessageDetails() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<IChatMessage[][]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const handleChangeChatLeafMessageId = (messageId: string) => {
    const leafId = findLastLeafId(messages, messageId);
    const selectedMsgs = findSelectedMessageByLeafId(messages, leafId);
    setSelectedMessages(selectedMsgs);
  };

  useEffect(() => {
    setLoading(true);
    if (!router.isReady) return;
    const chatId = getQueryId(router)!;
    getChat(chatId).then(async (chat) => {
      setSelectedChat({ ...chat, status: ChatStatus.None });
      const msgs = await getUserMessages(chatId);
      setMessages(msgs);
      const selectedMsgs = findSelectedMessageByLeafId(
        msgs,
        chat.leafMessageId!,
      );
      setSelectedMessages(selectedMsgs);
      setLoading(false);
    });
  }, [router.isReady]);

  const MessageRender = () => {
    return selectedChat ? (
      <>
        <ChatMessage
          selectedChat={selectedChat}
          selectedMessages={selectedMessages}
          messagesEndRef={null}
          readonly={true}
          handleChangeChatLeafMessageId={handleChangeChatLeafMessageId}
        />
      </>
    ) : (
      <PageNotFound />
    );
  };

  return loading ? <></> : MessageRender();
}
