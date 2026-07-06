import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface LogWebhookEventParams {
  provider: string;
  eventType: string;
  eventId?: string;
  headers?: Record<string, unknown>;
  body?: Record<string, unknown>;
  rawBody?: string;
  signature?: string;
  signatureValid?: boolean;
  processingStatus?: string;
  metadata?: Record<string, unknown>;
}

export async function logWebhookEvent(params: LogWebhookEventParams) {
  try {
    return await prisma.webhookLog.create({
      data: {
        provider: params.provider,
        eventType: params.eventType,
        eventId: params.eventId ?? undefined,
        headers: (params.headers ?? {}) as Prisma.InputJsonValue,
        body: (params.body ?? {}) as Prisma.InputJsonValue,
        rawBody: params.rawBody ?? undefined,
        signature: params.signature ?? undefined,
        signatureValid: params.signatureValid ?? undefined,
        processingStatus: params.processingStatus ?? "received",
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch {
    return null;
  }
}

export async function updateWebhookLogStatus(
  id: string,
  data: {
    processingStatus: string;
    responseStatus?: number;
    responseBody?: string;
    errorMessage?: string;
    retryCount?: number;
    processedAt?: Date;
  },
) {
  try {
    return await prisma.webhookLog.update({
      where: { id },
      data: {
        processingStatus: data.processingStatus,
        ...(data.responseStatus !== undefined
          ? { responseStatus: data.responseStatus }
          : {}),
        ...(data.responseBody ? { responseBody: data.responseBody } : {}),
        ...(data.errorMessage ? { errorMessage: data.errorMessage } : {}),
        ...(data.retryCount !== undefined
          ? { retryCount: data.retryCount }
          : {}),
        ...(data.processedAt ? { processedAt: data.processedAt } : {}),
      },
    });
  } catch {
    return null;
  }
}
