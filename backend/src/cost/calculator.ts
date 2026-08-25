export interface CostMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}

export async function evaluateCost(
  inputTokens: number,
  outputTokens: number,
  costUsd: number
): Promise<CostMetrics> {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costUsd: parseFloat(costUsd.toFixed(6))
  };
}
