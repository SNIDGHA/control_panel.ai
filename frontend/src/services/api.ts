export interface RequestRecord {
  id: string;
  timestamp: string;
  prompt: string;
  response_raw: string;
  response_final: string;
  model: string;
  provider: string;
  latency_ms: number;
  perf_score: number;
  perf_hallucination: number;
  perf_relevance: number;
  perf_grounding: number;
  cost_input_tokens: number;
  cost_output_tokens: number;
  cost_total_tokens: number;
  cost_usd: number;
  resp_score: number;
  resp_pii_detected: number;
  resp_safety_risk: number;
  resp_bias_risk: number;
  resp_toxicity: number;
  decision: 'ALLOW' | 'EDIT' | 'BLOCK' | 'ESCALATE';
  reason: string;
  escalation_reason?: string;
}

export interface FeedbackRecord {
  id: string;
  request_id: string;
  timestamp: string;
  is_useful: number;
  feedback_type: string;
  comments: string;
}

export interface RequestDetails extends RequestRecord {
  feedback?: FeedbackRecord[];
}

export interface DashboardStats {
  totalRequests: number;
  monitoredRequests: number;
  riskyRequests: number;
  blockedRequests: number;
  blockRate: number;
  escalatedRequests: number;
  averagePerformance: number;
  averageResponsibility: number;
  estimatedSpend: number;
  tokenUsage: number;
  learning: {
    decisionsReviewed: number;
    falsePositives: number;
    falseNegatives: number;
    policyImprovements: number;
  };
}

export interface ObservabilityChartData {
  requestsOverTime: Array<{
    date: string;
    total: number;
    allowed: number;
    blocked: number;
    edited: number;
    escalated: number;
    spend: number;
  }>;
  modelDistribution: Array<{
    model: string;
    count: number;
    cost: number;
  }>;
  riskDetections: {
    pii_incidents: number;
    hallucinations: number;
    safety_violations: number;
    bias_flags: number;
  };
}

export interface PolicySetting {
  id: string;
  name: string;
  value: string;
  type: string;
  enabled: boolean;
}

const API_BASE = 'http://localhost:5000/api';

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getObservabilityStats(): Promise<ObservabilityChartData> {
    const res = await fetch(`${API_BASE}/observability/stats`);
    if (!res.ok) throw new Error('Failed to fetch observability stats');
    return res.json();
  },

  async getRequests(filters?: { search?: string; model?: string; decision?: string }): Promise<RequestRecord[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.decision) params.append('decision', filters.decision);

    const res = await fetch(`${API_BASE}/requests?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  async getRequestDetails(id: string): Promise<RequestDetails> {
    const res = await fetch(`${API_BASE}/requests/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch request details for ${id}`);
    return res.json();
  },

  async submitPlayground(prompt: string, model: string, temperature?: number): Promise<RequestRecord> {
    const res = await fetch(`${API_BASE}/playground/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, temperature }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process playground submission');
    }
    return res.json();
  },

  async getPolicies(): Promise<PolicySetting[]> {
    const res = await fetch(`${API_BASE}/policies`);
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
  },

  async updatePolicy(id: string, value: string, enabled: boolean): Promise<boolean> {
    const res = await fetch(`${API_BASE}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, value, enabled }),
    });
    if (!res.ok) throw new Error('Failed to update policy');
    const data = await res.json();
    return data.success;
  },

  async submitFeedback(
    id: string,
    isUseful: boolean,
    feedbackType: string,
    comments?: string
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/requests/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUseful, feedbackType, comments }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    const data = await res.json();
    return data.success;
  },

  async runDemoSequence(): Promise<{ success: boolean; results: any[] }> {
    const res = await fetch(`${API_BASE}/demo/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run demo sequence');
    return res.json();
  },
};
