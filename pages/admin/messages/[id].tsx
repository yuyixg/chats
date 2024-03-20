import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
export default function Page(props: any) {
  const router = useRouter();
  const { id } = router.query;
  return <h1>{id}</h1>;
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'admin',
        'pagination',
      ])),
    },
  };
};
