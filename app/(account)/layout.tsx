import { WebNavbar } from "@/components/layout/WebNavbar";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
