import { connection } from '@/models';
import { useRouter } from 'next/router';

interface Props {}

const Admin = ({}: Props) => {
  const router = useRouter();
  return (
    <>
      Admin
      <button onClick={() => router.push('/admin/model')}>model</button>
    </>
  );
};

export default Admin;

export const getServerSideProps = async () => {
  try {
    await connection.authenticate();
    await connection.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
  return {
    props: {},
  };
};
