import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { PhoneRegExp, SmsExpirationSeconds } from '@/utils/common';
import { saveUserInfo, setUserSessionId } from '@/utils/user';

import { DEFAULT_LANGUAGE } from '@/types/settings';
import { LoginType, ProviderResult } from '@/types/user';

import AccountLogin from '@/components/Login/AccountLogin';
import KeyCloakLogin from '@/components/Login/KeyCloakLogin';
import WeChatLogin from '@/components/Login/WeChatLogin';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  getLoginProvider,
  postSignCode,
  signByPhone,
} from '@/apis/userService';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export default function LoginPage() {
  const { t } = useTranslation('login');
  const router = useRouter();
  const [seconds, setSeconds] = useState(SmsExpirationSeconds - 1);
  const [isSendCode, setIsSendCode] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [providers, setProviders] = useState<ProviderResult[]>([]);
  const [providerTypes, setProviderTypes] = useState<LoginType[]>([]);

  const formSchema = z.object({
    phone: z
      .string()
      .regex(PhoneRegExp, { message: t('Mobile number format error')! }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      phone: '',
    },
  });

  useEffect(() => {
    getLoginProvider().then((data) => {
      setProviders(data);
      setProviderTypes(data.map((x) => x.type));
    });

    form.formState.isValid;
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isSendCode && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    }

    if (seconds === 0) {
      setIsSendCode(false);
      setSeconds(SmsExpirationSeconds);
    }

    return () => clearInterval(timer);
  }, [isSendCode, seconds]);

  const sendCode = () => {
    if (form.formState.isValid) {
      const phone = form.getValues('phone');
      postSignCode(phone)
        .then(() => {
          toast.success(t('SMS sent successfully'));
          setIsSendCode(true);
        })
        .catch(() => {
          toast.error(t('SMS send failed, please try again later'));
        });
    }
  };

  const sign = () => {
    if (form.formState.isValid && smsCode.length === 6) {
      const phone = form.getValues('phone');
      setLoginLoading(true);
      signByPhone(phone, smsCode)
        .then((response) => {
          setUserSessionId(response.sessionId);
          saveUserInfo({
            canRecharge: response.canRecharge,
            role: response.role,
            username: response.username,
          });
          router.push('/');
        })
        .catch(() => {
          setLoginLoading(false);
          toast.error(t('Verification code error'));
        });
    }
  };

  return (
    <>
      {isClient && (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div className="absolute inset-0 bg-zinc-900" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              <Image
                src="/chats.png"
                width={32}
                height={32}
                className="mr-2 h-8 w-8"
                alt="logo"
              />
              Chats
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                {/* <p className='text-lg'>
                  &ldquo;This library has saved me countless hours of work and
                  helped me deliver stunning designs to my clients faster than
                  ever before.&rdquo;
                </p>
                <footer className='text-sm'>Sofia Davis</footer> */}
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center mt-12 md:mt-0 lg:mt-0">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {t('Sign in to Chats')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Please enter your phone number and verification code below to complete the login.',
                  )}
                </p>
              </div>
              <>
                <div className="flex w-full justify-center">
                  <div className="relative w-full max-w-md max-h-full">
                    <div className="relative">
                      <Form {...form}>
                        <form>
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="flex flex-col items-start">
                                <FormControl className="w-full">
                                  <div>
                                    <div className="py-2.5 text-sm font-medium leading-none">
                                      {t('Phone Number')}
                                    </div>
                                    <div className="flex border rounded-md">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="absolute font-semibold"
                                      >
                                        +86
                                      </Button>
                                      <Input
                                        className="w-full m-0 border-none outline-none bg-transparent rounded-md p-0 pl-14"
                                        {...field}
                                      />
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                      <div className="pt-2">
                        <div className="py-2.5 text-sm font-medium leading-none">
                          {t('Code')}
                        </div>
                        <div className="flex border rounded-md">
                          <Input
                            value={smsCode}
                            onChange={(e) => {
                              setSmsCode(e.target.value);
                            }}
                            className="m-0 border-none outline-none bg-transparent rounded-md p-0 pr-[102px] pl-4"
                          />
                          <Button
                            className="absolute right-[5px] text-center"
                            disabled={!form.formState.isValid}
                            variant="link"
                            onClick={sendCode}
                          >
                            {isSendCode ? seconds : t('Send code')}
                          </Button>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button
                          className="w-full"
                          onClick={sign}
                          disabled={loginLoading}
                        >
                          {loginLoading
                            ? t('Logging in...')
                            : t('Login to your account')}
                        </Button>
                      </div>

                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background p-4 text-muted-foreground">
                            {t('Or continue with')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        {providerTypes.includes(LoginType.WeChat) && (
                          <WeChatLogin
                            configs={
                              providers.find(
                                (x) => x.type === LoginType.WeChat,
                              )!.configs
                            }
                            loading={loginLoading}
                          />
                        )}
                        {providerTypes.includes(LoginType.KeyCloak) && (
                          <KeyCloakLogin loading={loginLoading} />
                        )}

                        <AccountLogin loading={loginLoading} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
              <p className="px-8 text-center text-sm text-muted-foreground">
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
