import Document, {
  DocumentContext,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

type Props = DocumentProps & {
  apiUrl: string;
};

function ChatsDocument(props: Props) {
  return (
    <Html>
      <Head>
        <meta name="mobile-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Chats"></meta>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/192x192.png" />
        <link rel="shortcut icon" href="/icons/192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.API_URL = "${props.apiUrl}";`,
          }}
        />
      </body>
    </Html>
  );
}

(ChatsDocument as any).getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx);
  const apiUrl = process.env.API_URL || '';
  return { ...initialProps, apiUrl };
};

export default ChatsDocument;
