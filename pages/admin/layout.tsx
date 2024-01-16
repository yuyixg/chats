export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>Layout</div>
      <div>{children}</div>
    </>
  );
}
