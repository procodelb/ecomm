export type PaymentProvider = "cash_on_delivery" | "alfan" | "stripe";

export interface PaymentConfig {
  provider: PaymentProvider;
  alfanEnabled: boolean;
  alfanUrl: string | null;
  stripeEnabled: boolean;
}
