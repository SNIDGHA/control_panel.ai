import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { RequestRecord } from '../services/api';
import { Search, Eye, Filter, Calendar } from 'lucide-react';

interface AuditLogProps {
  setCurrentPage: (page: string) => void;
  setSelectedRequestId: (id: string) => void;
  refreshTrigger: number;
}

export const AuditLog: React.FC<AuditLogProps> = ({ 
  setCurrentPage, 
  setSelectedRequestId,
  refreshTrigger
}) => {
  const [logs, setLogs] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedDecision, setSelectedDecision] = useState('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await api.getRequests({
          search: search || undefined,
          model: selectedModel || undefined,
          decision: selectedDecision || undefined
        });
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [search, selectedModel, selectedDecision, refreshTrigger]);

  const handleInspect = (id: string) => {
    setSelectedRequestId(id);
    setCurrentPage('inspector');
  };

  return (
    <div class="space-y-6">
      
      {/* Search & Filter Header */}
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div class="relative w-full md:w-80">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt, model, reason..."
            class="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50/20"
          />
        </div>

        {/* Filters */}
        <div class="flex items-center gap-3 w-full md:w-auto">
          
          {/* Model Filter */}
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold w-full md:w-auto justify-between">
            <span class="text-slate-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              class="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Models</option>
              <option value="mock-gpt-4o">gpt-4o (Mock)</option>
              <option value="mock-claude-3-5-sonnet">claude-3.5 (Mock)</option>
              <option value="mock-llama-3-8b-instruct">llama-3 (Mock)</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold w-full md:w-auto justify-between">
            <span class="text-slate-400">Decision:</span>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              class="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="EDIT">EDIT</option>
              <option value="BLOCK">BLOCK</option>
              <option value="ESCALATE">ESCALATE</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div class="py-20 text-center flex flex-col items-center justify-center gap-3">
            <span class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
            <p class="text-xs text-slate-500 font-medium">Filtering logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div class="py-20 text-center text-slate-400">
            No audit logs match the current filter selection. Try adjusting your query parameters.
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <th class="py-4 px-6">Timestamp</th>
                  <th class="py-4 px-6 w-[35%]">User Prompt</th>
                  <th class="py-4 px-6">Model</th>
                  <th class="py-4 px-6 text-center font-bold">Latency</th>
                  <th class="py-4 px-6 text-center font-bold">Spend</th>
                  <th class="py-4 px-6 text-center font-bold">Decision</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {logs.map((req) => (
                  <tr key={req.id} class="hover:bg-slate-50/40 transition-colors duration-150">
                    <td class="py-4 px-6 whitespace-nowrap text-slate-400 font-mono">
                      {new Date(req.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td class="py-4 px-6 max-w-0 truncate text-slate-700 font-medium">
                      {req.prompt}
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap">
                      <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {req.model}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-center whitespace-nowrap text-slate-500">
                      {req.latency_ms} ms
                    </td>
                    <td class="py-4 px-6 text-center whitespace-nowrap text-slate-500 font-mono font-medium">
                      ${req.cost_usd.toFixed(5)}
                    </td>
                    <td class="py-4 px-6 text-center whitespace-nowrap">
                      <span class={`inline-flex items-center justify-center font-extrabold px-2.5 py-0.5 rounded-full text-[9px] ${
                        req.decision === 'ALLOW' ? 'bg-emerald-100 text-emerald-800' :
                        req.decision === 'EDIT' ? 'bg-amber-100 text-amber-800' :
                        req.decision === 'BLOCK' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {req.decision}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleInspect(req.id)}
                        class="text-blue-600 hover:text-blue-500 transition-colors font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye class="h-3.5 w-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
