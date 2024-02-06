import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AdminLayout from './layout/layout';
import { Component } from 'react';

interface Props {}

const Admin = (props: any) => {
  console.log(props);
  return (
    <>
      <>Dashboard</>
    </>
  );
};

export default Admin;

export const getServerSideProps = async ({ locale }: any) => {
  // try {
  //   await connection.authenticate();
  //   await connection.sync({ force: true });
  // } catch (error) {
  //   console.log(error);
  // }
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};
