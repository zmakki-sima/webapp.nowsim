import { CheckoutHeader } from "@/components/layout/CheckoutHeader";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CheckoutHeader />

      {/* A column, so a page that wants the leftover height — the error and
          not-found messages — can claim it with `flex-1`. */}
      <main className="flex flex-1 flex-col pt-[calc(var(--header-height)+env(safe-area-inset-top))]">
        {children}
      </main>
    </>
  );
}
