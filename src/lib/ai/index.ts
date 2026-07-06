export { aiConfig, AI_WELCOME_MESSAGES, ASSISTANT_TYPES } from "./config";
export type { AssistantType } from "./config";
export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  SuggestedProduct,
  ComparisonData,
  AiSettings,
} from "./types";
export { processChatRequest, getFallbackReply } from "./client";
export { searchProducts, getProductsByIds, getRandomProducts } from "./products";
export { buildSystemPrompt, HANDOFF_TRIGGER_PHRASES } from "./prompts";
