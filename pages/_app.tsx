import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import './globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AdminLayout from './admin/layout/layout';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{}>) {
  const route = useRouter();
  console.log('pageProps', pageProps);

  const queryClient = new QueryClient();
  if (route.pathname.includes('/admin')) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }
  return (
    <SessionProvider session={session} basePath='/zh'>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(App);
