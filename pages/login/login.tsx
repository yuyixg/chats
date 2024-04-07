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
import { DEFAULT_LANGUAGE } from '@/types/settings';
import Image from 'next/image';
import { getCsrfToken } from '@/apis/userService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function LoginPage() {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

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
    getCsrfToken().then((data) => {
      setCsrfToken(data?.csrfToken);
    });
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
      {isClient && (
        <div className='container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
          <div className='relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r'>
            <div className='absolute inset-0 bg-zinc-900' />
            <div className='relative z-20 flex items-center text-lg font-medium'>
              <Image
                src='/chats.png'
                width={32}
                height={32}
                className='mr-2 h-8 w-8'
                alt='logo'
              />
              Chats
            </div>
            <div className='relative z-20 mt-auto'>
              <blockquote className='space-y-2'>
                {/* <p className='text-lg'>
                  &ldquo;This library has saved me countless hours of work and
                  helped me deliver stunning designs to my clients faster than
                  ever before.&rdquo;
                </p>
                <footer className='text-sm'>Sofia Davis</footer> */}
              </blockquote>
            </div>
          </div>
          <div className='lg:p-8'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
              <div className='flex flex-col space-y-2 text-center mt-12 md:mt-0 lg:mt-0'>
                <h1 className='text-2xl font-semibold tracking-tight'>
                  {t('Sign in to Chats')}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {t(
                    'Enter your username and password below to complete the login'
                  )}
                </p>
              </div>
              <>
                <div className='flex w-full justify-center'>
                  <div className='relative w-full max-w-md max-h-full'>
                    <div className='relative'>
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
                              className='w-full'
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
                      <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                          <span className='w-full border-t' />
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                          <span className='bg-background p-4 text-muted-foreground'>
                            {t('Or continue with')}
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-center gap-2'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => {
                                  router.push('/login/wechat');
                                }}
                                className='p-0'
                                disabled={loginLoading}
                                variant='link'
                                type='submit'
                              >
                                <Image
                                  src='/wechat.svg'
                                  alt='WeChat'
                                  width={0}
                                  height={0}
                                  className='mr-2 h-6 w-6 dark:bg-white'
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>微信登录</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <form action='/api/auth/signin/keycloak' method='POST'>
                          <input
                            type='hidden'
                            name='csrfToken'
                            value={csrfToken}
                          />
                          <input
                            type='hidden'
                            name='callbackUrl'
                            value={`${location.origin}/authorizing`}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className='p-0'
                                  disabled={loginLoading}
                                  variant='link'
                                  type='submit'
                                >
                                  <Image
                                    src='/keyCloak.svg'
                                    alt='KeyCloak'
                                    width={0}
                                    height={0}
                                    className='mr-2 h-6 w-6 rounded-md dark:bg-white'
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>KeyCloak</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </>
              <p className='px-8 text-center text-sm text-muted-foreground'>
                © 2023 Chats™ . All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['login'])),
    },
  };
};
