// AI configuration utilities

export const isAIEnabled = () => {
  // Only check on client side to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return false;
  }
  // For now, enable AI features by default on client
  // In production, you might want to check for API key availability
  return true;
};

export const getAIConfig = () => {
  return {
    enabled: isAIEnabled(),
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    maxTokens: 500,
    temperature: 0.7,
  };
};

export const AI_FEATURES = {
  CHAT: 'chat',
  EMBEDDINGS: 'embeddings',
  RECOMMENDATIONS: 'recommendations',
} as const;

export type AIFeature = typeof AI_FEATURES[keyof typeof AI_FEATURES];