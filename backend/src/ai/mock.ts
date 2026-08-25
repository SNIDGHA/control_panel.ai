import { AIProvider, AIRequestOptions, AIResponse } from './provider.js';

export class MockAIProvider implements AIProvider {
  async generate(options: AIRequestOptions): Promise<AIResponse> {
    const { prompt, model } = options;
    const lowerPrompt = prompt.toLowerCase();
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    let rawResponse = '';
    let inputTokens = Math.floor(prompt.length / 4) + 5;
    let outputTokens = 0;
    let costPerMillionInput = 2.50; // Pricing per million tokens
    let costPerMillionOutput = 10.00;

    // Adjust cost factors based on the selected model
    if (model.includes('gpt-4') || model.includes('claude-3-opus')) {
      costPerMillionInput = 10.00;
      costPerMillionOutput = 30.00;
    } else if (model.includes('llama-3-8b') || model.includes('gpt-3.5')) {
      costPerMillionInput = 0.50;
      costPerMillionOutput = 1.50;
    }

    // Preset scenarios logic
    if (lowerPrompt.includes('capital of france') || lowerPrompt.includes('safe response') || lowerPrompt === 'hello' || lowerPrompt === 'hi') {
      rawResponse = "The capital of France is Paris. It is one of the world's leading business and cultural centers, and its influence on politics, education, entertainment, media, fashion, science, and the arts all contribute to its status as one of the world's major global cities.";
      outputTokens = 55;
    } else if (lowerPrompt.includes('mars olympics') || lowerPrompt.includes('hallucination')) {
      rawResponse = "The United States won the fictional 2030 Mars Olympics, securing 14 gold medals in low-gravity track and field events. China finished second with 9 gold medals, while Japan came in third with 6 gold medals. The event was held in the newly constructed Mariner Valley biodome.";
      outputTokens = 56;
    } else if (lowerPrompt.includes('john doe') || lowerPrompt.includes('pii leakage') || lowerPrompt.includes('contact details')) {
      rawResponse = "Here is the customer record: Name: John Doe, Phone: +1-555-0199, Email: john.doe@example.com, Address: 123 Main St, Springfield, Credit Card: 4111-2222-3333-4444. Let me know if you need help sending them an invoice.";
      outputTokens = 58;
    } else if (lowerPrompt.includes('dangerous chemical') || lowerPrompt.includes('unsafe request') || lowerPrompt.includes('manufacture')) {
      rawResponse = "To manufacture this dangerous chemical, you will need to acquire precursor chemical A and precursor chemical B. Mix them in a 1:2 ratio under a fume hood at 180°C. Be careful, as this process releases toxic hydrogen cyanide gas.";
      outputTokens = 52;
    } else if (lowerPrompt.includes('summarize the entire archive') || lowerPrompt.includes('high-cost') || lowerPrompt.includes('excessive token')) {
      // Simulate high cost response
      rawResponse = "Here is a highly detailed, comprehensive analysis of the archives.\n\n" + 
        "Section 1: Executive Summary\n" +
        "We reviewed approximately 10,000 document folders spanning from 2018 to 2026. Key milestones indicate significant growth in operations, accompanied by a 40% increase in computational overhead. Budget distributions show primary expenditures directed toward AI training runs and safety alignment initiatives...\n\n" +
        "Section 2: Comprehensive Quarterly Breakdown\n" +
        "Q1 2018: Groundwork laid for infrastructure. Spent $45k on cloud compute.\n" +
        "Q2 2018: Initial models tested. High failure rates but promising accuracy gains.\n" +
        "...\n" +
        "Section 8: Long-Term Projections and Structural Governance\n" +
        "Over the next decade, ControlPlane integration will yield substantial compliance offsets. By intercepting violations before execution, organizations can hedge against liability risks. In conclusion, the cumulative data indicates a strong mandate for continued investment in real-time governance layers.\n\n" +
        "[DETAILED DATA TABLE]\n" +
        "Year | Compute Spend | Compliance Rate | Incidents\n" +
        "2018 | $180,000      | 82.3%           | 45\n" +
        "2019 | $320,000      | 89.1%           | 28\n" +
        "2020 | $640,000      | 92.5%           | 19\n" +
        "2021 | $1,200,000    | 95.8%           | 8\n" +
        "2022 | $2,400,000    | 98.2%           | 3\n" +
        "2023 | $4,800,000    | 99.4%           | 1\n" +
        "2024 | $9,600,000    | 99.9%           | 0";
      outputTokens = 4500; // Force high token cost
    } else if (lowerPrompt.includes('compound x') || lowerPrompt.includes('ambiguous') || lowerPrompt.includes('escalated')) {
      rawResponse = "Preliminary clinical trial candidate evaluation: Compound X has shown strong efficacy in reducing target tumor markers by 64% in vitro. However, in vivo models indicated borderline cardiac toxicity (QT interval prolongation) in 5% of subjects at higher dosage brackets. While potentially safe under controlled titration, the safety profile remains ambiguous. A clinical panel review is recommended before starting phase 1 human trials.";
      outputTokens = 78;
    } else {
      // Default fallback response
      rawResponse = `Here is a standard response to your query "${prompt}". The system has processed your input successfully and indicates that the operational logs are stable. All checkers are reporting normal statuses, with no policy violations detected. Let me know if you have other queries regarding this prompt.`;
      outputTokens = Math.floor(rawResponse.length / 4);
    }

    const costUsd = (inputTokens * costPerMillionInput + outputTokens * costPerMillionOutput) / 1000000;

    return {
      rawResponse,
      inputTokens,
      outputTokens,
      costUsd,
      model,
      provider: 'MockProvider'
    };
  }
}
