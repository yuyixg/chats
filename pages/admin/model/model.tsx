interface Props {}

const ModelManage = ({}: Props) => {
  return <>ModelManage</>;
};

export default ModelManage;

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {},
  };
};
