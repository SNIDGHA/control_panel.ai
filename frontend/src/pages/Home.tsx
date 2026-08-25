import React from 'react';
import { Shield, ShieldAlert, Cpu, DollarSign, ArrowRight, Activity, Terminal } from 'lucide-react';

interface HomeProps {
  onLaunch: () => void;
  onRunDemo: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLaunch, onRunDemo }) => {
  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center overflow-x-hidden font-sans dot-grid relative">
      
      {/* Background glow effects */}
      <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      {/* Header navbar */}
      <header class="w-full max-w-7xl px-8 h-20 flex items-center justify-between z-10">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20">
            CP
          </div>
          <div>
            <span class="text-white font-bold text-xl tracking-wide">ControlPlane<span class="text-blue-500 font-normal">.ai</span></span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button 
            onClick={onLaunch}
            class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            Launch Console
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section class="w-full max-w-5xl px-8 pt-20 pb-16 flex flex-col items-center text-center z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-slow">
          <Shield class="h-4 w-4" />
          Enterprise AI Governance & Safety
        </div>
        
        <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Every AI deployment carries risk. <br/>
          <span class="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ControlPlane catches it in real time.
          </span>
        </h1>
        
        <p class="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Continuous AI observability and policy interception across Performance, Cost, and Responsibility. Prevent hallucinations, budget leaks, and compliance violations automatically.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 z-20">
          <button
            onClick={onLaunch}
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-blue-500/20 group"
          >
            Launch Console
            <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onRunDemo}
            class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Terminal class="h-5 w-5 text-indigo-400" />
            Run Sandbox Simulation
          </button>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section class="w-full max-w-5xl px-8 py-16 z-10 flex flex-col items-center">
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500 text-center mb-8">How it works</h2>
        
        <div class="w-full bg-slate-900/60 rounded-2xl p-8 border border-slate-800/80 shadow-2xl relative backdrop-blur-sm">
          {/* Animated path visual */}
          <div class="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
            
            {/* Step 1: User */}
            <div class="flex flex-col items-center bg-slate-950 p-5 rounded-xl border border-slate-800 w-full md:w-1/5 shadow-lg text-center z-10">
              <span class="text-sm font-semibold text-slate-300">1. User Query</span>
              <p class="text-[10px] text-slate-500 mt-1">Prompt entered by user</p>
              <div class="bg-blue-950 text-blue-400 border border-blue-900 text-[11px] px-2 py-1 rounded mt-3 w-full truncate text-left">
                "Get details for user..."
              </div>
            </div>

            <div class="hidden md:block h-0.5 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>

            {/* Step 2: AI Model */}
            <div class="flex flex-col items-center bg-slate-950 p-5 rounded-xl border border-slate-800 w-full md:w-1/5 shadow-lg text-center z-10">
              <span class="text-sm font-semibold text-slate-300">2. LLM Engine</span>
              <p class="text-[10px] text-slate-500 mt-1">GPT-4 / Claude / Llama</p>
              <div class="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] px-2 py-1 rounded mt-3 w-full text-left leading-tight truncate">
                "Contact: Name: John..."
              </div>
            </div>

            <div class="hidden md:block h-0.5 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>

            {/* Step 3: ControlPlane Interceptor */}
            <div class="flex flex-col items-center bg-blue-950 p-5 rounded-xl border border-blue-800 w-full md:w-[28%] shadow-2xl shadow-blue-500/5 text-center relative z-10 scale-105 border-dashed">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                ControlPlane.ai
              </div>
              <span class="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                <Activity class="h-4.5 w-4.5 text-blue-400 animate-pulse" />
                Safety Inspector
              </span>
              <div class="grid grid-cols-3 gap-1.5 w-full mt-3">
                <div class="bg-slate-900 p-1.5 rounded border border-slate-800 text-[9px]">
                  <span class="block text-slate-500">Perf</span>
                  <span class="text-emerald-400 font-bold">96%</span>
                </div>
                <div class="bg-slate-900 p-1.5 rounded border border-slate-800 text-[9px]">
                  <span class="block text-slate-500">Cost</span>
                  <span class="text-emerald-400 font-bold">$0.01</span>
                </div>
                <div class="bg-slate-900 p-1.5 rounded border border-slate-800 text-[9px]">
                  <span class="block text-slate-500">Resp</span>
                  <span class="text-rose-400 font-bold">PII!</span>
                </div>
              </div>
            </div>

            <div class="hidden md:block h-0.5 w-8 bg-gradient-to-r from-purple-500 to-emerald-500 animate-pulse"></div>

            {/* Step 4: Actions */}
            <div class="flex flex-col items-center bg-slate-950 p-5 rounded-xl border border-slate-800 w-full md:w-1/5 shadow-lg text-center z-10">
              <span class="text-sm font-semibold text-slate-300">4. Decision Action</span>
              <p class="text-[10px] text-slate-500 mt-1">Adaptive redirection</p>
              <div class="grid grid-cols-2 gap-1 w-full mt-3 text-[9px] font-semibold">
                <div class="bg-emerald-950/40 text-emerald-400 border border-emerald-900 rounded p-1">ALLOW</div>
                <div class="bg-amber-950/40 text-amber-400 border border-amber-900 rounded p-1">EDIT</div>
                <div class="bg-rose-950/40 text-rose-400 border border-rose-900 rounded p-1">BLOCK</div>
                <div class="bg-purple-950/40 text-purple-400 border border-purple-900 rounded p-1">ESCALATE</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tri-dimensional Protection Cards */}
      <section class="w-full max-w-5xl px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        
        {/* Performance card */}
        <div class="bg-slate-900/40 rounded-xl p-8 border border-slate-800/80 shadow-lg">
          <div class="h-12 w-12 bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-400 border border-blue-800 mb-6">
            <Cpu class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Performance Monitoring</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Eliminate operational degradation. Automatically calculate answer confidence, detect high hallucination probability, evaluate grounding context, and score relevance.
          </p>
        </div>

        {/* Cost card */}
        <div class="bg-slate-900/40 rounded-xl p-8 border border-slate-800/80 shadow-lg">
          <div class="h-12 w-12 bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-800 mb-6">
            <DollarSign class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Cost & Model Guardrails</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Protect compute budgets. Set maximum cost quotas per request, track aggregate token usage, and automatically recommend model routing paths (e.g. from expensive to lighter frameworks).
          </p>
        </div>

        {/* Responsibility card */}
        <div class="bg-slate-900/40 rounded-xl p-8 border border-slate-800/80 shadow-lg">
          <div class="h-12 w-12 bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-400 border border-purple-800 mb-6">
            <ShieldAlert class="h-6 w-6" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Responsibility & PII</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Ensure security compliance. Automatically intercept credit cards, emails, SSNs, and phone numbers. Screen for content toxicity, harmful code patterns, and bias.
          </p>
        </div>

      </section>

      {/* Footer */}
      <footer class="w-full border-t border-slate-900 py-8 px-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs mt-auto max-w-7xl">
        <p>&copy; 2026 ControlPlane.ai. All rights reserved.</p>
        <p class="mt-2 md:mt-0 font-semibold tracking-wider uppercase text-[10px]">WATCH IT. CATCH IT. ACT ON IT.</p>
      </footer>

    </div>
  );
};
