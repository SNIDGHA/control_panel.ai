import { AIProvider, AIRequestOptions, AIResponse } from './provider.js';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: AIRequestOptions): Promise<AIResponse> {
    const { prompt, model, temperature = 0.7 } = options;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model.includes('gpt') ? model : 'gpt-4o-mini', // Map to OpenAI models
          messages: [{ role: 'user', content: prompt }],
          temperature: temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI HTTP Error ${response.status}: ${errorText}`);
      }

      const data = await response.json() as any;
      const rawResponse = data.choices?.[0]?.message?.content || '';
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;

      // Pricing values (USD per million tokens)
      let costPerMillionInput = 0.15;  // Default gpt-4o-mini pricing
      let costPerMillionOutput = 0.60;

      if (model.includes('gpt-4o') && !model.includes('mini')) {
        costPerMillionInput = 5.00;
        costPerMillionOutput = 15.00;
      }

      const costUsd = (inputTokens * costPerMillionInput + outputTokens * costPerMillionOutput) / 1000000;

      return {
        rawResponse,
        inputTokens,
        outputTokens,
        costUsd,
        model,
        provider: 'OpenAI'
      };
    } catch (error: any) {
      throw new Error(`Failed to generate via OpenAI: ${error.message}`);
    }
  }
}
