import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Your setup — Monis Studio",
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CheckoutView />
      </main>
    </>
  );
}
