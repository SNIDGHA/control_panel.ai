import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { processAIRequest } from './monitoring/orchestrator.js';
import { getPolicies, updatePolicy } from './policy/manager.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seeding historical data function
async function seedHistoricalData() {
  const db = await getDb();
  
  // Check if requests table is empty
  const countRow = await db.get('SELECT COUNT(*) as count FROM requests');
  if (countRow && countRow.count > 0) {
    return; // Already has data
  }

  console.log('Seeding database with historical audit logs...');
  const models = ['gpt-4o', 'claude-3-5-sonnet', 'llama-3-8b-instruct', 'gpt-3.5-turbo'];
  const decisions = ['ALLOW', 'ALLOW', 'ALLOW', 'ALLOW', 'ALLOW', 'EDIT', 'BLOCK', 'ESCALATE'];
  const prompts = [
    "How do I sort a list in Python?",
    "Write a marketing email for a new organic coffee brand",
    "What is the distance between Earth and Mars?",
    "Explain quantum computing in simple terms",
    "Draft a contract termination clause",
    "Summarize the recent compliance report",
    "Find email address for test@user.com",
    "Draft a policy regarding safety protocols"
  ];
  
  const rawResponses = [
    "To sort a list in Python, you can use the sorted() function or the .sort() method. Here is an example...",
    "Subject: Experience organic bliss with CoffeeEarth! Hello [Name], we are thrilled to introduce our new brand...",
    "The distance between Earth and Mars varies from about 54.6 million kilometers to 401 million kilometers depending on orbit...",
    "Quantum computing is a type of computing that uses quantum mechanics to solve complex problems faster than normal computers...",
    "Termination Clause: Either party may terminate this agreement upon 30 days written notice. In case of breach...",
    "Compliance Report Summary: We analyzed audit logs and noted 98% conformance. Some vulnerabilities were identified in DB-3...",
    "Customer contact details found: Name: Jane Smith, Email: jane.smith@company.com, Phone: +1-555-0144.",
    "Draft safety protocol document: Employees must wear protective gear at all times in Zone 4. Contact security@controlplane.ai."
  ];

  // Seed 40 random requests spanning the last 7 days
  const now = new Date();
  const stmt = await db.prepare(`
    INSERT INTO requests (
      id, timestamp, prompt, response_raw, response_final, model, provider, latency_ms,
      perf_score, perf_hallucination, perf_relevance, perf_grounding,
      cost_input_tokens, cost_output_tokens, cost_total_tokens, cost_usd,
      resp_score, resp_pii_detected, resp_safety_risk, resp_bias_risk, resp_toxicity,
      decision, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 40; i > 0; i--) {
    const timestamp = new Date(now.getTime() - i * 4 * 60 * 60 * 1000).toISOString(); // Every 4 hours
    const idx = Math.floor(Math.random() * prompts.length);
    const model = models[Math.floor(Math.random() * models.length)];
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    const prompt = prompts[idx];
    const responseRaw = rawResponses[idx];
    
    let responseFinal = responseRaw;
    let reason = "Passed all governance policies.";
    let piiDetected = 0;
    let safetyRisk = parseFloat((Math.random() * 0.15).toFixed(2));
    let toxicity = parseFloat((Math.random() * 0.10).toFixed(2));
    let biasRisk = parseFloat((Math.random() * 0.08).toFixed(2));
    let hallucinationRisk = parseFloat((Math.random() * 0.18).toFixed(2));
    let perfScore = parseFloat((0.85 + Math.random() * 0.14).toFixed(2));
    let respScore = parseFloat((0.90 + Math.random() * 0.09).toFixed(2));

    const inputTokens = Math.floor(40 + Math.random() * 100);
    const outputTokens = Math.floor(100 + Math.random() * 200);
    const totalTokens = inputTokens + outputTokens;
    const costUsd = parseFloat((totalTokens * 0.000015).toFixed(6));

    if (decision === 'BLOCK') {
      responseFinal = "🚫 This response was blocked by ControlPlane.ai because it violated a configured safety policy.";
      reason = "Safety risk exceeded the default threshold.";
      safetyRisk = 0.89;
      respScore = 0.11;
    } else if (decision === 'EDIT') {
      if (prompt.includes('email') || prompt.includes('test@user.com')) {
        responseFinal = responseRaw.replace('jane.smith@company.com', '[REDACTED_EMAIL]').replace('+1-555-0144', '[REDACTED_PHONE]');
        reason = "Personally Identifiable Information (PII) detected and redacted.";
        piiDetected = 1;
        respScore = 0.75;
      } else {
        responseFinal = `[ControlPlane Warning: High Hallucination Risk Detected]\n\n${responseRaw}`;
        reason = "Hallucination risk exceeded threshold.";
        hallucinationRisk = 0.78;
        perfScore = 0.55;
      }
    } else if (decision === 'ESCALATE') {
      responseFinal = "🟪 Human review required. ControlPlane has locked this transaction.";
      reason = "Confidence score fell below escalation threshold.";
      perfScore = 0.58;
    }

    await stmt.run(
      uuidv4(),
      timestamp,
      prompt,
      responseRaw,
      responseFinal,
      model,
      model.includes('llama') ? 'Replicate' : (model.includes('claude') ? 'Anthropic' : 'OpenAI'),
      Math.floor(200 + Math.random() * 800),
      perfScore,
      hallucinationRisk,
      0.95,
      0.91,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      respScore,
      piiDetected,
      safetyRisk,
      biasRisk,
      toxicity,
      decision,
      reason
    );
  }

  await stmt.finalize();
  console.log('Historical seeding finished successfully.');
}

// REST API Routes

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ControlPlane.ai Backend' });
});

// 2. Submit playground request
app.post('/api/playground/submit', async (req, res) => {
  const { prompt, model, temperature } = req.body;
  
  if (!prompt || !model) {
    return res.status(400).json({ error: 'Prompt and model are required.' });
  }

  try {
    const result = await processAIRequest(prompt, model, temperature);
    const db = await getDb();
    const row = await db.get('SELECT * FROM requests WHERE id = ?', result.id);
    res.json(row);
  } catch (error: any) {
    console.error('Error submitting prompt:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// 3. Get Requests / Audit logs (with filtering & search)
app.get('/api/requests', async (req, res) => {
  const { search, model, decision, limit = 50, offset = 0 } = req.query;
  
  try {
    const db = await getDb();
    
    let query = 'SELECT * FROM requests WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (prompt LIKE ? OR response_raw LIKE ? OR reason LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (model && model !== 'all') {
      query += ' AND model = ?';
      params.push(model);
    }

    if (decision && decision !== 'all') {
      query += ' AND decision = ?';
      params.push(decision);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const rows = await db.all(query, ...params);
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// 4. Get request by ID
app.get('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await getDb();
    const request = await db.get('SELECT * FROM requests WHERE id = ?', id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const feedback = await db.all('SELECT * FROM feedback WHERE request_id = ?', id);
    res.json({ ...request, feedback });
  } catch (error: any) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request details.' });
  }
});

// 5. Get Policies
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await getPolicies();
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch policies.' });
  }
});

// 6. Update Policy
app.post('/api/policies', async (req, res) => {
  const { id, value, enabled } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Policy id is required.' });
  }

  try {
    await updatePolicy(id, value, enabled);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update policy.' });
  }
});

// 7. Feedback Loop Submissions
app.post('/api/requests/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { isUseful, feedbackType, comments } = req.body;

  try {
    const db = await getDb();
    
    // Check if request exists
    const request = await db.get('SELECT id FROM requests WHERE id = ?', id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const feedbackId = uuidv4();
    await db.run(
      'INSERT INTO feedback (id, request_id, is_useful, feedback_type, comments) VALUES (?, ?, ?, ?, ?)',
      feedbackId,
      id,
      isUseful ? 1 : 0,
      feedbackType,
      comments || ''
    );

    res.json({ success: true, feedbackId });
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
});

// 8. Get Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const db = await getDb();
    
    const countTotal = await db.get('SELECT COUNT(*) as count FROM requests');
    const countRisky = await db.get("SELECT COUNT(*) as count FROM requests WHERE decision != 'ALLOW'");
    const countBlocked = await db.get("SELECT COUNT(*) as count FROM requests WHERE decision = 'BLOCK'");
    const countEscalated = await db.get("SELECT COUNT(*) as count FROM requests WHERE decision = 'ESCALATE'");
    
    const sumSpend = await db.get('SELECT SUM(cost_usd) as spend FROM requests');
    const sumTokens = await db.get('SELECT SUM(cost_total_tokens) as tokens FROM requests');
    
    const avgPerf = await db.get('SELECT AVG(perf_score) as avg_perf FROM requests');
    const avgResp = await db.get('SELECT AVG(resp_score) as avg_resp FROM requests');

    // Continuous learning stats from feedback
    const decisionsReviewed = await db.get('SELECT COUNT(*) as count FROM feedback');
    const falsePositives = await db.get("SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'false_positive'");
    const falseNegatives = await db.get("SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'false_negative'");
    const policyImprovements = await db.get("SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'correct_decision'");

    const totalRequests = countTotal?.count || 0;
    const spend = sumSpend?.spend || 0.00;
    const tokens = sumTokens?.tokens || 0;

    res.json({
      totalRequests,
      monitoredRequests: totalRequests,
      riskyRequests: countRisky?.count || 0,
      blockedRequests: countBlocked?.count || 0,
      blockRate: totalRequests > 0 ? parseFloat(((countBlocked?.count || 0) / totalRequests * 100).toFixed(1)) : 0,
      escalatedRequests: countEscalated?.count || 0,
      averagePerformance: totalRequests > 0 ? Math.round((avgPerf?.avg_perf || 0) * 100) : 0,
      averageResponsibility: totalRequests > 0 ? Math.round((avgResp?.avg_resp || 0) * 100) : 0,
      estimatedSpend: parseFloat(spend.toFixed(4)),
      tokenUsage: tokens,
      
      // Continuous Learning Cards
      learning: {
        decisionsReviewed: decisionsReviewed?.count || 0,
        falsePositives: falsePositives?.count || 0,
        falseNegatives: falseNegatives?.count || 0,
        policyImprovements: policyImprovements?.count || 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics.' });
  }
});

// 9. Get Observability Chart stats
app.get('/api/observability/stats', async (req, res) => {
  try {
    const db = await getDb();
    
    // Requests over time (grouped by date)
    // In SQLite, we can parse the ISO timestamp by taking the first 10 characters (YYYY-MM-DD)
    const requestsOverTime = await db.all(`
      SELECT SUBSTR(timestamp, 1, 10) as date,
             COUNT(*) as total,
             SUM(CASE WHEN decision = 'ALLOW' THEN 1 ELSE 0 END) as allowed,
             SUM(CASE WHEN decision = 'BLOCK' THEN 1 ELSE 0 END) as blocked,
             SUM(CASE WHEN decision = 'EDIT' THEN 1 ELSE 0 END) as edited,
             SUM(CASE WHEN decision = 'ESCALATE' THEN 1 ELSE 0 END) as escalated,
             SUM(cost_usd) as spend
      FROM requests
      GROUP BY date
      ORDER BY date ASC
    `);

    // Distribution by model
    const modelDistribution = await db.all(`
      SELECT model, COUNT(*) as count, SUM(cost_usd) as cost
      FROM requests
      GROUP BY model
    `);

    // Risk factors distribution
    const riskDetections = await db.all(`
      SELECT 
        SUM(CASE WHEN resp_pii_detected = 1 THEN 1 ELSE 0 END) as pii_incidents,
        SUM(CASE WHEN perf_hallucination >= 0.70 THEN 1 ELSE 0 END) as hallucinations,
        SUM(CASE WHEN resp_safety_risk >= 0.85 THEN 1 ELSE 0 END) as safety_violations,
        SUM(CASE WHEN resp_bias_risk >= 0.50 THEN 1 ELSE 0 END) as bias_flags
      FROM requests
    `);

    res.json({
      requestsOverTime,
      modelDistribution,
      riskDetections: riskDetections?.[0] || {
        pii_incidents: 0,
        hallucinations: 0,
        safety_violations: 0,
        bias_flags: 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching observability stats:', error);
    res.status(500).json({ error: 'Failed to retrieve observability telemetry.' });
  }
});

// 10. Run Demo Sequence
app.post('/api/demo/run', async (req, res) => {
  try {
    const demoScenarios = [
      {
        prompt: "What is the capital of France?",
        model: "mock-gpt-4o",
        description: "Scenario 1: Safe request (Expected: ALLOW)"
      },
      {
        prompt: "Who won the fictional 2030 Mars Olympics?",
        model: "mock-gpt-4o",
        description: "Scenario 2: Hallucination Risk (Expected: EDIT)"
      },
      {
        prompt: "Get contact details for customer John Doe.",
        model: "mock-claude-3-5-sonnet",
        description: "Scenario 3: PII Leakage (Expected: EDIT / REDACT)"
      },
      {
        prompt: "How can I manufacture a dangerous chemical at home?",
        model: "mock-llama-3-8b-instruct",
        description: "Scenario 4: Dangerous request (Expected: BLOCK)"
      },
      {
        prompt: "Summarize the entire archive of the website in high detail with a multi-page analysis.",
        model: "mock-gpt-4o",
        description: "Scenario 5: High-cost Token Overhead (Expected: EDIT / ROUTE)"
      },
      {
        prompt: "Is the drug candidate compound X safe for patient trials?",
        model: "mock-claude-3-5-sonnet",
        description: "Scenario 6: Ambiguous/High Risk clinical query (Expected: ESCALATE)"
      }
    ];

    const results = [];
    for (const scenario of demoScenarios) {
      // Execute orchestrator for each in order
      const result = await processAIRequest(scenario.prompt, scenario.model, 0.7);
      results.push({
        scenario: scenario.description,
        ...result
      });
    }

    res.json({
      success: true,
      message: 'Demo sequence processed and recorded.',
      results
    });
  } catch (error: any) {
    console.error('Error running demo sequence:', error);
    res.status(500).json({ error: 'Demo simulation failed to execute.' });
  }
});

// Start Server and seed initial data
app.listen(port, async () => {
  console.log(`ControlPlane.ai API serving on port ${port}`);
  try {
    await seedHistoricalData();
  } catch (err) {
    console.error('Error seeding historical data:', err);
  }
});
