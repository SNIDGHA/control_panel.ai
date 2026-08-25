import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DashboardStats, RequestRecord } from '../services/api';
import { 
  Activity, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  ShieldCheck, 
  ThumbsUp, 
  TrendingUp,
  ArrowRight,
  Eye,
  Award,
  Layers,
  Skull
} from 'lucide-react';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedRequestId: (id: string) => void;
  refreshTrigger: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setCurrentPage, 
  setSelectedRequestId,
  refreshTrigger 
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [dashboardStats, requests] = await Promise.all([
          api.getDashboardStats(),
          api.getRequests()
        ]);
        setStats(dashboardStats);
        // Take top 5
        setRecentRequests(requests.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshTrigger]);

  if (loading || !stats) {
    return (
      <div class="h-[60vh] flex items-center justify-center flex-col gap-4">
        <span class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></span>
        <p class="text-sm text-slate-500 font-medium">Aggregating telemetry dashboard...</p>
      </div>
    );
  }

  const handleInspect = (id: string) => {
    setSelectedRequestId(id);
    setCurrentPage('inspector');
  };

  return (
    <div class="space-y-8">
      {/* Overview Banner */}
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div class="space-y-2 z-10">
          <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">ControlPlane Operations Console</h1>
          <p class="text-slate-300 text-sm max-w-xl">
            Real-time inspection layer active. Intercepting model interactions, sanitizing personal data, and calculating compliance risk profiles.
          </p>
        </div>

        <div class="flex items-center gap-4 z-10 shrink-0">
          <button
            onClick={() => setCurrentPage('playground')}
            class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 flex items-center gap-1.5"
          >
            Launch Playground
            <ArrowRight class="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Monitored */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold uppercase tracking-wider">Total Monitored</span>
            <Layers class="h-5 w-5 text-blue-500" />
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-bold text-slate-950 leading-none">{stats.totalRequests}</h3>
            <p class="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
              100% interception coverage
            </p>
          </div>
        </div>

        {/* Spend */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold uppercase tracking-wider">Spend Tracker</span>
            <DollarSign class="h-5 w-5 text-emerald-500" />
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-bold text-slate-950 leading-none">${stats.estimatedSpend.toFixed(4)}</h3>
            <p class="text-[10px] text-slate-500 mt-1">
              Token count: <span class="font-bold text-slate-700">{stats.tokenUsage.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Block Rate */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold uppercase tracking-wider">Block Rate</span>
            <Percent class="h-5 w-5 text-rose-500" />
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-bold text-slate-950 leading-none">{stats.blockRate}%</h3>
            <p class="text-[10px] text-slate-500 mt-1">
              Violations: <span class="font-bold text-rose-600">{stats.blockedRequests} blocked</span>
            </p>
          </div>
        </div>

        {/* Escalated */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold uppercase tracking-wider">Escalated Requests</span>
            <ShieldAlert class="h-5 w-5 text-purple-500" />
          </div>
          <div class="mt-4">
            <h3 class="text-3xl font-bold text-slate-950 leading-none">{stats.escalatedRequests}</h3>
            <p class="text-[10px] text-slate-500 mt-1">
              Pending human-in-the-loop review
            </p>
          </div>
        </div>

      </div>

      {/* Tri-dimensional Health Cards */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Card */}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                <Activity class="h-4.5 w-4.5" />
              </div>
              <h3 class="font-bold text-slate-800">Performance Health</h3>
            </div>
            <span class={`text-xs font-bold px-2 py-0.5 rounded-full ${stats.averagePerformance >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {stats.averagePerformance >= 70 ? 'HEALTHY' : 'DEGRADED'}
            </span>
          </div>
          
          <div class="p-6 flex-grow flex flex-col justify-between space-y-6">
            <div class="text-center">
              <div class="inline-flex items-baseline gap-1">
                <span class="text-5xl font-extrabold text-slate-950">{stats.averagePerformance}</span>
                <span class="text-slate-400 text-lg font-semibold">%</span>
              </div>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Average Confidence Score</p>
            </div>

            <div class="space-y-3.5">
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Relevance Probability</span>
                  <span class="font-semibold">94%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Grounding Alignment</span>
                  <span class="font-semibold">91%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Hallucination Occurrence</span>
                  <span class="font-semibold text-amber-600">8%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Health Card */}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                <DollarSign class="h-4.5 w-4.5" />
              </div>
              <h3 class="font-bold text-slate-800">Cost Control</h3>
            </div>
            <span class="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              ON BUDGET
            </span>
          </div>

          <div class="p-6 flex-grow flex flex-col justify-between space-y-6">
            <div class="text-center">
              <div class="inline-flex items-baseline gap-1">
                <span class="text-slate-400 text-lg font-semibold">$</span>
                <span class="text-5xl font-extrabold text-slate-950">{(stats.estimatedSpend * 30).toFixed(2)}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Proj. Monthly Spend</p>
            </div>

            <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-center">
              <div>
                <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Cost / Request</span>
                <span class="text-sm font-bold text-slate-800">${stats.totalRequests > 0 ? (stats.estimatedSpend / stats.totalRequests).toFixed(5) : '0.00000'}</span>
              </div>
              <div>
                <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Max Cost Cap</span>
                <span class="text-sm font-bold text-slate-800">$0.050</span>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex items-center gap-3">
              <div class="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                <TrendingUp class="h-4 w-4" />
              </div>
              <div class="text-xs">
                <span class="font-bold text-slate-700 block">Router Efficiency: 92%</span>
                <span class="text-slate-500 text-[10px]">Queries correctly routed to smaller models.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsibility Card */}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                <ShieldCheck class="h-4.5 w-4.5" />
              </div>
              <h3 class="font-bold text-slate-800">Responsibility Compliance</h3>
            </div>
            <span class="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              COMPLIANT
            </span>
          </div>

          <div class="p-6 flex-grow flex flex-col justify-between space-y-6">
            <div class="text-center">
              <div class="inline-flex items-baseline gap-1">
                <span class="text-5xl font-extrabold text-slate-950">{stats.averageResponsibility}</span>
                <span class="text-slate-400 text-lg font-semibold">%</span>
              </div>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Compliance Rating</p>
            </div>

            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                <span class="text-slate-600 font-medium">PII Intercepted</span>
                <span class="font-bold text-slate-800">{stats.riskyRequests - stats.blockedRequests} redactions</span>
              </div>
              <div class="flex items-center justify-between text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                <span class="text-slate-600 font-medium">Safety Blocks Triggered</span>
                <span class="font-bold text-rose-600">{stats.blockedRequests} incidents</span>
              </div>
              <div class="flex items-center justify-between text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                <span class="text-slate-600 font-medium">Bias Flag Detections</span>
                <span class="font-bold text-slate-800">0 flags</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Continuous Learning Panel & Feedback Loop */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award class="h-5 w-5 text-indigo-500" />
            Continuous Learning & Policy Optimization
          </h3>
          <p class="text-slate-400 text-xs mt-1">
            ControlPlane collects human-in-the-loop audit responses to adjust evaluation thresholds and train risk models.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div class="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
            <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Decisions Reviewed</span>
            <span class="text-2xl font-bold text-slate-800">{stats.learning.decisionsReviewed}</span>
          </div>

          <div class="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
            <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">False Positives Flagged</span>
            <span class="text-2xl font-bold text-slate-800">{stats.learning.falsePositives}</span>
          </div>

          <div class="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
            <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">False Negatives Flagged</span>
            <span class="text-2xl font-bold text-slate-800">{stats.learning.falseNegatives}</span>
          </div>

          <div class="bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
            <span class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Policy Improvements</span>
            <span class="text-2xl font-bold text-emerald-600">{stats.learning.policyImprovements} optimized</span>
          </div>

        </div>
      </div>

      {/* Recent Activity Log */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">Recent Interceptions</h3>
          <button 
            onClick={() => setCurrentPage('audit')} 
            class="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1"
          >
            View Full Audit Log
            <ArrowRight class="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <th class="py-4 px-6">Timestamp</th>
                <th class="py-4 px-6 w-[35%]">User Prompt</th>
                <th class="py-4 px-6">Model</th>
                <th class="py-4 px-6 text-center font-bold">Latency</th>
                <th class="py-4 px-6 text-center font-bold">Cost</th>
                <th class="py-4 px-6 text-center font-bold">Decision</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} class="py-8 text-center text-slate-400">
                    No interceptions recorded yet. Run playground queries to populate.
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} class="hover:bg-slate-50/40 transition-colors duration-150">
                    <td class="py-4 px-6 whitespace-nowrap text-slate-400 font-mono">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
