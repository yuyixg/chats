import { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import { hasContact } from '@/utils/website';

import { GlobalConfigKeys, SiteInfoConfig } from '@/types/config';
import { DEFAULT_LANGUAGE } from '@/utils/settings';
import { LoginConfigsResult, LoginType } from '@/types/user';

import AccountLoginCard from '@/components/Login/AccountLoginCard';
import KeyCloakLogin from '@/components/Login/KeyCloakLogin';
import PhoneLoginCard from '@/components/Login/PhoneLoginCard';
import PhoneRegisterCard from '@/components/Login/PhoneRegisterCard';
import WeChatLogin from '@/components/Login/WeChatLogin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ConfigsManager } from '@/managers';
import { LoginServiceManager } from '@/managers/loginService';

enum TabKeys {
  PHONE = 'phone',
  REGISTER = 'register',
  ACCOUNT = 'account',
}

type LoginHeader = {
  [key in TabKeys]: { title: string; description: string };
};

export default function LoginPage({
  siteInfo,
  loginConfigs,
}: {
  siteInfo: SiteInfoConfig;
  loginConfigs: LoginConfigsResult[];
}) {
  const { t } = useTranslation('login');
  const [isClient, setIsClient] = useState(false);
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
  const [loginTypes] = useState<LoginType[]>(loginConfigs.map((x) => x.type));
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabKeys>(
    loginTypes.includes(LoginType.Phone) ? TabKeys.PHONE : TabKeys.ACCOUNT,
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openLoading = () => setLoginLoading(true);
  const closeLoading = () => setLoginLoading(false);

  const TabsListRender = () => {
    return loginTypes.includes(LoginType.Phone) ? (
      <TabsList className="flex w-full flex-row justify-around">
        {loginTypes.includes(LoginType.Phone) && (
          <TabsTrigger
            value={TabKeys.PHONE}
            className="flex justify-center w-full"
          >
            {t('Mobile Login')}
          </TabsTrigger>
        )}
        {loginTypes.includes(LoginType.Phone) && (
          <TabsTrigger
            value={TabKeys.REGISTER}
            className="flex justify-center w-full"
          >
            {t('Register')}
          </TabsTrigger>
        )}
        <TabsTrigger
          value={TabKeys.ACCOUNT}
          className="flex justify-center w-full"
        >
          {t('Account Login')}
        </TabsTrigger>
      </TabsList>
    ) : (
      <></>
    );
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
                        <TabsListRender />
                        <TabsContent className="m-0 mt-2" value={TabKeys.PHONE}>
                          <PhoneLoginCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                          />
                        </TabsContent>
                        <TabsContent
                          className="m-0 mt-2"
                          value={TabKeys.REGISTER}
                        >
                          <PhoneRegisterCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                            showContact={hasContact(siteInfo)}
                          />
                        </TabsContent>
                        <TabsContent
                          className="m-0 mt-2"
                          value={TabKeys.ACCOUNT}
                        >
                          <AccountLoginCard
                            openLoading={openLoading}
                            closeLoading={closeLoading}
                            loginLoading={loginLoading}
                          />
                        </TabsContent>
                      </Tabs>

                      {loginTypes.length > 0 && (
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
                        {loginTypes.includes(LoginType.WeChat) && (
                          <WeChatLogin
                            configs={
                              loginConfigs.find(
                                (x) => x.type === LoginType.WeChat,
                              )!.configs
                            }
                            loading={loginLoading}
                          />
                        )}
                        {loginTypes.includes(LoginType.KeyCloak) && (
                          <KeyCloakLogin loading={loginLoading} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
              <p className="px-8 text-center text-sm text-muted-foreground">
                <span className="flex text-sm justify-center py-1">
                  {siteInfo?.filingNumber}
                </span>
                © 2024 Chats™ . All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  const siteInfo = await ConfigsManager.get<SiteInfoConfig>(
    GlobalConfigKeys.siteInfo,
  );

  const loginConfigList = await LoginServiceManager.findAllEnabled();
  const loginConfigs = loginConfigList.map((x) => {
    const configs = JSON.parse(x?.configs || '{}');
    return {
      type: x.type,
      configs: {
        appId: configs?.appId || null,
      },
    };
  });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'login',
        'sidebar',
      ])),
      siteInfo,
      loginConfigs,
    },
  };
};
