import { getShareMessage } from '@/apis/adminService';
import { ChatMessage } from '@/components/Admin/Messages/ChatMessage';
import { Button } from '@/components/ui/button';
import { GetMessageDetailsResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
export default function ShareMessage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [message, setMessage] = useState<GetMessageDetailsResult>({
    name: '',
    prompt: '',
    messages: [],
  });
  useEffect(() => {
    getShareMessage(id!).then((data) => {
      document.title = 'Chats ' + data.name;
      setMessage(data);
    });
  }, []);
  return (
    <>
      {message.messages.map((m, index) => (
        <ChatMessage key={'message' + index} message={m} />
      ))}
      <div className='h-32'></div>
      <div className='fixed bottom-0 py-4 w-full bg-white dark:bg-black dark:text-white'>
        <div className='flex justify-center pb-2'>
          <Link href='/'>
            <Button className='h-8 w-32'>使用 Chats</Button>
          </Link>
        </div>
        <div className='flex justify-center text-gray-500 text-sm'>
          内容有AI大模型生成，请仔细甄别
        </div>
      </div>
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
