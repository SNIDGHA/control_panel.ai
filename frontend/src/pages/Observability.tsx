import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ObservabilityChartData } from '../services/api';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Filter, TrendingUp, Cpu, ShieldAlert, Award } from 'lucide-react';

export const Observability: React.FC = () => {
  const [data, setData] = useState<ObservabilityChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedModel, setSelectedModel] = useState('all');

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        const chartData = await api.getObservabilityStats();
        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, []);

  if (loading || !data) {
    return (
      <div class="h-[60vh] flex items-center justify-center flex-col gap-4">
        <span class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></span>
        <p class="text-sm text-slate-500 font-medium">Aggregating telemetry logs...</p>
      </div>
    );
  }

  // Prepping pie chart colors
  const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  // Risk factors formatting for UI
  const riskStats = [
    { label: 'PII Exposure Triggers', count: data.riskDetections.pii_incidents, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'Hallucination Flags', count: data.riskDetections.hallucinations, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Safety Violations Intercepted', count: data.riskDetections.safety_violations, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { label: 'Bias Anomaly Warnings', count: data.riskDetections.bias_flags, color: 'text-blue-600 bg-blue-50 border-blue-100' }
  ];

  return (
    <div class="space-y-8">
      {/* Filters Bar */}
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Filter class="h-4.5 w-4.5 text-slate-400" />
          <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Telemetry Filters</h3>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Calendar class="h-4 w-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              class="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Cpu class="h-4 w-4 text-slate-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              class="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Routed Models</option>
              <option value="gpt-4">GPT-4o</option>
              <option value="claude">Claude 3.5</option>
              <option value="llama">Llama 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Row: Interception volume line chart */}
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp class="h-4.5 w-4.5 text-indigo-500" />
            Interception Traffic Over Time
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Aggregated daily request volumes categorized by policy decision.</p>
        </div>

        <div class="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.requestsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="total" name="Total Interceptions" stroke="#64748b" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="allowed" name="Allowed" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="edited" name="Edited" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="escalated" name="Escalated" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Spend chart, Model distribution, Risk factors */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cost Trend Chart */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 lg:col-span-8">
          <div>
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              Cost Accumulation Trend
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Estimated daily compute expenditure (USD) intercepted by the gateway.</p>
          </div>

          <div class="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.requestsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(4)}`, 'Spend']}
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="spend" name="Spend (USD)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Distribution Pie */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              Model Share
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Interception breakdown by active routed model.</p>
          </div>

          <div class="h-48 w-full flex items-center justify-center relative">
            {data.modelDistribution.length === 0 ? (
              <p class="text-xs text-slate-400">No model telemetry logs.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.modelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="model"
                  >
                    {data.modelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div class="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-600">
            {data.modelDistribution.map((entry, index) => (
              <div key={entry.model} class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                  <span class="truncate max-w-[120px]">{entry.model}</span>
                </div>
                <span>{entry.count} reqs</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Incident Categories Grid */}
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Award class="h-4.5 w-4.5 text-indigo-500" />
            Historical Policy Trigger Counts
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Sum of specific compliance incidents caught by the monitoring checkers.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {riskStats.map((item, idx) => (
            <div key={idx} class={`p-5 rounded-xl border flex flex-col justify-between gap-3 text-center ${item.color}`}>
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500">{item.label}</span>
              <span class="text-3xl font-extrabold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
