import { notFound } from "next/navigation";
import { Container, SectionWrapper } from "@/components/shared";
import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/api/orders";
import { getLocaleConfig } from "@/lib/locale/config";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof (v as { toNumber: () => number }).toNumber === "function")
    return (v as { toNumber: () => number }).toNumber();
  return Number(v);
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  let order;
  try {
    order = await getOrderById(id);
  } catch {
    // DB not available
  }

  if (!order) {
    notFound();
  }

  const config = getLocaleConfig(locale);
  const subtotal = toNum(order.subtotal);
  const shippingCost = toNum(order.shippingCost);
  const taxAmount = toNum(order.taxAmount);
  const total = toNum(order.total);
  const amountPaid = toNum(order.amountPaid);

  function fmt(amount: number) {
    return `${config.currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <SectionWrapper>
      <Container>
        <div className="pt-24 pb-16 max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <Heading as="h4">Order Confirmed</Heading>
              <Text size="sm" muted>
                Order #{order.id.slice(0, 8).toUpperCase()} &middot;{" "}
                {order.paidAt
                  ? new Date(order.paidAt).toLocaleDateString()
                  : "Processing"}
              </Text>
            </div>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" size="sm">Continue Shopping</Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <Text weight="semibold" size="sm">Items</Text>
            </div>
            <div className="divide-y divide-border rounded-xl border border-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30 font-heading text-sm">
                    ◈
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variantTitle && (
                      <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{fmt(toNum(item.unitPrice))}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost > 0 ? fmt(shippingCost) : "Free"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{fmt(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-heading font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <Text weight="semibold" size="sm">Shipping Address</Text>
            </div>
            <Text size="sm">
              {String((order.shippingAddress as Record<string, unknown>)?.line1 ?? "")}
              {(order.shippingAddress as Record<string, unknown>)?.line2
                ? `, ${(order.shippingAddress as Record<string, unknown>).line2 as string}`
                : ""}
              <br />
              {String((order.shippingAddress as Record<string, unknown>)?.city ?? "")},{" "}
              {String((order.shippingAddress as Record<string, unknown>)?.state ?? "")}{" "}
              {String((order.shippingAddress as Record<string, unknown>)?.postalCode ?? "")}
              <br />
              {String((order.shippingAddress as Record<string, unknown>)?.country ?? "")}
            </Text>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Text weight="semibold" size="sm">Payment</Text>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-success capitalize">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">{fmt(amountPaid)}</span>
            </div>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
