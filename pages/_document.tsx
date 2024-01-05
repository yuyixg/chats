import { DocumentProps, Head, Html, Main, NextScript } from 'next/document';

type Props = DocumentProps & {};

export default function Document(props: Props) {
  return (
    <Html lang='zh-CN'>
      <Head>
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-title' content='Chat AI'></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
