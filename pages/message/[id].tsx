import { getMessageDetails } from '@/apis/adminService';
import { ChatMessage } from '@/components/Admin/Messages/ChatMessage';
import { GetMessageDetailsResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
export default function MessageDetails() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [message, setMessage] = useState<GetMessageDetailsResult>({
    name: '',
    prompt: '',
    messages: [],
  });
  useEffect(() => {
    getMessageDetails(id!).then((data) => {
      document.title = data.name;
      setMessage(data);
    });
  }, []);
  return (
    <>
      {message.messages.map((m, index) => (
        <ChatMessage key={'message' + index} message={m} />
      ))}
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['common', 'markdown'])),
    },
  };
};
