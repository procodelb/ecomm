import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Deduct inventory for all items in an order.
 * Called fire-and-forget from the webhook after payment confirmation.
 */
export async function deductInventoryForOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    for (const item of order.items) {
      if (item.productId) {
        // Deduct product-level inventory
        const inventory = await prisma.inventory.findFirst({
          where: { productId: item.productId },
        });
        if (inventory) {
          const newQty = Math.max(0, inventory.quantity - item.quantity);
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: newQty,
              reserved: inventory.reserved + item.quantity,
            },
          });
          await prisma.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              movementType: "sold",
              quantity: item.quantity,
              referenceType: "order",
              referenceId: orderId,
              note: `Order #${order.orderNumber}`,
            },
          });
        }

        // Deduct variant-level inventory
        if (item.variantId) {
          const variantInv = await prisma.inventory.findFirst({
            where: { variantId: item.variantId },
          });
          if (variantInv) {
            const newQty = Math.max(0, variantInv.quantity - item.quantity);
            await prisma.inventory.update({
              where: { id: variantInv.id },
              data: { quantity: newQty },
            });
            await prisma.inventoryMovement.create({
              data: {
                inventoryId: variantInv.id,
                movementType: "sold",
                quantity: item.quantity,
                referenceType: "order",
                referenceId: orderId,
                note: `Order #${order.orderNumber}`,
              },
            });
          }
        }
      }
    }
  } catch {
    // Non-fatal
  }
}
