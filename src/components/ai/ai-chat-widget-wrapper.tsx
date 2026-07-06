"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ai";

export function AiChatWidget() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/forgot-password") || pathname.includes("/reset-password");
  const isCheckout = pathname.includes("/checkout");

  if (isAdmin || isAuth || isCheckout) return null;

  let assistantType = "general";
  const context: Record<string, string> = {};

  if (pathname.includes("/products/")) {
    assistantType = "product_recommendation";
    const slug = pathname.split("/products/")[1]?.split("/")[0];
    if (slug) context.productSlug = slug;
  } else if (pathname.includes("/account/support")) {
    assistantType = "order_support";
  } else if (pathname.includes("/account/orders")) {
    assistantType = "order_support";
  }

  const locale = pathname.split("/")[1] || "en-AE";
  const normalizedLocale = ["en-AE", "en-AU", "ar-AE"].includes(locale as string) ? locale : "en-AE";

  return (
    <ChatWidget
      locale={normalizedLocale}
      assistantType={assistantType}
      context={Object.keys(context).length > 0 ? context : undefined}
    />
  );
}
