"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, SectionWrapper } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { CheckCircle, Package, ArrowLeft, FileText } from "lucide-react";

type OrderData = {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  itemCount: number;
};

export default function OrderConfirmationPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // In test mode — fetch order if order_id is present
    if (orderId) {
      setLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setOrder(data);
        })
        .catch((err) => console.error("Failed to fetch order:", err))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (!mounted) return null;

  return (
    <SectionWrapper>
      <Container>
        <div className="pt-24 pb-16 flex flex-col items-center text-center min-h-[60vh] justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 max-w-md"
          >
            <Heading as="h3" gradient="primary">
              Order Confirmed!
            </Heading>

            <Text muted>
              Thank you for your purchase. Your order has been received and is being processed.
            </Text>

            {order && !loading && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Order #{order.orderNumber}
                </div>
                <Link href={`/${locale}/order/confirmation/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Order Details
                  </Button>
                </Link>
              </div>
            )}

            {loading && (
              <div className="text-xs text-muted-foreground">Loading order details...</div>
            )}

            {sessionId && !orderId && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                Session: {sessionId.slice(0, 16)}...
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/${locale}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Button>
              <Link href={`/${locale}/products`}>
                <Button className="w-full">Continue Shopping</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
