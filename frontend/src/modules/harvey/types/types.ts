export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  metadata?: {
    plan?: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
}

export interface PricingContextItem {
  id: string;
  kind: 'url' | 'yaml';
  label: string;
  value: string;
  origin: 'user' | 'detected' | 'preset' | 'agent';
}

export interface ContextItemInput {
  kind: PricingContextItem['kind'];
  label: string;
  value: string;
  origin?: PricingContextItem['origin'];
}

export interface PromptPresetContext extends Omit<ContextItemInput, 'origin'> {
  origin?: PricingContextItem['origin'];
}

export interface PromptPreset {
  id: string;
  label: string;
  description: string;
  question: string;
  context: PromptPresetContext[];
}
