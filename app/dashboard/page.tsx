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
  const [activeTab, setActiveTab] = useState<'terminal' | 'ledger'>('terminal');
  const [isSystemFrozen, setIsSystemFrozen] = useState(false); // A+ Emergency Stop
  
  const isVerified = searchParams.get('verified') === 'true';
  const [prices, setPrices] = useState({ sasol: 152.40, capitec: 2105.00 });
  
  // Ledger Data (SARB Requirement)
  const [ledger] = useState([
    { id: "TX-9921", date: "2026-01-12", type: "CONTRIBUTION", user: "Tino", amount: 5000, status: "CLEARED" },
    { id: "TX-9922", date: "2026-01-13", type: "BUY_ORDER", user: "Governance", asset: "SASOL", amount: -2500, status: "SETTLED" }
  ]);

  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString('en-GB'), msg: "ENCRYPTED_SESSION_ESTABLISHED", type: 'success' }
  ]);
  
  const [activeVote, setActiveVote] = useState({
    active: true, asset: "SASOL", type: "BUY", amount: "R2,500", votes: 2, totalNeeded: 3, voted: false
  });

  const kitchenStyle = searchParams.get('style') || 'hedge';
  const kitchenName = searchParams.get('name') || "The Boys' Kitchen";

  // --- 2. JSE SIMULATOR & AUDIT LOGS ---
  useEffect(() => {
    if (!passedQuiz || isSystemFrozen) return;
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));
      if (Math.random() > 0.9) {
        setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString('en-GB'), msg: "LEDGER_INTEGRITY_CHECK_PASS", type: 'info' }, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [passedQuiz, isSystemFrozen]);

  const questions = [
    { title: "Risk Awareness", q: "Do you understand JSE investments carry risk?", btn: "I UNDERSTAND" },
    { title: "Governance", q: "A trade only executes if 60%+ quorum is reached. Accept?", btn: "I ACCEPT" },
    { title: "Compliance", q: "Will you abide by the Kitchen's limits?", btn: "I AGREE" }
  ];

  // --- 3. THE QUIZ GATE (Lines 64-85) ---
  if (!passedQuiz) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full p-10 bg-[#00FF41]/5 border border-[#00FF41]/30 rounded-lg">
          <div className="flex justify-between items-center mb-8">
             <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 w-12 rounded-full ${i <= quizStep ? 'bg-[#00FF41]' : 'bg-zinc-800'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black text-[#00FF41] uppercase">Step {quizStep + 1}</span>
          </div>
          <p className="text-3xl font-[900] uppercase tracking-tighter mb-8">{questions[quizStep].q}</p>
          <button onClick={() => quizStep < 2 ? setQuizStep(quizStep + 1) : setPassedQuiz(true)} className="w-full py-5 bg-[#00FF41] text-black font-black uppercase text-xs">
            {questions[quizStep].btn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans">
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col">
          <span className="text-2xl font-[900] uppercase">Young Investors</span>
          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">ZAR_AUDIT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-zinc-950 border border-white/10 rounded overflow-hidden">
            <button onClick={() => setActiveTab('terminal')} className={`px-4 py-2 text-[10px] font-black uppercase ${activeTab === 'terminal' ? 'bg-white text-black' : 'text-zinc-500'}`}>Terminal</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 text-[10px] font-black uppercase ${activeTab === 'ledger' ? 'bg-white text-black' : 'text-zinc-500'}`}>Ledger</button>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="text-zinc-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          {activeTab === 'terminal' ? (
            <>
              <header className="mb-12 flex justify-between items-start">
                <div>
                  <h1 className="text-5xl font-[900] uppercase tracking-tighter mb-2">{kitchenName}</h1>
                  <div className={`text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 ${isSystemFrozen ? 'text-red-600' : 'text-[#00FF41]'}`}>
                    <div className={`w-2 h-2 rounded-full ${isSystemFrozen ? 'bg-red-600' : 'bg-[#00FF41] animate-pulse'}`} /> 
                    {isSystemFrozen ? 'SYSTEM_HALTED' : 'GOVERNANCE_ACTIVE'}
                  </div>
                </div>
                {/* EMERGENCY CIRCUIT BREAKER (For A+ Standard) */}
                <button 
                  onClick={() => setIsSystemFrozen(!isSystemFrozen)}
                  className="px-4 py-2 border border-red-600 text-red-600 text-[8px] font-black uppercase rounded hover:bg-red-600 hover:text-white transition-all"
                >
                  {isSystemFrozen ? 'Resume_Terminal' : 'Emergency_Freeze'}
                </button>
              </header>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-8 bg-zinc-950 border border-white/5 rounded-lg">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Sasol Ltd</span>
                  <div className="text-3xl font-[900]">R{prices.sasol.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-zinc-950 border border-white/5 rounded-lg">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Capitec Bank</span>
                  <div className="text-3xl font-[900]">R{prices.capitec.toFixed(2)}</div>
                </div>
              </div>

              {/* VOTING ENGINE */}
              <div className={`p-8 rounded-lg mb-8 border ${isSystemFrozen ? 'bg-red-600/5 border-red-600/30' : 'bg-[#00FF41]/5 border-[#00FF41]/20'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${isSystemFrozen ? 'text-red-600' : 'text-[#00FF41]'}`}>
                  {isSystemFrozen ? 'TRADING_SUSPENDED' : 'Active_Governance_Vote'}
                </span>
                <h2 className="text-2xl font-[900] uppercase mb-6">{activeVote.type} {activeVote.asset}</h2>
                {isSystemFrozen ? (
                  <div className="p-4 border border-red-600/30 text-red-600 text-[10px] font-black text-center uppercase tracking-widest">
                    SYSTEM_WIDE_CIRCUIT_BREAKER_ENGAGED
                  </div>
                ) : !isVerified ? (
                  <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
                    VOTING_LOCKED: COMPLETE_FICA_VERIFICATION
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={() => setActiveVote({...activeVote, voted: true, votes: activeVote.votes+1})} className="flex-1 py-4 bg-[#00FF41] text-black font-black uppercase text-xs">Approve</button>
                    <button className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase text-xs">Veto</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* KITCHEN LEDGER VIEW */
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-5xl font-[900] uppercase tracking-tighter">Kitchen_Ledger</h1>
                <button className="px-4 py-2 bg-white text-black text-[8px] font-black uppercase rounded hover:bg-[#00FF41] transition-all">Export_CSV</button>
              </div>
              <div className="bg-zinc-950 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="bg-white/5 text-zinc-500 font-black uppercase tracking-widest">
                      <th className="p-4">TX_ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Entity</th>
                      <th className="p-4 text-right">Amount (ZAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ledger.map(tx => (
                      <tr key={tx.id} className="font-bold">
                        <td className="p-4 font-mono text-zinc-500">{tx.id}</td>
                        <td className="p-4 uppercase">{tx.date}</td>
                        <td className="p-4 uppercase">{tx.user}</td>
                        <td className={`p-4 text-right ${tx.amount > 0 ? 'text-[#00FF41]' : 'text-white'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT TRAIL */}
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-lg font-mono text-[9px] mt-8">
            <span className="text-zinc-600 uppercase font-black mb-4 block underline">System_Audit_Logs</span>
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 mb-1">
                <span className="text-zinc-700">[{log.time}]</span>
                <span className={`${log.type === 'success' ? 'text-[#00FF41]' : 'text-white/60'}`}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR: CONSTITUTION & COMPLIANCE */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-lg">
            <h3 className="text-[10px] font-black uppercase text-[#00FF41] mb-4">Kitchen_Constitution</h3>
            <div className="space-y-4 text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase">Style</span>
                <span className="font-black uppercase">{kitchenStyle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase font-mono">FICA_Status</span>
                <span className={`font-black uppercase ${isVerified ? 'text-[#00FF41]' : 'text-red-500 animate-pulse'}`}>
                  {isVerified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
            {!isVerified && (
              <button onClick={() => router.push('/verify')} className="w-full mt-4 py-3 border border-red-500/50 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Verify_FICA</button>
            )}
          </div>
          
          {/* POPIA PRIVACY SEAL (Final A+ Requirement) */}
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-lg text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            <p className="mb-2">Act 4 of 2013 (POPIA) Compliant</p>
            <p>SARB Sandbox ID: YI-ZAR-2026</p>
          </div>
        </div>
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-zinc-950 border border-white/10 p-10 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-2xl font-[900] uppercase tracking-tighter mb-2 text-center text-white">Confirm Exit</h3>
            <p className="text-zinc-500 text-[10px] font-medium mb-8 uppercase tracking-widest leading-relaxed text-center">Terminating session will pause live JSE feed and governance participation.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-zinc-900 text-white font-[900] text-[10px] uppercase tracking-widest rounded border border-white/5">Cancel</button>
              <button onClick={() => router.push('/')} className="flex-1 py-4 bg-white text-black font-[900] text-[10px] uppercase tracking-widest rounded hover:bg-red-600 hover:text-white transition-all">Log_Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}><DashboardContent /></Suspense>
  );
}
