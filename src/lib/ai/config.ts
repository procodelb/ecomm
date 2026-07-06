export const aiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    enabled: !!process.env.OPENAI_API_KEY,
  },
  assistant: {
    enabled: process.env.AI_ASSISTANT_ENABLED !== "false",
    maxMessageLength: 2000,
    maxHistoryLength: 20,
    maxProductsPerRecommendation: 5,
  },
} as const;

export const AI_WELCOME_MESSAGES: Record<string, string> = {
  "en-AE": "👋 Hi! I'm your AI shopping assistant. I can help you find products, compare items, answer questions about orders, or help with FAQs. How can I help you today?",
  "en-AU": "👋 G'day! I'm your AI shopping assistant. I can help you find products, compare items, answer questions about orders, or help with FAQs. How can I help you today?",
  "ar-AE": "👋 مرحباً! أنا مساعد التسوق الذكي. يمكنني مساعدتك في العثور على المنتجات، مقارنتها، الإجابة عن أسئلة الطلبات، أو المساعدة في الأسئلة الشائعة. كيف يمكنني مساعدتك اليوم؟",
};

export const ASSISTANT_TYPES = [
  "general",
  "product_recommendation",
  "faq",
  "order_support",
  "product_comparison",
] as const;

export type AssistantType = (typeof ASSISTANT_TYPES)[number];
