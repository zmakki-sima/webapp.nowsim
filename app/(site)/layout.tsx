import { WebNavbar } from "@/components/layout/WebNavbar";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
