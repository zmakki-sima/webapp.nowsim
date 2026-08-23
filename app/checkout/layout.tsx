import { CheckoutHeader } from "@/components/layout/CheckoutHeader";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CheckoutHeader />

      <main className="flex-1 pt-[calc(var(--header-height)+env(safe-area-inset-top))]">
        {children}
      </main>
    </>
  );
}
