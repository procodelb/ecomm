import { NextResponse } from "next/server";
import { processChatRequest, getFallbackReply } from "@/lib/ai/client";
import { searchProducts, getRandomProducts } from "@/lib/ai/products";
import { aiConfig, type AssistantType } from "@/lib/ai/config";
import { HANDOFF_TRIGGER_PHRASES } from "@/lib/ai/prompts";
import type { ChatMessage, SuggestedProduct } from "@/lib/ai/types";

export async function POST(request: Request) {
  if (!aiConfig.assistant.enabled) {
    return NextResponse.json(
      { error: "AI assistant is disabled" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { message, history = [], assistantType = "general", locale = "en-AE", context } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (message.length > aiConfig.assistant.maxMessageLength) {
      return NextResponse.json(
        { error: `Message too long (max ${aiConfig.assistant.maxMessageLength} characters)` },
        { status: 400 },
      );
    }

    const truncatedHistory: ChatMessage[] = (history || []).slice(
      -aiConfig.assistant.maxHistoryLength,
    );

    const lowerMessage = message.toLowerCase();
    const isHandoffRequest = HANDOFF_TRIGGER_PHRASES.some((p) => lowerMessage.includes(p));
    if (isHandoffRequest) {
      return NextResponse.json({
        reply: getFallbackReply(assistantType, locale),
        handoffSuggested: true,
        handoffData: {
          subject: `AI Assistant Handoff: ${assistantType.replace(/_/g, " ")}`,
          message,
        },
      });
    }

    let products: SuggestedProduct[] | undefined;
    if (assistantType === "product_recommendation" || assistantType === "product_comparison") {
      const searched = await searchProducts(message, locale);
      if (searched.length > 0) {
        products = searched.slice(0, aiConfig.assistant.maxProductsPerRecommendation);
      } else {
        const random = await getRandomProducts(5);
        if (random.length > 0) products = random;
      }
    }

    const response = await processChatRequest({
      message,
      history: truncatedHistory,
      assistantType: assistantType as AssistantType,
      locale,
      context: {
        ...context,
        ...(products ? { productIds: products.map((p) => p.id) } : {}),
      },
    });

    if (products && products.length > 0) {
      response.suggestedProducts = products;
    }

    if (!response.reply) {
      response.reply = getFallbackReply(assistantType, locale);
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json(
      {
        reply: getFallbackReply("general", "en-AE"),
        error: process.env.NODE_ENV === "production" ? "Internal error" : message,
      },
      { status: 500 },
    );
  }
}
