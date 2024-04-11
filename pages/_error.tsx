import { useRouter } from 'next/router';
import React from 'react';

const Custom404 = () => (
  <div>
    <h1>404: 页面未找到</h1>
    <p>抱歉，我们找不到你要访问的页面。</p>
  </div>
);

const ErrorPage = ({ statusCode }: { statusCode: number }) => {
  const router = useRouter();
  const currentURL = router.asPath;
  console.error('ErrorPage', currentURL, statusCode);
  if (statusCode === 404) {
    return <Custom404 />;
  }

  return (
    <div>
      <h1>{statusCode}: 发生错误</h1>
      <p>抱歉，出现了意外错误，请稍后再试。</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
