import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.enum(["AE", "AU", "US"]),
  }),
  billingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.enum(["AE", "AU", "US"]),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
