import type { Metadata } from "next";
import { redirectIfNotSet } from "@/lib/utils/env";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SectionWrapper } from "@/components/shared";

export const metadata: Metadata = {
  title: "Secure Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  redirectIfNotSet();

  return (
    <SectionWrapper compact className="pt-28 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gold/[0.02] blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16">
        <CheckoutForm />
      </div>
    </SectionWrapper>
  );
}
