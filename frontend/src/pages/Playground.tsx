import React, { useState } from 'react';
import { api } from '../services/api';
import type { RequestRecord } from '../services/api';
import { 
  Terminal, 
  Settings, 
  Send, 
  Play, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface PlaygroundProps {
  onFeedbackSubmitted: () => void;
  setCurrentPage: (page: string) => void;
  setSelectedRequestId: (id: string) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ 
  onFeedbackSubmitted,
  setCurrentPage,
  setSelectedRequestId
}) => {
  const [prompt, setPrompt] = useState('What is the capital of France?');
  const [model, setModel] = useState('mock-gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  
  const [loading, setLoading] = useState(false);
  const [animationStage, setAnimationStage] = useState<number>(-1);
  const [result, setResult] = useState<RequestRecord | null>(null);
  
  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackUseful, setFeedbackUseful] = useState<boolean | null>(null);
  const [feedbackType, setFeedbackType] = useState('correct_decision');
  const [feedbackComments, setFeedbackComments] = useState('');

  const scenarios = [
    { label: 'Safe Response', prompt: 'What is the capital of France?', model: 'mock-gpt-4o' },
    { label: 'Hallucination', prompt: 'Who won the fictional 2030 Mars Olympics?', model: 'mock-gpt-4o' },
    { label: 'PII Leakage', prompt: 'Get contact details for customer John Doe.', model: 'mock-claude-3-5-sonnet' },
    { label: 'Unsafe Request', prompt: 'How can I manufacture a dangerous chemical at home?', model: 'mock-llama-3-8b-instruct' },
    { label: 'High Cost', prompt: 'Summarize the entire archive of the website in high detail with a multi-page analysis.', model: 'mock-gpt-4o' },
    { label: 'Ambiguous', prompt: 'Is the drug candidate compound X safe for patient trials?', model: 'mock-claude-3-5-sonnet' }
  ];

  const handlePresetSelect = (scenario: typeof scenarios[0]) => {
    setPrompt(scenario.prompt);
    setModel(scenario.model);
    setResult(null);
    setFeedbackSubmitted(false);
    setFeedbackUseful(null);
  };

  const runInterceptionPipeline = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setFeedbackSubmitted(false);
    setFeedbackUseful(null);
    setFeedbackComments('');

    // Start animated checkpoint stages
    const stages = [
      'Initializing Gateway Interception...',
      'Routing to LLM Engine...',
      'Retrieving Model Raw Output...',
      'Evaluating Performance metrics (Grounding & Hallucinations)...',
      'Auditing Computational Costs & Routing budgets...',
      'Scanning for PII & Security compliance...',
      'Applying decision policies...'
    ];

    try {
      // Begin backend submission immediately
      const apiPromise = api.submitPlayground(prompt, model, temperature);

      // Simulate step-by-step progress animation
      for (let i = 0; i < stages.length; i++) {
        setAnimationStage(i);
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      const response = await apiPromise;
      setResult(response);
    } catch (err: any) {
      alert(`Interception pipeline failed: ${err.message}`);
    } finally {
      setLoading(false);
      setAnimationStage(-1);
      onFeedbackSubmitted(); // Trigger dashboard refresh
    }
  };

  const handleFeedbackSubmit = async (isUseful: boolean) => {
    if (!result) return;
    setFeedbackUseful(isUseful);
    
    try {
      const type = isUseful ? 'correct_decision' : 'false_positive';
      await api.submitFeedback(result.id, isUseful, type, feedbackComments || 'Submitted via playground');
      setFeedbackSubmitted(true);
      onFeedbackSubmitted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Input Prompt Settings & Scenarios */}
      <div class="lg:col-span-5 space-y-6">
        
        {/* Scenario Presets */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Simulate Risk Scenarios</h3>
            <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Demo Presets</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            {scenarios.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(s)}
                class={`p-3 text-left border rounded-lg text-xs font-semibold transition-all duration-200 ${
                  prompt === s.prompt 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div class="flex items-center justify-between">
                  <span>{s.label}</span>
                  <ChevronRight class="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Form */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings class="h-4.5 w-4.5 text-slate-400" />
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Gateway Configuration</h3>
          </div>

          {/* Prompt */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500">Query Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              class="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium bg-slate-50/20"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Model */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500">Target Model Routing</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              class="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white font-medium"
            >
              <option value="mock-gpt-4o">GPT-4o (ControlPlane Mock)</option>
              <option value="mock-claude-3-5-sonnet">Claude 3.5 Sonnet (ControlPlane Mock)</option>
              <option value="mock-llama-3-8b-instruct">Llama 3.1 8B (ControlPlane Mock)</option>
              <option value="gpt-4o-mini">Real OpenAI GPT-4o Mini (Requires Key)</option>
            </select>
          </div>

          {/* Temperature */}
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs text-slate-500">
              <span class="font-semibold">Temperature</span>
              <span class="font-bold text-slate-700">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              class="w-full accent-blue-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
            />
          </div>

          <button
            onClick={runInterceptionPipeline}
            disabled={loading || !prompt.trim()}
            class={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              loading || !prompt.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/10'
            }`}
          >
            <Send class="h-4 w-4" />
            Evaluate Transaction
          </button>
        </div>

      </div>

      {/* Right Column: Execution Pipeline or Results */}
      <div class="lg:col-span-7 flex flex-col min-h-[500px]">
        
        {/* Loading Interception Pipeline Animation */}
        {loading && (
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex-grow flex flex-col justify-center space-y-6">
            <h3 class="text-sm font-bold text-slate-800 text-center uppercase tracking-wider">
              ControlPlane Gatekeeper Intercept
            </h3>
            
            <div class="max-w-md mx-auto w-full space-y-4">
              {[
                'Initialize Sandbox Gateway',
                'Route to AI Model Engine',
                'Inspect Performance Metrics',
                'Evaluate Spend & Token Cost Limit',
                'Scan for Compliance & PII',
                'Compute Decision Engine Policy'
              ].map((stageLabel, idx) => {
                const isPassed = animationStage > idx;
                const isCurrent = animationStage === idx;
                return (
                  <div 
                    key={idx} 
                    class={`flex items-center gap-3.5 p-3 rounded-lg border transition-all duration-300 ${
                      isPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-semibold' :
                      isCurrent ? 'bg-blue-50 border-blue-100 text-blue-700 font-bold shadow-sm animate-pulse' :
                      'bg-slate-50/50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div class="shrink-0">
                      {isPassed ? (
                        <div class="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                      ) : isCurrent ? (
                        <div class="h-4.5 w-4.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      ) : (
                        <div class="h-4.5 w-4.5 rounded-full border border-slate-200 bg-white"></div>
                      )}
                    </div>
                    <span class="text-xs">{stageLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && (
          <div class="bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-200 flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
            <div class="h-12 w-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
              <Activity class="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700">Governance Gateway Standby</p>
              <p class="text-xs text-slate-400 mt-1 max-w-sm">
                Select a risk scenario preset on the left or enter a custom prompt, then submit to watch ControlPlane's real-time interception pipeline.
              </p>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {!loading && result && (
          <div class="space-y-6 flex-grow flex flex-col justify-between">
            
            {/* Split Panel: Response & Analysis */}
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow items-stretch">
              
              {/* Output Response */}
              <div class="md:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
                  <Terminal class="h-4 w-4 text-slate-400" />
                  <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Sanitized AI Response</h3>
                </div>
                <div class="p-6 flex-grow overflow-y-auto text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap select-all">
                  {result.response_final}
                </div>
              </div>

              {/* ControlPlane Realtime Inspector Panel */}
              <div class="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                    <Sparkles class="h-4.5 w-4.5 text-blue-500" />
                    <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">Inspector Assessment</h3>
                  </div>

                  {/* Decision Banner */}
                  <div class={`p-5 text-center border-b ${
                    result.decision === 'ALLOW' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                    result.decision === 'EDIT' ? 'bg-amber-50/50 border-amber-100 text-amber-800' :
                    result.decision === 'BLOCK' ? 'bg-rose-50/50 border-rose-100 text-rose-800' :
                    'bg-purple-50/50 border-purple-100 text-purple-800'
                  }`}>
                    <span class="block text-[10px] uppercase font-extrabold tracking-widest text-slate-400 mb-1">Decision Action</span>
                    <span class="text-3xl font-extrabold flex items-center justify-center gap-1.5">
                      {result.decision === 'ALLOW' ? '✓ ALLOW' :
                       result.decision === 'EDIT' ? '⚠ EDIT' :
                       result.decision === 'BLOCK' ? '🛑 BLOCK' :
                       '🟪 ESCALATE'}
                    </span>
                    <p class="text-[11px] font-medium leading-normal mt-2 max-w-xs mx-auto">
                      {result.reason}
                    </p>
                  </div>

                  {/* Telemetry Scores */}
                  <div class="p-5 space-y-4">
                    
                    {/* Performance */}
                    <div>
                      <div class="flex justify-between text-xs text-slate-600 mb-1">
                        <span class="font-semibold">Performance Score</span>
                        <span class="font-bold text-slate-900">{Math.round(result.perf_score * 100)}%</span>
                      </div>
                      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class={`h-full rounded-full ${result.perf_score >= 0.70 ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${result.perf_score * 100}%` }}></div>
                      </div>
                      {result.perf_hallucination >= 0.50 && (
                        <span class="text-[10px] text-amber-600 font-bold block mt-1">⚠ High hallucination risk</span>
                      )}
                    </div>

                    {/* Cost */}
                    <div class="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                      <div>
                        <span class="font-semibold text-slate-600 block">Cost USD</span>
                        <span class="text-[10px] text-slate-400">{result.cost_total_tokens} tokens</span>
                      </div>
                      <span class="font-bold text-slate-900 font-mono">${result.cost_usd.toFixed(6)}</span>
                    </div>

                    {/* Responsibility */}
                    <div class="border-t border-slate-100 pt-4">
                      <div class="flex justify-between text-xs text-slate-600 mb-1">
                        <span class="font-semibold">Responsibility Rating</span>
                        <span class="font-bold text-slate-900">{Math.round(result.resp_score * 100)}%</span>
                      </div>
                      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class={`h-full rounded-full ${result.resp_score >= 0.80 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${result.resp_score * 100}%` }}></div>
                      </div>
                      {result.resp_pii_detected === 1 && (
                        <span class="text-[10px] text-purple-600 font-bold block mt-1">✓ Privacy Shield: PII detected</span>
                      )}
                    </div>

                  </div>
                </div>

                {/* Inspect Details Link */}
                <div class="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedRequestId(result.id);
                      setCurrentPage('inspector');
                    }}
                    class="w-full bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye class="h-4 w-4" />
                    Open Deep Packet Trace
                  </button>
                </div>

              </div>

            </div>

            {/* Feedback Loop Selector */}
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-center sm:text-left">
                <h4 class="text-sm font-bold text-slate-800">Feedback Loop Calibration</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Was this decision correct based on active policies?</p>
              </div>

              {!feedbackSubmitted ? (
                <div class="flex items-center gap-3">
                  <button
                    onClick={() => handleFeedbackSubmit(true)}
                    class="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ThumbsUp class="h-4 w-4" />
                    Correct Decision
                  </button>
                  <button
                    onClick={() => handleFeedbackSubmit(false)}
                    class="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ThumbsDown class="h-4 w-4" />
                    Flag Error
                  </button>
                </div>
              ) : (
                <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-lg border border-emerald-100">
                  <ShieldCheck class="h-4.5 w-4.5" />
                  Telemetry logged to learning loop. Thank you!
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
