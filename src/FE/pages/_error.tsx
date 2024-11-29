import React from 'react';

import useTranslation from '@/hooks/useTranslation';

const Custom404 = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('404: Page not found')}</h1>
      <p>{t("Sorry, we couldn't find the page you were trying to access.")}</p>
    </div>
  );
};

const ErrorPage = ({ statusCode }: { statusCode: number }) => {
  const { t } = useTranslation();
  if (statusCode === 404) {
    return <Custom404 />;
  }

  return (
    <div>
      <h1>{statusCode}{t(': An error has occurred')}</h1>
      <p>{t('Sorry, there was an unexpected error, please try again later.')}</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
