import Head from 'next/head';

import HomeContent from './_components/Home/HomeContent';

const Home = () => {
  return (
    <>
      <Head>
        <title>Chats</title>
        <meta name="description" content="" />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HomeContent />
      </main>
    </>
  );
};

export default Home;
