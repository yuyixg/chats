const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div>Layout</div>
      <div>{children}</div>
    </>
  );
};
export default AdminLayout;
export const getServerSideProps = async () => {
  console.log('getServerSideProps');
  return {
    props: {},
  };
};
