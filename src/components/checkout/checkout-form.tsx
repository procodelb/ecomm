"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
import { BNPLButtons } from "./bnpl-buttons";
import { useCart } from "@/providers/cart";
import { getLocaleConfig } from "@/lib/locale/config";
import {
  Lock,
  ShoppingBag,
  Truck,
  Shield,
  Mail,
  CreditCard,
  MapPin,
  Check,
  ChevronRight,
  ExternalLink,
  Banknote,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/client";
import { getCsrfHeader } from "@/lib/security/csrf-client";

interface CheckoutPaymentConfig {
  provider: "cash_on_delivery" | "alfan" | "stripe";
  alfanEnabled: boolean;
  alfanUrl: string | null;
  stripeEnabled: boolean;
}

const STEPS = [
  { label: "Cart", state: "complete" as const },
  { label: "Checkout", state: "active" as const },
  { label: "Confirmation", state: "upcoming" as const },
];

const PAYMENT_METHODS = [
  { name: "Visa", symbol: "V" },
  { name: "MC", symbol: "MC" },
  { name: "Amex", symbol: "AE" },
  { name: "Apple Pay", symbol: "AP" },
];

export function CheckoutForm({ paymentConfig }: { paymentConfig?: CheckoutPaymentConfig }) {
  const locale = useLocale();
  const { items, subtotal, clearCart } = useCart();
  const config = getLocaleConfig(locale);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const alfanEnabled = paymentConfig?.alfanEnabled ?? false;
  const alfanUrl = paymentConfig?.alfanUrl ?? null;
  const stripeEnabled = paymentConfig?.stripeEnabled ?? false;

  const freeThreshold = config.shippingZones[0]?.freeThreshold ?? 200;
  const shippingRate = config.shippingZones[0]?.rate ?? 0;
  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  const tax = subtotal * config.taxRate;
  const total = subtotal + shipping + tax;

  function fmt(amount: number) {
    return `${config.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async function handleCashOnDelivery() {
    setLoading(true);
    setError("");

    try {
      const origin = window.location.origin;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeader() },
        body: JSON.stringify({
          items,
          locale,
          currency: config.currency,
          customerEmail: email,
          paymentMethod: "cash_on_delivery",
          successUrl: `${origin}/${locale}/order/confirmation?order_id={ORDER_ID}`,
          cancelUrl: `${origin}/${locale}/checkout`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      trackEvent("checkout_started", {
        value: total,
        currency: config.currency,
        items: items.map((i) => i.id),
        contents: JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price }))),
      });

      if (data.url) {
        clearCart();
        window.location.assign(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleAlfanPayment() {
    setLoading(true);
    setError("");

    try {
      const origin = window.location.origin;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeader() },
        body: JSON.stringify({
          items,
          locale,
          currency: config.currency,
          customerEmail: email,
          paymentMethod: "alfan",
          successUrl: `${origin}/${locale}/order/confirmation?order_id={ORDER_ID}`,
          cancelUrl: `${origin}/${locale}/checkout`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      trackEvent("checkout_started", {
        value: total,
        currency: config.currency,
        items: items.map((i) => i.id),
        contents: JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price }))),
      });

      if (data.url) {
        clearCart();
        window.open(data.url, "_blank", "noopener,noreferrer");
        // Redirect to confirmation page showing order reference
        window.location.assign(`${origin}/${locale}/order/confirmation?order_id=${data.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (alfanEnabled && alfanUrl) {
      await handleAlfanPayment();
    } else {
      await handleCashOnDelivery();
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all duration-500",
                  step.state === "complete" && "bg-success text-white",
                  step.state === "active" && "bg-primary text-dark shadow-[0_0_16px_rgba(0,212,255,0.2)]",
                  step.state === "upcoming" && "bg-white/[0.04] text-muted-foreground/40 border border-border",
                )}
              >
                {step.state === "complete" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-heading font-medium hidden sm:block transition-colors duration-300",
                  step.state === "active" && "text-foreground",
                  step.state === "complete" && "text-muted-foreground",
                  step.state === "upcoming" && "text-muted-foreground/30",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-20 h-px mx-2 sm:mx-3 transition-colors duration-500",
                  step.state === "complete" ? "bg-success/50" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Left Column — Form Sections */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page Title */}
          <div>
            <Heading as="h4">Secure Checkout</Heading>
            <Text size="sm" muted>
              Complete your purchase in just a few clicks
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-lg bg-primary-10 border border-primary/20 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-heading font-semibold text-foreground">Contact</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.5625rem] font-heading font-medium text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
                <p className="text-[0.625rem] text-muted-foreground/50">
                  Order confirmation and tracking will be sent here
                </p>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-lg bg-primary-10 border border-primary/20 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-heading font-semibold text-foreground">Shipping</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[0.5625rem] font-heading font-medium text-muted-foreground uppercase tracking-wider">Address</label>
                  <Input placeholder="Street address" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.5625rem] font-heading font-medium text-muted-foreground uppercase tracking-wider">City</label>
                  <Input placeholder="City" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.5625rem] font-heading font-medium text-muted-foreground uppercase tracking-wider">Postal Code</label>
                  <Input placeholder="00000" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-10 border border-primary/20">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <div className="text-xs text-foreground/80">
                  {shipping === 0 ? (
                    <span className="text-success font-medium">Free White-Glove Delivery</span>
                  ) : (
                    <span>Shipping: <span className="text-foreground font-medium">{fmt(shipping)}</span></span>
                  )}
                  {subtotal < freeThreshold && subtotal > 0 && (
                    <span className="block text-muted-foreground/60 mt-0.5">
                      Add {fmt(freeThreshold - subtotal)} more for free shipping
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-lg bg-primary-10 border border-primary/20 flex items-center justify-center">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-heading font-semibold text-foreground">Payment</span>
              </div>

              {/* Stripe unavailable notice */}
              {!stripeEnabled && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50 border border-border">
                  <Banknote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Online card payment is currently unavailable. You can complete your order using Cash on Delivery.
                  </p>
                </div>
              )}

              {/* Alfan notice */}
              {alfanEnabled && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-10 border border-primary/20">
                  <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Complete your payment securely through Alfan. Your order will remain pending until payment is confirmed.
                  </p>
                </div>
              )}

              {/* Cash on Delivery info */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border">
                <Banknote className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">
                  Pay with <span className="text-foreground font-medium">Cash on Delivery</span>
                </span>
              </div>

              {/* Stripe card icons (only when Stripe is enabled) */}
              {stripeEnabled && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.name}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border text-[0.5625rem] font-heading font-bold text-muted-foreground/60 tracking-wider"
                    >
                      {pm.symbol}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="space-y-3">
              <Button
                type="submit"
                size="xl"
                className="w-full gap-3 text-base font-heading font-semibold"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing Your Order...
                  </span>
                ) : alfanEnabled && alfanUrl ? (
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="h-5 w-5" />
                    Pay via Alfan
                    <ChevronRight className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <Lock className="h-5 w-5" />
                    Place Order — {fmt(total)}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}

              <BNPLButtons locale={locale} subtotal={total} />

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.625rem] text-muted-foreground/50">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  PCI Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  30-Day Returns
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column — Order Summary */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-border">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <Text size="sm" weight="semibold">
                  Order Summary
                </Text>
                <span className="ml-auto text-xs text-muted-foreground/50 font-mono">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-0 divide-y divide-border">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 p-4 sm:px-6 sm:py-4">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-heading text-lg text-muted-foreground/20">&#9670;</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      {item.variantTitle && (
                        <p className="text-xs text-muted-foreground/60">{item.variantTitle}</p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground/50">Qty {item.quantity}</span>
                        <span className="text-sm font-medium text-foreground">{fmt(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <Text size="sm" muted>Your cart is empty</Text>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="p-5 sm:p-6 space-y-2.5 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Truck className="h-3 w-3" />
                  Shipping
                </span>
                <span className={cn(shipping === 0 ? "text-success font-medium" : "text-foreground")}>
                  {shipping === 0 ? "Free" : fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  Tax ({(config.taxRate * 100).toFixed(0)}%)
                </span>
                <span className="text-foreground">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between pt-3 mt-1 border-t border-border">
                <span className="font-heading font-bold text-foreground">Total</span>
                <span className="font-heading text-xl font-bold text-foreground tracking-tight">{fmt(total)}</span>
              </div>
            </div>

            {/* Free shipping progress */}
            {subtotal > 0 && subtotal < freeThreshold && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 p-3 rounded-xl bg-white/[0.02] border border-border/50">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Add <span className="text-foreground font-medium">{fmt(freeThreshold - subtotal)}</span> more for free shipping
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
