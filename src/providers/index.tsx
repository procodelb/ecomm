import { ThemeProvider } from "./theme";
import { CartProvider } from "./cart";
import { AuthProvider } from "./supabase";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
