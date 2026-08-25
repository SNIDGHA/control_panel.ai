import { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Playground } from './pages/Playground';
import { Observability } from './pages/Observability';
import { Policies } from './pages/Policies';
import { AuditLog } from './pages/AuditLog';
import { RequestDetails } from './pages/RequestDetails';
import { api } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [demoBanner, setDemoBanner] = useState(false);

  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    setDemoBanner(false);
    
    // Auto launch dashboard if not already there, to let user see change
    setCurrentPage('dashboard');

    try {
      // Small artificial delay to build anticipation
      await new Promise(resolve => setTimeout(resolve, 800));
      await api.runDemoSequence();
      
      // Update statistics trigger
      setRefreshTrigger(prev => prev + 1);
      setDemoBanner(true);
      
      // Clear banner after 5 seconds
      setTimeout(() => {
        setDemoBanner(false);
      }, 5000);
    } catch (err) {
      console.error('Demo simulation error:', err);
      alert('Failed to execute simulation sequence.');
    } finally {
      setIsDemoRunning(false);
    }
  };

  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 1. If we are on the Home page, render without the dashboard sidebar
  if (currentPage === 'home') {
    return (
      <Home 
        onLaunch={() => setCurrentPage('dashboard')} 
        onRunDemo={handleRunDemo} 
      />
    );
  }

  // 2. Otherwise render page nested inside Dashboard Layout
  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      onRunDemo={handleRunDemo}
      isDemoRunning={isDemoRunning}
    >
      {/* Demo Completion Toast Banner */}
      {demoBanner && (
        <div className="mb-6 bg-indigo-600 text-white px-5 py-4 rounded-xl shadow-lg flex items-center justify-between border border-indigo-500 animate-fadeIn z-20">
          <div className="text-xs">
            <span className="font-bold block">✓ Threat Simulation Sequence Completed!</span>
            <span className="text-indigo-200">Added 6 distinct scenarios evaluating Performance, Cost, and Responsibility to the log.</span>
          </div>
          <button 
            onClick={() => setCurrentPage('audit')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider transition-colors shrink-0"
          >
            Inspect Audit Logs
          </button>
        </div>
      )}

      {/* Pages Switch Router */}
      {currentPage === 'dashboard' && (
        <Dashboard 
          setCurrentPage={setCurrentPage} 
          setSelectedRequestId={setSelectedRequestId}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentPage === 'playground' && (
        <Playground 
          onFeedbackSubmitted={forceRefresh}
          setCurrentPage={setCurrentPage}
          setSelectedRequestId={setSelectedRequestId}
        />
      )}

      {currentPage === 'observability' && (
        <Observability />
      )}

      {currentPage === 'policies' && (
        <Policies onPoliciesUpdated={forceRefresh} />
      )}

      {currentPage === 'audit' && (
        <AuditLog 
          setCurrentPage={setCurrentPage} 
          setSelectedRequestId={setSelectedRequestId}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentPage === 'inspector' && (
        <RequestDetails 
          requestId={selectedRequestId} 
          onBack={() => setCurrentPage('audit')} 
          onFeedbackSubmitted={forceRefresh}
        />
      )}
    </Layout>
  );
}

export default App;
