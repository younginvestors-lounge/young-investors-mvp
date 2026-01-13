"use client"
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [passedQuiz, setPassedQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Simulation Data (Missing in your snippet)
  const [prices, setPrices] = useState({ sasol: 152.40, capitec: 2105.00 });
  const [logs, setLogs] = useState([{ id: 1, time: "10:00:00", msg: "TERMINAL_READY", type: 'info' }]);
  
  // User/Kitchen Context
  const kitchenStyle = searchParams.get('style') || 'hedge';
  const kitchenName = "The Boys' Kitchen";
  const userLevel = 1;

  // --- JSE LIVE FEED SIMULATOR ---
  useEffect(() => {
    if (!passedQuiz) return; // Only run simulator once passed

    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));

      if (Math.random() > 0.85) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const events = ["VOLATILITY_SYNC_OK", "JSE_API_HEARTBEAT", "LIQUIDITY_CHECK_PASSED"];
        const randomMsg = events[Math.floor(Math.random() * events.length)];
        
        setLogs(prev => [{ 
          id: Date.now(), 
          time, 
          msg: randomMsg, 
          type: 'info' 
        }, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [passedQuiz]);

  // --- QUESTIONS DATA ---
  const questions = [
    { title: "Risk Awareness", q: "Do you understand that JSE investments carry risk and your capital is not guaranteed?", btn: "I UNDERSTAND THE RISK" },
    { title: "Governance Quorum", q: "A trade only executes if the 3/5 majority (60%) is reached. Do you accept this collective rule?", btn: "I ACCEPT THE GOVERNANCE" },
    { title: "Mandate Compliance", q: "Will you strictly abide by your chosen Kitchen's Asset Universe and trading limits?", btn: "I AGREE TO THE CONSTITUTION" }
  ];

  // --- UX LOGIC: CONDITIONAL RENDERING ---
  
  // 1. SHOW QUIZ FIRST
  if (!passedQuiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full precision-card p-10 bg-[#00FF41]/5 border border-[#00FF41]/30 rounded-lg">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 w-12 rounded-full ${i <= quizStep ? 'bg-[#00FF41]' : 'bg-zinc-800'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-[0.2em]">Step {quizStep + 1}_of_3</span>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{questions[quizStep].title}</h3>
          <p className="text-3xl font-[900] uppercase tracking-tighter leading-none mb-8">
            {questions[quizStep].q}
          </p>
          <button 
            onClick={() => {
              if (quizStep < 2) setQuizStep(quizStep + 1);
              else setPassedQuiz(true);
            }}
            className="w-full py-5 bg-[#00FF41] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all rounded-sm"
          >
            {questions[quizStep].btn}
          </button>
        </div>
      </div>
    );
  }

  // 2. SHOW FULL DASHBOARD AFTER QUIZ
  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans animate-in fade-in duration-1000">
      {/* NAV */}
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col leading-none cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Young</span>
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Investors</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/create-kitchen')} className="text-zinc-500 hover:text-white text-[10px] font-[900] uppercase tracking-widest transition-colors">
            ← Exit Kitchen
          </button>
          <div className={`px-4 py-2 rounded-sm text-[10px] font-[900] uppercase tracking-tighter ${userLevel >= 2 ? 'bg-[#00FF41] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {userLevel === 1 ? 'Apprentice' : 'Sous-Chef'}
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="text-zinc-500 hover:text-red-500 text-[10px] font-[900] uppercase tracking-widest transition-colors">
            Log Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-8">
            <h1 className="text-4xl font-[900] uppercase tracking-tighter mb-2">{kitchenName}</h1>
            <div className="flex items-center gap-2 text-[#00FF41] text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
              Governance_Certified_Session_Active
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
              <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-2">Sasol Ltd</div>
              <div className="text-3xl font-[900] tracking-tighter">R{prices.sasol.toFixed(2)}</div>
            </div>
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
              <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-2">Capitec Bank</div>
              <div className="text-3xl font-[900] tracking-tighter">R{prices.capitec.toFixed(2)}</div>
            </div>
          </div>

          {/* EXCHANGE FEED LOGS */}
          <div className="bg-zinc-950 border border-white/10 rounded-lg p-6 font-mono text-xs">
            <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-4">Live_System_Logs</div>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-zinc-600">[{log.time}]</span>
                  <span className={log.type === 'info' ? 'text-[#00FF41]' : 'text-zinc-300'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4">
          <div className="precision-card p-6 bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-[900] uppercase tracking-widest text-[#00FF41]">Active_Constitution</h3>
              <span className="text-[8px] bg-[#00FF41] text-black px-2 py-0.5 font-black rounded-sm uppercase">{kitchenStyle === 'mutual' ? 'Slow_Cook' : 'Hedge_Fund'}</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-zinc-400">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Min. Approval Quorum</span>
                <span className="text-white">{kitchenStyle === 'mutual' ? '80% (4/5)' : '60% (3/5)'}</span>
              </li>
              <li className="flex justify-between">
                <span>Asset Universe</span>
                <span className="text-white">JSE_TOP_40 + TECH</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 p-8 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-[900] uppercase tracking-tighter mb-2">Confirm Exit</h3>
            <p className="text-zinc-500 text-xs font-medium mb-8">Are you sure you want to log out of your session?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-zinc-900 text-white font-[900] text-[10px] uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={() => router.push('/')} className="flex-1 py-3 bg-white text-black font-[900] text-[10px] uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-colors">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#00FF41] font-[900]">INITIALIZING_TERMINAL...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
