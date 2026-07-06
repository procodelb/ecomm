import type { AssistantType } from "./config";

export type MessageRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
};

export type SuggestedProduct = {
  id: string;
  title: string;
  slug: string;
  priceAed: number;
  priceAud: number;
  image?: string;
  category?: string;
};

export type ChatRequest = {
  message: string;
  history: ChatMessage[];
  assistantType: AssistantType;
  locale: string;
  context?: {
    productId?: string;
    productSlug?: string;
    orderId?: string;
    productIds?: string[];
  };
};

export type ChatResponse = {
  reply: string;
  suggestedProducts?: SuggestedProduct[];
  comparisonData?: ComparisonData;
  handoffSuggested?: boolean;
  handoffData?: {
    subject: string;
    message: string;
  };
};

export type ComparisonData = {
  products: Array<{
    title: string;
    priceAed: number;
    priceAud: number;
    category?: string;
    rating?: number;
    inStock?: boolean;
    image?: string;
  }>;
  differences: string[];
};

export type AiSettings = {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  assistantTypes: AssistantType[];
};
