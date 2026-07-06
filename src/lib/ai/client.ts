import { aiConfig } from "./config";
import type { ChatRequest, ChatResponse } from "./types";
import { buildSystemPrompt, buildHistoryMessages } from "./prompts";
import type { ChatMessage } from "./types";

type AiCompletionChoice = {
  message: { content: string };
  finish_reason: string;
};

type AiCompletionResponse = {
  choices: AiCompletionChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export async function getAiCompletion(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!aiConfig.openai.enabled) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.openai.model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as AiCompletionResponse;
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function processChatRequest(request: ChatRequest): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt({
    assistantType: request.assistantType,
    locale: request.locale,
    products: undefined,
    orderContext: undefined,
    faqContext: undefined,
  });

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    ...buildHistoryMessages(request.history),
    { role: "user", content: request.message.slice(0, aiConfig.assistant.maxMessageLength) },
  ];

  const reply = await getAiCompletion(messages);

  if (!reply) {
    return {
      reply: getFallbackReply(request.assistantType, request.locale),
    };
  }

  const response: ChatResponse = { reply };

  const lowerReply = reply.toLowerCase();
  const handoffPhrases = [
    "speak to a human",
    "talk to a person",
    "customer service",
    "support ticket",
    "handoff",
    "escalate",
  ];
  if (handoffPhrases.some((p) => lowerReply.includes(p))) {
    response.handoffSuggested = true;
    response.handoffData = {
      subject: `AI Assistant Handoff: ${request.assistantType.replace(/_/g, " ")}`,
      message: request.message,
    };
  }

  return response;
}

export function getFallbackReply(assistantType: string, locale: string): string {
  const isAr = locale === "ar-AE";
  const fallbacks: Record<string, Record<string, string>> = {
    general: {
      "ar-AE": "عذراً، أنا غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً أو الاتصال بفريق الدعم.",
      default: "Sorry, I'm currently unavailable. Please try again later or contact our support team.",
    },
    product_recommendation: {
      "ar-AE": "عذراً، لا يمكنني الوصول إلى كتالوج المنتجات حالياً. يرجى تصفح منتجاتنا يدوياً.",
      default: "Sorry, I can't access the product catalog right now. Please browse our products manually.",
    },
    faq: {
      "ar-AE": "عذراً، قاعدة الأسئلة الشائعة غير متاحة حالياً. يرجى مراجعة صفحة الأسئلة الشائعة.",
      default: "Sorry, the FAQ database is unavailable right now. Please check our FAQ page.",
    },
    order_support: {
      "ar-AE": "عذراً، نظام دعم الطلبات غير متاح حالياً. يرجى التحقق من طلباتك في لوحة التحكم.",
      default: "Sorry, the order support system is unavailable. Please check your orders in your account dashboard.",
    },
    product_comparison: {
      "ar-AE": "عذراً، لا يمكنني مقارنة المنتجات حالياً. يرجى المحاولة مرة أخرى.",
      default: "Sorry, I can't compare products right now. Please try again.",
    },
  };

  return fallbacks[assistantType]?.[isAr ? "ar-AE" : "default"] || fallbacks.general.default;
}
