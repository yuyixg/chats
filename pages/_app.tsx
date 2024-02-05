import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import './globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AdminLayout from './admin/layout/layout';
import { SessionProvider } from 'next-auth/react';

function App({ Component, pageProps }: AppProps<{}> | any) {
  const route = useRouter();
  // console.log('pageProps', pageProps);

  const queryClient = new QueryClient();
  if (route.pathname.includes('/admin')) {
    return (
      <SessionProvider
        refetchInterval={25 * 60}
        session={pageProps.session}
        refetchOnWindowFocus={true}
        basePath='/api/auth'
      >
        <Toaster />
        <QueryClientProvider client={queryClient}>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </QueryClientProvider>
      </SessionProvider>
    );
  }
  return (
    <SessionProvider
      refetchInterval={25 * 60}
      session={pageProps.session}
      refetchOnWindowFocus={true}
      basePath='/api/auth'
    >
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(App);
