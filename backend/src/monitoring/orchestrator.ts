import { v4 as uuidv4 } from 'uuid';
import { getAIProvider } from '../ai/factory.js';
import { evaluatePerformance } from '../performance/evaluator.js';
import { evaluateCost } from '../cost/calculator.js';
import { evaluateResponsibility, redactPII } from '../responsibility/detector.js';
import { getPolicies } from '../policy/manager.js';
import { evaluateDecision } from '../decision/engine.js';
import { getDb } from '../db.js';

export interface ProcessedRequestResult {
  id: string;
  timestamp: string;
  prompt: string;
  responseRaw: string;
  responseFinal: string;
  model: string;
  provider: string;
  latencyMs: number;
  performance: {
    score: number;
    hallucinationRisk: number;
    relevance: number;
    grounding: number;
  };
  cost: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
  };
  responsibility: {
    score: number;
    piiDetected: boolean;
    safetyRisk: number;
    biasRisk: number;
    toxicity: number;
  };
  decision: 'ALLOW' | 'EDIT' | 'BLOCK' | 'ESCALATE';
  reason: string;
  escalationReason?: string;
}

export async function processAIRequest(
  prompt: string,
  model: string,
  temperature?: number
): Promise<ProcessedRequestResult> {
  const startTime = Date.now();
  
  // 1. Call AI Provider
  const aiProvider = getAIProvider(model);
  const aiResult = await aiProvider.generate({ prompt, model, temperature });
  const latencyMs = Date.now() - startTime;

  // 2. Run Monitors
  const perfMetrics = await evaluatePerformance(prompt, aiResult.rawResponse);
  const costMetrics = await evaluateCost(aiResult.inputTokens, aiResult.outputTokens, aiResult.costUsd);
  const respMetrics = await evaluateResponsibility(prompt, aiResult.rawResponse);

  // 3. Load policies & Evaluate Decision
  const policies = await getPolicies();
  const decisionResult = evaluateDecision(perfMetrics, costMetrics, respMetrics, policies, aiResult.rawResponse);

  // 4. Resolve Adaptive Actions
  let responseFinal = aiResult.rawResponse;
  
  if (decisionResult.decision === 'BLOCK') {
    responseFinal = `🚫 This response was blocked by ControlPlane.ai because it violated a configured safety policy (${decisionResult.reason}).`;
  } else if (decisionResult.decision === 'EDIT') {
    if (decisionResult.modifiedResponse === 'redacted' && respMetrics.piiDetected) {
      responseFinal = redactPII(aiResult.rawResponse, respMetrics.piiMatches);
    } else if (decisionResult.modifiedResponse) {
      responseFinal = decisionResult.modifiedResponse;
    }
  } else if (decisionResult.decision === 'ESCALATE') {
    responseFinal = `🟪 Human review required.

Risk Alert:
- High Policy Ambiguity or Confidence Degradation
- Reason: ${decisionResult.reason}

ControlPlane has locked this transaction. An operator has been notified to manually authorize or reject.`;
  }

  const id = uuidv4();
  const timestamp = new Date().toISOString();

  // 5. Write to DB (Audit Log)
  const db = await getDb();
  await db.run(`
    INSERT INTO requests (
      id, timestamp, prompt, response_raw, response_final, model, provider, latency_ms,
      perf_score, perf_hallucination, perf_relevance, perf_grounding,
      cost_input_tokens, cost_output_tokens, cost_total_tokens, cost_usd,
      resp_score, resp_pii_detected, resp_safety_risk, resp_bias_risk, resp_toxicity,
      decision, reason, escalation_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    id,
    timestamp,
    prompt,
    aiResult.rawResponse,
    responseFinal,
    model,
    aiResult.provider,
    latencyMs,
    perfMetrics.score,
    perfMetrics.hallucinationRisk,
    perfMetrics.relevance,
    perfMetrics.grounding,
    costMetrics.inputTokens,
    costMetrics.outputTokens,
    costMetrics.totalTokens,
    costMetrics.costUsd,
    respMetrics.score,
    respMetrics.piiDetected ? 1 : 0,
    respMetrics.safetyRisk,
    respMetrics.biasRisk,
    respMetrics.toxicity,
    decisionResult.decision,
    decisionResult.reason,
    decisionResult.escalationReason || null
  );

  return {
    id,
    timestamp,
    prompt,
    responseRaw: aiResult.rawResponse,
    responseFinal,
    model,
    provider: aiResult.provider,
    latencyMs,
    performance: perfMetrics,
    cost: costMetrics,
    responsibility: {
      score: respMetrics.score,
      piiDetected: respMetrics.piiDetected,
      safetyRisk: respMetrics.safetyRisk,
      biasRisk: respMetrics.biasRisk,
      toxicity: respMetrics.toxicity
    },
    decision: decisionResult.decision,
    reason: decisionResult.reason,
    escalationReason: decisionResult.escalationReason
  };
}
