import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { RequestDetails as DetailsType } from '../services/api';
import { 
  ArrowLeft, 
  Terminal, 
  Cpu, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronRight,
  Database,
  User
} from 'lucide-react';

interface RequestDetailsProps {
  requestId: string;
  onBack: () => void;
  onFeedbackSubmitted: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ 
  requestId, 
  onBack,
  onFeedbackSubmitted
}) => {
  const [record, setRecord] = useState<DetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback states
  const [feedbackUseful, setFeedbackUseful] = useState<boolean | null>(null);
  const [feedbackType, setFeedbackType] = useState('correct_decision');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      try {
        setLoading(true);
        const data = await api.getRequestDetails(requestId);
        setRecord(data);
        
        // Pre-fill existing feedback if present
        if (data.feedback && data.feedback.length > 0) {
          const firstFb = data.feedback[0];
          setFeedbackUseful(firstFb.is_useful === 1);
          setFeedbackType(firstFb.feedback_type);
          setFeedbackComments(firstFb.comments);
          setFeedbackSaved(true);
        }
      } catch (err) {
        console.error('Failed to load request details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [requestId]);

  const handleFeedbackSubmit = async () => {
    if (feedbackUseful === null) return;

    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(requestId, feedbackUseful, feedbackType, feedbackComments);
      setFeedbackSaved(true);
      onFeedbackSubmitted(); // Trigger statistics refresh
    } catch (err) {
      console.error(err);
      alert('Failed to save feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading || !record) {
    return (
      <div class="h-[60vh] flex items-center justify-center flex-col gap-4">
        <span class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></span>
        <p class="text-sm text-slate-500 font-medium">Opening trace payload...</p>
      </div>
    );
  }

  return (
    <div class="space-y-8">
      {/* Header breadcrumb */}
      <div class="flex items-center gap-3">
        <button
          onClick={onBack}
          class="p-2 hover:bg-slate-200 rounded-lg border border-slate-200 bg-white transition-colors duration-150"
        >
          <ArrowLeft class="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            Transaction Inspector
          </h2>
          <p class="text-[10px] text-slate-400 font-mono tracking-wider">PAYLOAD ID: {record.id}</p>
        </div>
      </div>

      {/* Main Metadata Grid */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Timestamp</span>
          <span class="text-xs font-semibold text-slate-700 leading-tight mt-1 block">
            {new Date(record.timestamp).toLocaleString()}
          </span>
        </div>

        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Model Routing</span>
          <span class="text-xs font-semibold text-slate-700 leading-tight mt-1 block">
            {record.model} ({record.provider})
          </span>
        </div>

        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Interception Latency</span>
          <span class="text-xs font-semibold text-slate-700 leading-tight mt-1 block flex items-center gap-1">
            <Clock class="h-3.5 w-3.5 text-blue-500" />
            {record.latency_ms} ms
          </span>
        </div>

        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cost Audit</span>
          <span class="text-xs font-semibold text-slate-700 leading-tight mt-1 block font-mono">
            ${record.cost_usd.toFixed(6)}
          </span>
        </div>

      </div>

      {/* Large Decision Card */}
      <div class={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm ${
        record.decision === 'ALLOW' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
        record.decision === 'EDIT' ? 'bg-amber-50 border-amber-100 text-amber-800' :
        record.decision === 'BLOCK' ? 'bg-rose-50 border-rose-100 text-rose-800' :
        'bg-purple-50 border-purple-100 text-purple-800'
      }`}>
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Final Policy Decision</span>
          <h3 class="text-3xl font-extrabold flex items-center gap-2">
            {record.decision === 'ALLOW' ? '🟢 ALLOW' :
             record.decision === 'EDIT' ? '🟡 EDIT' :
             record.decision === 'BLOCK' ? '🔴 BLOCK' :
             '🟣 ESCALATE'}
          </h3>
          <p class="text-xs font-semibold max-w-2xl mt-1 leading-normal">
            {record.reason}
          </p>
        </div>

        {record.escalation_reason && (
          <div class="bg-white/80 p-3 rounded-lg border border-purple-200 text-purple-900 text-xs shrink-0 font-medium">
            <span class="block font-bold text-[10px] uppercase tracking-wider text-purple-500">Escalation Alert</span>
            {record.escalation_reason}
          </div>
        )}
      </div>

      {/* Split Row: Prompt & Responses side-by-side */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Prompt & Raw */}
        <div class="lg:col-span-6 space-y-6">
          
          {/* Prompt */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <User class="h-4 w-4 text-slate-400" />
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">User Input (Prompt)</h4>
            </div>
            <div class="p-5 text-slate-700 text-xs font-medium bg-slate-50/10 whitespace-pre-wrap leading-relaxed select-all">
              {record.prompt}
            </div>
          </div>

          {/* Raw Response */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Database class="h-4 w-4 text-slate-400" />
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">LLM Raw Response Output</h4>
            </div>
            <div class="p-5 text-slate-600 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
              {record.response_raw}
            </div>
          </div>

        </div>

        {/* Right Side: Final sanitized response */}
        <div class="lg:col-span-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
              <Terminal class="h-4 w-4 text-slate-400" />
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">ControlPlane Sanitized Response Output</h4>
            </div>
            <div class="p-6 flex-grow overflow-y-auto text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
              {record.response_final}
            </div>
          </div>
        </div>

      </div>

      {/* Tri-dimensional Telemetry Details Gauges */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Performance Inspector */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Cpu class="h-4.5 w-4.5 text-blue-500" />
            Performance Evaluation
          </h4>
          <div class="space-y-3.5">
            <div>
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>Confidence Index</span>
                <span class="font-bold text-slate-800">{Math.round(record.perf_score * 100)}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 rounded-full" style={{ width: `${record.perf_score * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>Hallucination Risk</span>
                <span class="font-bold text-slate-800">{Math.round(record.perf_hallucination * 100)}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500 rounded-full" style={{ width: `${record.perf_hallucination * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>Relevance Score</span>
                <span class="font-bold text-slate-800">{Math.round(record.perf_relevance * 100)}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-slate-500 rounded-full" style={{ width: `${record.perf_relevance * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>Grounding score</span>
                <span class="font-bold text-slate-800">{Math.round(record.perf_grounding * 100)}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-slate-500 rounded-full" style={{ width: `${record.perf_grounding * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Auditor */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <DollarSign class="h-4.5 w-4.5 text-emerald-500" />
            Cost & Budget Analytics
          </h4>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500">Estimated Cost</span>
              <span class="font-mono font-bold text-slate-800 text-sm">${record.cost_usd.toFixed(6)}</span>
            </div>
            <div class="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span class="text-slate-500">Input (Prompt) Tokens</span>
              <span class="font-semibold text-slate-800">{record.cost_input_tokens} tokens</span>
            </div>
            <div class="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span class="text-slate-500">Output (Response) Tokens</span>
              <span class="font-semibold text-slate-800">{record.cost_output_tokens} tokens</span>
            </div>
            <div class="border-t border-slate-100 pt-3 flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-150">
              <span class="text-slate-600 font-bold">Total Tokens</span>
              <span class="font-bold text-slate-800">{record.cost_total_tokens} tokens</span>
            </div>
          </div>
        </div>

        {/* Responsibility Inspector */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <ShieldAlert class="h-4.5 w-4.5 text-purple-500" />
            Responsibility & Compliance
          </h4>
          <div class="space-y-3.5">
            <div>
              <div class="flex justify-between text-xs text-slate-500 mb-1">
                <span>Compliance Score</span>
                <span class="font-bold text-slate-800">{Math.round(record.resp_score * 100)}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class={`h-full rounded-full ${record.resp_score >= 0.85 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${record.resp_score * 100}%` }}></div>
              </div>
            </div>
            
            <div class="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">PII Detected</span>
                <span class={`font-bold px-2 py-0.5 rounded text-[10px] ${record.resp_pii_detected === 1 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                  {record.resp_pii_detected === 1 ? 'YES' : 'NO'}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Safety Risk Index</span>
                <span class="font-bold text-slate-800">{Math.round(record.resp_safety_risk * 100)}%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Toxicity Index</span>
                <span class="font-bold text-slate-800">{Math.round(record.resp_toxicity * 100)}%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">System Bias Index</span>
                <span class="font-bold text-slate-800">{Math.round(record.resp_bias_risk * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Learning feedback loop calibration block */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <h4 class="font-bold text-slate-800 text-sm">Feedback Loop Calibration</h4>
          <p class="text-xs text-slate-400 mt-1">
            Analyze whether the checker engine correctly executed policies on this interaction, submitting tags back to training caches.
          </p>
        </div>

        {feedbackSaved ? (
          <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldCheck class="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
            Audit logged. Policy calibration cached: <span class="font-bold uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">{feedbackType.replace('_', ' ')}</span>
            {feedbackComments && <span class="text-slate-500 block mt-1 italic">"{feedbackComments}"</span>}
          </div>
        ) : (
          <div class="space-y-4">
            
            <div class="flex items-center gap-3">
              <button
                onClick={() => setFeedbackUseful(true)}
                class={`p-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  feedbackUseful === true
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp class="h-4 w-4" />
                Correct Decision
              </button>
              
              <button
                onClick={() => setFeedbackUseful(false)}
                class={`p-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  feedbackUseful === false
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown class="h-4 w-4" />
                Flag False Action
              </button>
            </div>

            {feedbackUseful !== null && (
              <div class="space-y-4 animate-fadeIn">
                
                {/* Calibration Type */}
                <div class="max-w-xs space-y-1.5">
                  <label class="text-[11px] font-semibold text-slate-500">Calibration Tag</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    class="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold bg-white"
                  >
                    {feedbackUseful ? (
                      <>
                        <option value="correct_decision">Correct Intercept</option>
                        <option value="policy_improvement">Policy Alignment Confirmed</option>
                      </>
                    ) : (
                      <>
                        <option value="false_positive">False Positive (Unnecessary intervention)</option>
                        <option value="false_negative">False Negative (Missed violation)</option>
                        <option value="needs_review">Unclear policy mismatch</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Comments */}
                <div class="space-y-1.5">
                  <label class="text-[11px] font-semibold text-slate-500">Operator Review Comments (Optional)</label>
                  <textarea
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    rows={2}
                    class="w-full border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="Provide comments regarding policy matching adjustments..."
                  />
                </div>

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  {submittingFeedback ? 'Caching...' : 'Submit Calibration Data'}
                </button>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
