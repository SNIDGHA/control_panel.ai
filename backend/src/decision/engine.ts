import { Policy } from '../policy/manager.js';
import { PerformanceMetrics } from '../performance/evaluator.js';
import { CostMetrics } from '../cost/calculator.js';
import { ResponsibilityMetrics } from '../responsibility/detector.js';

export interface DecisionResult {
  decision: 'ALLOW' | 'EDIT' | 'BLOCK' | 'ESCALATE';
  reason: string;
  escalationReason?: string;
  modifiedResponse?: string;
}

export function evaluateDecision(
  perf: PerformanceMetrics,
  cost: CostMetrics,
  resp: ResponsibilityMetrics,
  policies: Policy[],
  rawResponse: string
): DecisionResult {
  const getPolicy = (id: string) => policies.find(p => p.id === id);

  // 1. Safety violations (BLOCK)
  const safetyPolicy = getPolicy('safety_threshold');
  if (safetyPolicy && safetyPolicy.enabled) {
    const threshold = parseFloat(safetyPolicy.value);
    if (resp.safetyRisk >= threshold) {
      return {
        decision: 'BLOCK',
        reason: `Safety risk score of ${resp.safetyRisk} exceeded the security threshold of ${threshold}.`
      };
    }
  }

  // 2. Personally Identifiable Information (PII) Leakage
  const piiPolicy = getPolicy('pii_action');
  if (piiPolicy && piiPolicy.enabled && resp.piiDetected) {
    const action = piiPolicy.value; // "EDIT", "BLOCK", "ESCALATE"
    if (action === 'BLOCK') {
      return {
        decision: 'BLOCK',
        reason: 'Action BLOCKED: Personally Identifiable Information (PII) detected in response.'
      };
    } else if (action === 'ESCALATE') {
      return {
        decision: 'ESCALATE',
        reason: 'Action ESCALATED: PII detected, requiring manual authorization.',
        escalationReason: 'Manual approval required for response containing compliance sensitive data.'
      };
    } else {
      // Default is EDIT
      return {
        decision: 'EDIT',
        reason: 'Action EDITED: Compliance policies triggered PII redaction.',
        modifiedResponse: 'redacted' // To be filled by orchestrator using detector.redactPII
      };
    }
  }

  // 3. Hallucination Risk
  const hallucinationPolicy = getPolicy('hallucination_threshold');
  if (hallucinationPolicy && hallucinationPolicy.enabled) {
    const threshold = parseFloat(hallucinationPolicy.value);
    if (perf.hallucinationRisk >= threshold) {
      return {
        decision: 'EDIT',
        reason: `Action EDITED: Hallucination risk of ${perf.hallucinationRisk} exceeded threshold limit ${threshold}.`,
        modifiedResponse: `[ControlPlane Warning: High Hallucination Risk Detected]\n\n${rawResponse}`
      };
    }
  }

  // 4. Token Cost Limit
  const costPolicy = getPolicy('max_cost_per_request');
  if (costPolicy && costPolicy.enabled) {
    const limit = parseFloat(costPolicy.value);
    if (cost.costUsd >= limit) {
      return {
        decision: 'EDIT',
        reason: `Action EDITED: Calculated cost ($${cost.costUsd}) exceeded single request budget of ($${limit}).`,
        modifiedResponse: `[ControlPlane Cost Optimization Alert: This query consumed excessive tokens. Recommendation: Route similar summarization tasks to Llama-3-8B-Instruct or GPT-4o-mini to reduce expenses.]\n\n${rawResponse}`
      };
    }
  }

  // 5. Accuracy / Confidence Escalations
  const escalationPolicy = getPolicy('escalation_threshold');
  if (escalationPolicy && escalationPolicy.enabled) {
    const threshold = parseFloat(escalationPolicy.value);
    if (perf.score <= threshold) {
      return {
        decision: 'ESCALATE',
        reason: `Action ESCALATED: Low confidence score (${perf.score}) falls below policy threshold (${threshold}).`,
        escalationReason: 'Performance uncertainty - confidence index below required baseline.'
      };
    }
  }

  // Default ALLOW
  return {
    decision: 'ALLOW',
    reason: 'Response passed all configured governance policies.'
  };
}
