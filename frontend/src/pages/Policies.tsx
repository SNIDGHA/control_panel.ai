import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { PolicySetting } from '../services/api';
import { Sliders, ShieldCheck, HelpCircle, Save } from 'lucide-react';

interface PoliciesProps {
  onPoliciesUpdated: () => void;
}

export const Policies: React.FC<PoliciesProps> = ({ onPoliciesUpdated }) => {
  const [policies, setPolicies] = useState<PolicySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        setLoading(true);
        const data = await api.getPolicies();
        setPolicies(data);
      } catch (err) {
        console.error('Failed to load policies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    const updated = policies.map(p => p.id === id ? { ...p, enabled } : p);
    setPolicies(updated);

    const policy = updated.find(p => p.id === id)!;
    await savePolicy(policy);
  };

  const handleValueChange = (id: string, value: string) => {
    const updated = policies.map(p => p.id === id ? { ...p, value } : p);
    setPolicies(updated);
  };

  const savePolicy = async (policy: PolicySetting) => {
    setSavingId(policy.id);
    setSuccessMsg(null);
    try {
      await api.updatePolicy(policy.id, policy.value, policy.enabled);
      setSuccessMsg(`Policy "${policy.name}" updated successfully.`);
      onPoliciesUpdated(); // Refresh dashboard stats
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save policy');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div class="h-[60vh] flex items-center justify-center flex-col gap-4">
        <span class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></span>
        <p class="text-sm text-slate-500 font-medium">Loading compliance policies...</p>
      </div>
    );
  }

  return (
    <div class="space-y-8 max-w-4xl">
      {/* Title */}
      <div class="space-y-1">
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders class="h-5.5 w-5.5 text-blue-600" />
          Governance Policy Control
        </h2>
        <p class="text-slate-500 text-xs leading-relaxed">
          Configure rule thresholds and fallback actions for the real-time decision engine. These changes affect playground intercept evaluations immediately.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div class="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse-slow">
          <ShieldCheck class="h-4.5 w-4.5" />
          {successMsg}
        </div>
      )}

      {/* Policies Grid */}
      <div class="space-y-6">
        {policies.map((policy) => {
          return (
            <div 
              key={policy.id} 
              class={`bg-white rounded-xl border p-6 shadow-sm transition-all duration-200 ${
                policy.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Policy Label & Description */}
                <div class="space-y-1 max-w-md">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 text-sm">{policy.name}</span>
                    <div class="group relative cursor-help">
                      <HelpCircle class="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                      <span class="absolute hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] p-2 rounded-lg -top-8 left-6 w-48 shadow-lg font-medium leading-normal z-20">
                        {policy.id === 'hallucination_threshold' ? 'Threshold matching confidence levels below which text is flagged as hallucinated.' :
                         policy.id === 'pii_action' ? 'Policy action when credit cards, phone numbers, or emails are scanned.' :
                         policy.id === 'max_cost_per_request' ? 'Maximum budget limit in USD allowed for a single API query.' :
                         policy.id === 'safety_threshold' ? 'Severity index at which dangerous chemical, violence, or hate keywords block the prompt.' :
                         'Minimum accuracy grounding rate below which a query is routed to human review.'}
                      </span>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-500 font-medium">
                    ID: <span class="font-mono text-slate-400">{policy.id}</span>
                  </p>
                </div>

                {/* Policy Controls */}
                <div class="flex items-center gap-4.5 shrink-0 self-end sm:self-auto">
                  
                  {/* Slider or Field input based on policy type */}
                  {policy.type === 'number' && (
                    <div class="flex items-center gap-3">
                      {policy.id === 'max_cost_per_request' ? (
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                          <input
                            type="number"
                            step="0.005"
                            min="0.001"
                            disabled={!policy.enabled}
                            value={policy.value}
                            onChange={(e) => handleValueChange(policy.id, e.target.value)}
                            class="w-24 border border-slate-200 rounded-lg py-1.5 pl-7 pr-3 text-xs font-bold text-slate-700 bg-slate-50/20 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ) : (
                        <div class="flex items-center gap-3">
                          <input
                            type="range"
                            min="0.10"
                            max="0.95"
                            step="0.05"
                            disabled={!policy.enabled}
                            value={policy.value}
                            onChange={(e) => handleValueChange(policy.id, e.target.value)}
                            class="accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer w-28 disabled:cursor-not-allowed"
                          />
                          <span class="text-xs font-bold text-slate-700 w-10 text-right">
                            {Math.round(parseFloat(policy.value) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions select list for string properties like PII */}
                  {policy.type === 'string' && (
                    <select
                      value={policy.value}
                      disabled={!policy.enabled}
                      onChange={(e) => handleValueChange(policy.id, e.target.value)}
                      class="border border-slate-200 rounded-lg p-2 text-xs font-semibold bg-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      <option value="EDIT">EDIT (Redact PII)</option>
                      <option value="BLOCK">BLOCK (Intercept request)</option>
                      <option value="ESCALATE">ESCALATE (Escalate to Human)</option>
                    </select>
                  )}

                  {/* Enable/Disable Toggle */}
                  <label class="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={policy.enabled} 
                      onChange={(e) => handleToggle(policy.id, e.target.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  {/* Save button */}
                  <button
                    onClick={() => savePolicy(policy)}
                    disabled={savingId === policy.id}
                    class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 border border-slate-200 disabled:opacity-50"
                  >
                    <Save class="h-4 w-4" />
                  </button>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
