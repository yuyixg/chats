import { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import { DEFAULT_LANGUAGE } from '@/types/settings';
import { LoginType, ProviderResult } from '@/types/user';

import AccountLoginCard from '@/components/Login/AccountLoginCard';
import KeyCloakLogin from '@/components/Login/KeyCloakLogin';
import PhoneLoginCard from '@/components/Login/PhoneLoginCard';
import PhoneRegisterCard from '@/components/Login/PhoneRegisterCard';
import WeChatLogin from '@/components/Login/WeChatLogin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getLoginProvider } from '@/apis/userService';

enum TabKeys {
  PHONE = 'phone',
  REGISTER = 'register',
  ACCOUNT = 'account',
}

type LoginHeader = {
  [key in TabKeys]: { title: string; description: string };
};

export default function LoginPage() {
  const { t } = useTranslation('login');
  const LoginHeaders: LoginHeader = {
    phone: {
      title: t('Sign in to Chats'),
      description: t(
        'Please enter your phone number and verification code below to complete the login',
      ),
    },
    register: {
      title: t('Welcome to register'),
      description: t(
        'Please enter your phone number and invitation code below to complete the register',
      ),
    },
    account: {
      title: t('Sign in to Chats'),
      description: t(
        'Please enter your account name and password below to complete the login',
      ),
    },
  };
  const [isClient, setIsClient] = useState(false);
  const [providers, setProviders] = useState<ProviderResult[]>([]);
  const [providerTypes, setProviderTypes] = useState<LoginType[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabKeys>(TabKeys.PHONE);

  useEffect(() => {
    getLoginProvider().then((data) => {
      setProviders(data);
      setProviderTypes(data.map((x) => x.type));
    });

    setIsClient(true);
  }, []);

  const openLoading = () => setLoginLoading(true);
  const closeLoading = () => setLoginLoading(false);

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
            <div className="mx-auto flex w-full flex-col justify-center space-y-6">
              <div
                className="flex flex-col space-y-2 text-center mt-12 md:mt-0 lg:mt-0"
                key={currentTab}
              >
                <h1 className="text-2xl font-semibold tracking-tight">
                  {LoginHeaders[currentTab].title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {LoginHeaders[currentTab].description}
                </p>
              </div>
              <>
                <div className="flex w-full justify-center">
                  <div className="relative w-full max-w-md max-h-full">
                    <div className="relative">
                      <Tabs
                        defaultValue={currentTab}
                        onValueChange={(value) => {
                          setCurrentTab(value as TabKeys);
                        }}
                        className="flex-col"
                      >
                        <TabsList className="flex w-full flex-row justify-around">
                          <TabsTrigger
                            value={TabKeys.PHONE}
                            className="flex justify-center w-full"
                          >
                            {t('Mobile Login')}
                          </TabsTrigger>
                          <TabsTrigger
                            value={TabKeys.REGISTER}
                            className="flex justify-center w-full"
                          >
                            {t('Register')}
                          </TabsTrigger>
                          <TabsTrigger
                            value={TabKeys.ACCOUNT}
                            className="flex justify-center w-full"
                          >
                            {t('Account Login')}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent className="m-0 mt-2" value={TabKeys.PHONE}>
                          <PhoneLoginCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                          />
                        </TabsContent>
                        <TabsContent className="m-0 mt-2" value={TabKeys.REGISTER}>
                          <PhoneRegisterCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                          />
                        </TabsContent>
                        <TabsContent className="m-0 mt-2" value={TabKeys.ACCOUNT}>
                          <AccountLoginCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                          />
                        </TabsContent>
                      </Tabs>

                      {providerTypes.length > 0 && (
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
                      )}

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
