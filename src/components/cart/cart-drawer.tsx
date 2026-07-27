"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { CartItemRow } from "./cart-item-row";
import { useCart } from "@/providers/cart";
import { getLocaleConfig } from "@/lib/locale/config";
import { ShoppingBag, X, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const locale = useLocale();
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  const config = getLocaleConfig(locale);
  const freeThreshold = config.shippingZones[0]?.freeThreshold ?? 0;
  const shippingRate = config.shippingZones[0]?.rate ?? 0;
  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  const tax = subtotal * config.taxRate;
  const total = subtotal + shipping + tax;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (isDrawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const freeProgress = Math.min(subtotal / freeThreshold, 1);
  const remaining = Math.max(0, freeThreshold - subtotal);

  const handleCheckout = useCallback(() => {
    closeDrawer();
    router.push(`/${locale}/checkout`);
  }, [closeDrawer, router, locale]);

  function fmt(amount: number) {
    const sym = config.currencySymbol;
    return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <Heading as="h4">Cart ({totalItems})</Heading>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDrawer}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && remaining > 0 && (
              <div className="px-6 py-3 bg-primary-muted border-b border-primary/10">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{fmt(remaining)} away from free shipping</span>
                  <span>{Math.round(freeProgress * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${freeProgress * 100}%` }}
                  />
                </div>
              </div>
            )}

            {items.length === 0 && remaining > 0 && (
              <div className="px-6 py-3 bg-primary-muted border-b border-primary/10">
                <Text size="xs" muted>Free shipping on orders over {fmt(freeThreshold)}</Text>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                  <div className="space-y-1">
                    <Text weight="semibold">Your cart is empty</Text>
                    <Text size="sm" muted>
                      Add some items to get started
                    </Text>
                  </div>
                  <Button variant="outline" onClick={closeDrawer}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      currencySymbol={config.currencySymbol}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-success" : ""}>
                      {shipping === 0 ? "Free" : fmt(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({(config.taxRate * 100).toFixed(0)}%)</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-heading font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleCheckout}
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
