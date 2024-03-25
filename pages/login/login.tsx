import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  UserSession,
  getUserSession,
  saveUserSession,
  setUserSessionId,
} from '@/utils/user';
import toast from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { FormFieldType, IFormFieldOption } from '@/components/ui/form/type';
import FormInput from '@/components/ui/form/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FormCheckbox from '@/components/ui/form/checkbox';
import { clearConversations } from '@/utils/conversation';

export default function LoginPage() {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const formFields: IFormFieldOption[] = [
    {
      name: 'username',
      label: t('Your username'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput options={options} field={field} />
      ),
    },
    {
      name: 'password',
      label: t('Your password'),
      defaultValue: '',
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormInput type='password' options={options} field={field} />
      ),
    },
    {
      name: 'remember',
      label: t('Remember me'),
      defaultValue: true,
      render: (options: IFormFieldOption, field: FormFieldType) => (
        <FormCheckbox options={options} field={field} />
      ),
    },
  ];

  const formSchema = z.object({
    username: z.string().min(1, `${t('Please enter you user name')}`),
    password: z.string().min(1, `${t('Please enter you password')}`),
    remember: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formFields.reduce((obj: any, field) => {
      obj[field.name] = field.defaultValue;
      return obj;
    }, {}),
  });

  useEffect(() => {
    clearConversations();
    form.formState.isValid;
    const userInfo = getUserSession();
    if (userInfo) {
      const { username, password } = userInfo;
      form.setValue('username', username);
      form.setValue('password', password);
    }
    setIsClient(true);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!form.formState.isValid) return;
    setLoginLoading(true);
    const { username, password, remember } = values;
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const user = (await response.json()) as UserSession;
      setUserSessionId(user.sessionId);
      saveUserSession({
        ...user,
        password: remember ? `${password}` : '',
      });
      router.push('/');
    } else {
      toast.error(t('Username or password incorrect'));
      setLoginLoading(false);
    }
  }

  return (
    <>
      {isClient ? (
        <>
          <div className='flex w-full justify-center'>
            <div className='relative p-4 mt-32 w-full max-w-md max-h-full'>
              <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
                <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                    {t('Sign in to Chats')}
                  </h3>
                </div>
                <div className='p-4 md:p-5'>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      {formFields.map((item) => (
                        <FormField
                          key={item.name}
                          control={form.control}
                          name={item.name as never}
                          render={({ field }) => item.render(item, field)}
                        />
                      ))}
                      <div className='w-full flex justify-center'>
                        <Button
                          className='w-52'
                          disabled={loginLoading}
                          type='submit'
                        >
                          {loginLoading
                            ? t('Logging in...')
                            : t('Login to your account')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
          <footer className='bg-white dark:bg-gray-900'>
            <div className='w-full mx-auto fixed bottom-1'>
              <hr className='border-gray-200 dark:border-gray-700' />
              <span className='block text-sm text-gray-500 text-center py-4 dark:text-gray-400'>
                © 2023 Chats™ . All Rights Reserved.
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
      ...(await serverSideTranslations(locale ?? 'en', ['login'])),
    },
  };
};
