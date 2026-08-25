import { getDb } from '../db.js';

export interface Policy {
  id: string;
  name: string;
  value: string;
  type: string;
  enabled: boolean;
}

export async function getPolicies(): Promise<Policy[]> {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM policies');
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    value: row.value,
    type: row.type,
    enabled: row.enabled === 1
  }));
}

export async function updatePolicy(id: string, value: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  await db.run('UPDATE policies SET value = ?, enabled = ? WHERE id = ?', value, enabled ? 1 : 0, id);
}
