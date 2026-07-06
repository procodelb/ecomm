interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  total: number;
  currency: string;
  locale: string;
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  total,
  currency,
  locale,
}: OrderConfirmationEmailProps) {
  return (
    <div>
      <h1>{locale === "ar-AE" ? "تم تأكيد طلبك" : "Order Confirmed"}</h1>
      <p>Hi {customerName},</p>
      <p>Your order #{orderId} has been confirmed.</p>
      <p>Total: {currency} {total.toFixed(2)}</p>
    </div>
  );
}
