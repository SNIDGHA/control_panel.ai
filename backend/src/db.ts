import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const dbFile = process.env.DATABASE_FILE || 'controlplane.sqlite';
const dbPath = path.resolve(__dirname, '..', dbFile);

export async function getDb() {
  if (db) return db;

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initDb();
  return db;
}

async function initDb() {
  const database = db!;

  // 1. Create requests table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      prompt TEXT,
      response_raw TEXT,
      response_final TEXT,
      model TEXT,
      provider TEXT,
      latency_ms INTEGER,
      perf_score REAL,
      perf_hallucination REAL,
      perf_relevance REAL,
      perf_grounding REAL,
      cost_input_tokens INTEGER,
      cost_output_tokens INTEGER,
      cost_total_tokens INTEGER,
      cost_usd REAL,
      resp_score REAL,
      resp_pii_detected INTEGER,
      resp_safety_risk REAL,
      resp_bias_risk REAL,
      resp_toxicity REAL,
      decision TEXT,
      reason TEXT,
      escalation_reason TEXT
    )
  `);

  // 2. Create policies table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      name TEXT,
      value TEXT,
      type TEXT,
      enabled INTEGER
    )
  `);

  // 3. Create feedback table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      request_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_useful INTEGER,
      feedback_type TEXT,
      comments TEXT,
      FOREIGN KEY (request_id) REFERENCES requests(id)
    )
  `);

  // Seed default policies if empty
  const count = await database.get('SELECT COUNT(*) as count FROM policies');
  if (count && count.count === 0) {
    const defaultPolicies = [
      { id: 'hallucination_threshold', name: 'Hallucination Threshold', value: '0.70', type: 'number', enabled: 1 },
      { id: 'pii_action', name: 'PII Detection Action', value: 'EDIT', type: 'string', enabled: 1 },
      { id: 'max_cost_per_request', name: 'Max Cost per Request (USD)', value: '0.05', type: 'number', enabled: 1 },
      { id: 'safety_threshold', name: 'Safety Violation Threshold', value: '0.85', type: 'number', enabled: 1 },
      { id: 'escalation_threshold', name: 'Human Escalation Threshold', value: '0.65', type: 'number', enabled: 1 }
    ];

    const stmt = await database.prepare('INSERT INTO policies (id, name, value, type, enabled) VALUES (?, ?, ?, ?, ?)');
    for (const policy of defaultPolicies) {
      await stmt.run(policy.id, policy.name, policy.value, policy.type, policy.enabled);
    }
    await stmt.finalize();
    console.log('Database seeded with default policies.');
  }
}
