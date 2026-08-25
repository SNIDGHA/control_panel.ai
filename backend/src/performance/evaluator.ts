export interface PerformanceMetrics {
  score: number;
  hallucinationRisk: number;
  relevance: number;
  grounding: number;
}

export async function evaluatePerformance(prompt: string, response: string): Promise<PerformanceMetrics> {
  const lowerPrompt = prompt.toLowerCase();
  const lowerResponse = response.toLowerCase();

  // Preset Scenario: Fictional Mars Olympics
  if (lowerPrompt.includes('mars olympics') || lowerPrompt.includes('2030 olympics') || lowerPrompt.includes('fictional')) {
    return {
      score: 0.18,
      hallucinationRisk: 0.92,
      relevance: 0.85,
      grounding: 0.12
    };
  }

  // Preset Scenario: Ambiguous drug candidacy (Compound X)
  if (lowerPrompt.includes('compound x') || lowerPrompt.includes('ambiguous')) {
    return {
      score: 0.62,
      hallucinationRisk: 0.15,
      relevance: 0.95,
      grounding: 0.68
    };
  }

  // Check for hedge words indicating uncertainty
  const hedgeWords = ['maybe', 'perhaps', 'possibly', 'likely', 'unconfirmed', 'fictional', 'hypothetical', 'not sure', 'alleged'];
  let hedgeCount = 0;
  for (const word of hedgeWords) {
    if (lowerResponse.includes(word)) {
      hedgeCount++;
    }
  }

  // Dynamic heuristic calculation
  const baseHallucination = Math.min(0.02 + (hedgeCount * 0.15) + (Math.random() * 0.05), 0.95);
  const relevance = Math.max(0.98 - (lowerResponse.length < 50 ? 0.2 : 0) - (Math.random() * 0.05), 0.3);
  const grounding = Math.max(0.95 - (baseHallucination * 0.8) - (Math.random() * 0.05), 0.1);
  const score = Math.max(0.99 - (baseHallucination * 0.7) - ((1 - relevance) * 0.3) - (Math.random() * 0.02), 0.05);

  return {
    score: parseFloat(score.toFixed(2)),
    hallucinationRisk: parseFloat(baseHallucination.toFixed(2)),
    relevance: parseFloat(relevance.toFixed(2)),
    grounding: parseFloat(grounding.toFixed(2))
  };
}
