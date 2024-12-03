import useTranslation from '@/hooks/useTranslation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const PageNotFound = () => {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-full place-items-center bg-background py-24 sm:py-32">
      <div className="text-center">
        <p className="text-3xl font-semibold text-primary">404</p>
        <h1 className="mt-4 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t("Sorry, we couldn't find the page you were looking for.")}
        </h1>
        <div className="mt-10 flex items-center justify-center">
          <Link href="/">
            <Button className="h-8 w-32">{t('Back to home page')}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PageNotFound;
