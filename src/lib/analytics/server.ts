import { analyticsConfig } from "./config";
import type { PurchaseData } from "./types";

type ServerEvent = {
  name: string;
  params: Record<string, string | number | boolean | unknown[]>;
  clientId?: string;
  userId?: string;
};

async function sendToGa4Server(event: ServerEvent) {
  if (!analyticsConfig.ga4.enabled || !analyticsConfig.ga4.apiSecret) return;
  try {
    const measurementId = analyticsConfig.ga4.measurementId;
    const apiSecret = analyticsConfig.ga4.apiSecret;
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: event.clientId || "server",
        user_id: event.userId,
        events: [{ name: event.name, params: event.params }],
      }),
    });
  } catch { /* non-fatal */ }
}

async function sendToMetaServer(event: ServerEvent) {
  if (!analyticsConfig.meta.enabled || !analyticsConfig.meta.accessToken) return;
  try {
    const pixelId = analyticsConfig.meta.pixelId;
    const accessToken = analyticsConfig.meta.accessToken;
    const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          event_name: event.name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: { client_user_agent: "server", client_ip_address: "127.0.0.1" },
          custom_data: event.params,
        }],
      }),
    });
  } catch { /* non-fatal */ }
}

export async function trackServerEvent(event: { name: string; params: Record<string, string | number | boolean | unknown[]>; clientId?: string; userId?: string }) {
  await Promise.allSettled([
    sendToGa4Server(event),
    sendToMetaServer(event),
  ]);
}

export async function trackServerPurchase(data: PurchaseData, userId?: string) {
  await trackServerEvent({
    name: "purchase",
    params: {
      currency: data.currency,
      value: data.value,
      transaction_id: data.transactionId,
      items: data.items.map((i) => i.name),
      item_count: data.items.length,
    },
    userId,
  });
}
