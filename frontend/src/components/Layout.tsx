import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  TrendingUp, 
  Sliders, 
  History, 
  ShieldAlert, 
  Activity, 
  Home,
  AlertCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onRunDemo: () => void;
  isDemoRunning: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  setCurrentPage, 
  onRunDemo,
  isDemoRunning 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
    { id: 'playground', label: 'Playground', icon: Terminal },
    { id: 'observability', label: 'Observability', icon: TrendingUp },
    { id: 'policies', label: 'Policies', icon: Sliders },
    { id: 'audit', label: 'Audit Log', icon: History }
  ];

  return (
    <div class="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl shrink-0">
        {/* Brand */}
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20">
            CP
          </div>
          <div>
            <h1 class="text-white font-bold text-lg leading-tight tracking-wide">ControlPlane<span class="text-blue-500 font-normal">.ai</span></h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">AI Governance Layer</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav class="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon class={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Demo Callout */}
        <div class="p-4 border-t border-slate-800 bg-slate-950/40">
          <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
            <h3 class="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
              <ShieldAlert class="h-4.5 w-4.5 text-amber-500" />
              Demo / Sandbox Mode
            </h3>
            <p class="text-[11px] text-slate-400 leading-relaxed mb-3">
              Trigger a structured simulation to evaluate 6 distinct threat vectors and verify response actions.
            </p>
            <button
              onClick={onRunDemo}
              disabled={isDemoRunning}
              class={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                isDemoRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10'
              }`}
            >
              {isDemoRunning ? (
                <>
                  <span class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                  Simulating...
                </>
              ) : (
                'Run Demo Sequence'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div class="p-6 border-t border-slate-800 flex items-center gap-3">
          <button 
            onClick={() => setCurrentPage('home')}
            class="flex items-center gap-2 hover:text-white transition-colors duration-150 text-xs font-medium text-slate-400"
          >
            <Home class="h-4 w-4" />
            Landing Page
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div class="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-slate-800 uppercase tracking-wider text-xs">
              {currentPage === 'dashboard' ? 'Governance Dashboard' : 
               currentPage === 'playground' ? 'Live Testing Playground' :
               currentPage === 'observability' ? 'Observability Analytics' :
               currentPage === 'policies' ? 'Policy Orchestration' :
               currentPage === 'audit' ? 'Audit Log Explorer' : 
               currentPage === 'inspector' ? 'Request Packet Inspector' : 'System Home'}
            </h2>
          </div>
          
          <div class="flex items-center gap-6">
            {/* Status indicators */}
            <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Gateway Active</span>
              </div>
              <div class="h-4 w-px bg-slate-200"></div>
              <div class="flex items-center gap-1.5">
                <Activity class="h-4 w-4 text-indigo-500" />
                <span>Governance: Active</span>
              </div>
            </div>

            {/* Profile */}
            <div class="flex items-center gap-2.5 pl-4 border-l border-slate-200">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                OP
              </div>
              <div class="text-left hidden md:block">
                <p class="text-xs font-semibold text-slate-700">Enterprise Operator</p>
                <p class="text-[10px] text-slate-400 leading-none">Admin console</p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main class="flex-grow p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
