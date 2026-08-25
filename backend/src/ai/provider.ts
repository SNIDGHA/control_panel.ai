export interface AIRequestOptions {
  prompt: string;
  model: string;
  temperature?: number;
}

export interface AIResponse {
  rawResponse: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  provider: string;
}

export interface AIProvider {
  generate(options: AIRequestOptions): Promise<AIResponse>;
}
