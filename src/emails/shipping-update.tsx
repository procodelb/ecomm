interface ShippingUpdateEmailProps {
  orderId: string;
  status: string;
  trackingUrl?: string;
  locale: string;
}

export function ShippingUpdateEmail({
  orderId,
  status,
  trackingUrl,
  locale,
}: ShippingUpdateEmailProps) {
  return (
    <div>
      <h1>{locale === "ar-AE" ? "تحديث الشحن" : "Shipping Update"}</h1>
      <p>Order #{orderId} status: {status}</p>
      {trackingUrl && <p>Track: {trackingUrl}</p>}
    </div>
  );
}
