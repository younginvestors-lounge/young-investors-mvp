"use client"
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. STATE MANAGEMENT ---
  const [passedQuiz, setPassedQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Initialize prices to prevent "undefined" errors on first render
  const [prices, setPrices] = useState({ sasol: 152.40, capitec: 2105.00 });
  
  // Ensure logs are typed correctly for the audit trail
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString('en-GB'), msg: "TERMINAL_SYSTEM_ONLINE", type: 'success' }
  ]);
  
  // Voting Engine State
  const [activeVote, setActiveVote] = useState({
    active: true,
    asset: "SASOL",
    type: "BUY",
    amount: "R2,500",
    votes: 2,
    totalNeeded: 3,
    voted: false
  });

  // Regulatory Context
  const kitchenStyle = searchParams.get('style') || 'hedge';
  const kitchenName = searchParams.get('name') || "The Boys' Kitchen";
  const userLevel = "Sous-Chef Lvl 1"; // Hardcoded for MVP A+ demo

  // --- 2. JSE SIMULATOR (Audit-Grade) ---
  useEffect(() => {
    if (!passedQuiz) return;
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));
      
      // Randomly inject system health checks into the feed
      if (Math.random() > 0.8) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setLogs(prev => [{ 
          id: Date.now(), 
          time, 
          msg: "JSE_MARKET_DATA_SYNC_VERIFIED", 
          type: 'info' 
        }, ...prev].slice(0, 8));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [passedQuiz]);

  const questions = [
    { title: "Risk Awareness", q: "Do you understand that JSE investments carry risk and your capital is not guaranteed?", btn: "I UNDERSTAND THE RISK" },
    { title: "Governance Quorum", q: "A trade only executes if the 3/5 majority (60%) is reached. Do you accept this?", btn: "I ACCEPT THE GOVERNANCE" },
    { title: "Compliance", q: "Will you strictly abide by your chosen Kitchen's trading limits and Asset Universe?", btn: "I AGREE TO COMPLY" }
  ];

  // --- 3. THE QUIZ GATE (Pre-Rendering Protection) ---
  if (!passedQuiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans select-none">
        <div className="max-w-xl w-full precision-card p-10 bg-[#00FF41]/5 border border-[#00FF41]/30 rounded-lg shadow-[0_0_50px_-12px_rgba(0,255,65,0.2)]">
          <div className="flex justify-between items-center mb-10">
             <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 w-12 rounded-full transition-all duration-500 ${i <= quizStep ? 'bg-[#00FF41]' : 'bg-zinc-800'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-[0.2em]">Step {quizStep + 1}_of_3</span>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{questions[quizStep].title}</h3>
          <p className="text-3xl font-[900] uppercase tracking-tighter leading-none mb-10 text-white">{questions[quizStep].q}</p>
          <button 
            onClick={() => quizStep < 2 ? setQuizStep(quizStep + 1) : setPassedQuiz(true)} 
            className="w-full py-5 bg-[#00FF41] text-black font-black text-xs uppercase tracking-widest rounded-sm hover:bg-white transition-all active:scale-[0.98]"
          >
            {questions[quizStep].btn}
          </button>
        </div>
      </div>
    );
  }

  // --- 4. MASTER DASHBOARD (Consolidated Elements) ---
  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans animate-in fade-in duration-700">
      {/* HEADER: Identity & Navigation */}
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-[900] uppercase tracking-tighter">Young Investors</span>
          <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-1">Terminal_v1.0.4</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-[#00FF41] text-black px-3 py-1.5 text-[9px] font-black uppercase rounded-sm shadow-[0_0_15px_-3px_rgba(0,255,65,0.4)]">
            {userLevel}
          </div>
          <button 
            onClick={() => setShowLogoutModal(true)} 
            className="text-zinc-500 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-500/20 px-3 py-1.5 rounded"
          >
            Logout_System
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-10">
        {/* LEFT COLUMN: Market Data & Voting */}
        <div className="col-span-12 lg:col-span-8">
          <header className="mb-12">
            <h1 className="text-6xl font-[900] uppercase tracking-tighter mb-2">{kitchenName}</h1>
            <div className="flex items-center gap-2 text-[#00FF41] text-[10px] font-black tracking-[0.3em] uppercase">
              <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" />
              Governance_Certified_Session_Active
            </div>
          </header>

          {/* JSE LIVE FEED GRID */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-xl hover:border-[#00FF41]/20 transition-colors">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Sasol_JSE:SOL</span>
              <div className="text-4xl font-[900] tracking-tighter">R{prices.sasol.toFixed(2)}</div>
            </div>
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-xl hover:border-[#00FF41]/20 transition-colors">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Capitec_JSE:CPI</span>
              <div className="text-4xl font-[900] tracking-tighter">R{prices.capitec.toFixed(2)}</div>
            </div>
          </div>

          {/* VOTING ENGINE: The Democratic Core */}
          <section className="p-8 bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-xl mb-10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-[0.3em] mb-2 block">Live_Governance_Vote</span>
                <h2 className="text-3xl font-[900] uppercase tracking-tighter leading-none">
                  Action: {activeVote.type} {activeVote.asset} @ {activeVote.amount}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Quorum_Progress</span>
                <div className="text-2xl font-[900] text-white leading-none mt-1">
                   {activeVote.votes} <span className="text-zinc-700">/</span> {activeVote.totalNeeded}
                </div>
              </div>
            </div>
            {!activeVote.voted ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveVote({...activeVote, voted: true, votes: activeVote.votes + 1})} 
                  className="flex-1 py-5 bg-[#00FF41] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all active:scale-95"
                >
                  Approve Trade
                </button>
                <button className="flex-1 py-5 bg-zinc-900 text-white font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all active:scale-95">
                  Veto
                </button>
              </div>
            ) : (
              <div className="py-5 text-center border border-[#00FF41]/30 bg-[#00FF41]/10 text-[#00FF41] text-[10px] font-black uppercase tracking-[0.4em] rounded animate-pulse">
                Your_Vote_Registered. Awaiting_Consensus...
              </div>
            )}
          </section>

          {/* AUDIT TRAIL: System Logs */}
          <div className="bg-zinc-950 border border-white/5 p-8 rounded-xl font-mono text-[10px]">
            <span className="text-zinc-600 uppercase font-black mb-6 block tracking-widest border-b border-white/5 pb-2">System_Audit_Trail (SARB_Compliant)</span>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex gap-6 items-center opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-zinc-700 font-bold w-16">[{log.time}]</span>
                  <span className="text-[#00FF41] font-medium tracking-tight">{log.msg}</span>
                  <span className="ml-auto text-zinc-800 font-black">LOG_ID: {log.id.toString().slice(-4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar & Regulatory Seals */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* KITCHEN CONSTITUTION */}
          <div className="p-8 bg-zinc-950 border border-white/10 rounded-xl">
            <h3 className="text-[11px] font-black uppercase text-[#00FF41] mb-6 tracking-widest border-b border-white/5 pb-2">Kitchen_Constitution</h3>
            <div className="space-y-5 text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase font-bold">Trading Style</span>
                <span className="font-black uppercase text-white">{kitchenStyle === 'mutual' ? 'Slow_Cook' : 'Hedge_Fund'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase font-bold">Min. Quorum</span>
                <span className="font-black uppercase text-white">{kitchenStyle === 'mutual' ? '80% (4/5)' : '60% (3/5)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase font-bold">Exposure Limit</span>
                <span className="font-black uppercase text-white">R15,000.00</span>
              </div>
            </div>
          </div>

          {/* A+ REGULATORY SEAL (FIC/SARB) */}
          <div className="p-8 bg-zinc-950 border border-red-500/20 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 border-4 border-red-500 rotate-45" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              <h3 className="text-[11px] font-black uppercase text-red-600 tracking-widest">Compliance_Gate</h3>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase font-bold">FICA_Status</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm font-black uppercase text-[8px] animate-pulse">REQUIRED</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase font-bold">Data_Ledger</span>
                <span className="text-[#00FF41] font-black uppercase">AES_256_ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase font-bold">Audit_ID</span>
                <span className="text-zinc-400 font-mono">YI-ZAR-782</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/verify')} 
              className="w-full py-4 bg-red-600/10 border border-red-600/40 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all rounded-sm active:scale-[0.97]"
            >
              Verify_Identity_For_Trading
            </button>
          </div>
        </aside>
      </main>

      {/* SECURE LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 p-10 rounded-2xl max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-12 h-1 bg-red-600 mb-6 mx-auto" />
            <h3 className="text-2xl font-[900] uppercase tracking-tighter mb-2 text-center">Confirm_Exit</h3>
            <p className="text-zinc-500 text-[10px] font-bold mb-10 uppercase tracking-widest leading-relaxed text-center">
              Logging out will terminate your real-time JSE sync and pause governance participation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="py-4 bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-all border border-white/5"
              >
                Return
              </button>
              <button 
                onClick={() => router.push('/')} 
                className="py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
              >
                Log_Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Global wrapper for Next.js Suspense compatibility
export default function Dashboard() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center font-black text-[#00FF41]">INITIALIZING_AUDIT_LOGS...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
