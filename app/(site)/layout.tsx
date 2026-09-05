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
      {/* A column, so a page that wants the leftover height — the error and
          not-found messages — can claim it with `flex-1`. */}
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
