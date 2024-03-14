import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserSession, saveUserSession } from '@/utils/user';
import toast from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

export default function LoginPage({ locale }: { locale: string }) {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    localStorage.setItem('locale', locale);
  }, []);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');
    const remember = formData.get('remember');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const user = (await response.json()) as UserSession;
      document.cookie = `sessionId=${user.sessionId}; path=/`;
      saveUserSession({
        ...user,
        password: remember === 'on' ? `${password}` : '',
      });
      router.push('/');
    } else {
      toast.error(t('Username or password incorrect.'));
      setLoginLoading(false);
    }
  }

  return (
    <>
      {isClient ? (
        <>
          <div className='flex w-full justify-center'>
            <div className='relative p-4 mt-6 w-full max-w-md max-h-full'>
              <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
                <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                    {t('Sign in to Chats')}
                  </h3>
                </div>
                <div className='p-4 md:p-5'>
                  <form
                    className='space-y-4'
                    name='loginForm'
                    onSubmit={handleSubmit}
                  >
                    <div>
                      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        {t('Your username')}
                      </label>
                      <input
                        type='text'
                        name='username'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                        placeholder=''
                        required
                      />
                    </div>
                    <div>
                      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                        {t('Your password')}
                      </label>
                      <input
                        type='password'
                        name='password'
                        placeholder=''
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                        required
                      />
                    </div>
                    {/* <div className='flex justify-between'>
                      <div className='flex items-start'>
                        <div className='flex items-center h-5'>
                          <input
                            type='checkbox'
                            name='remember'
                            className='w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800'
                          />
                        </div>
                        <label className='ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                          {t('Remember me')}
                        </label>
                      </div>
                    </div> */}
                    <button
                      disabled={loginLoading}
                      type='submit'
                      className='w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                    >
                      {loginLoading
                        ? t('Logging in...')
                        : t('Login to your account')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <footer className='bg-white dark:bg-gray-900'>
            <div className='w-full mx-auto fixed bottom-1'>
              <hr className='border-gray-200 dark:border-gray-700' />
              <span className='block text-sm text-gray-500 text-center py-4 dark:text-gray-400'>
                © 2023{' '}
                <a href='/' className='hover:underline'>
                  Chats™
                </a>
                . All Rights Reserved.
              </span>
            </div>
          </footer>
        </>
      ) : (
        <div></div>
      )}
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      locale,
      ...(await serverSideTranslations(locale ?? 'en', ['login'])),
    },
  };
};
