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
  const [prices, setPrices] = useState({ sasol: 152.40, capitec: 2105.00 });
  const [logs, setLogs] = useState([{ id: 1, time: "10:00:00", msg: "TERMINAL_READY", type: 'info' }]);
  
  // Voting State
  const [activeVote, setActiveVote] = useState({
    active: true,
    asset: "SASOL",
    type: "BUY",
    amount: "R2,500",
    votes: 2,
    totalNeeded: 3,
    voted: false
  });

  // User/Kitchen Context
  const kitchenStyle = searchParams.get('style') || 'hedge';
  const kitchenName = "The Boys' Kitchen";
  const userLevel = 1;

  // --- 2. JSE SIMULATOR ---
  useEffect(() => {
    if (!passedQuiz) return;
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));
      if (Math.random() > 0.85) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setLogs(prev => [{ id: Date.now(), time, msg: "JSE_FEED_SYNC_OK", type: 'info' }, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [passedQuiz]);

  const questions = [
    { title: "Risk Awareness", q: "Do you understand that JSE investments carry risk?", btn: "I UNDERSTAND" },
    { title: "Governance Quorum", q: "A trade only executes if the majority is reached. Accept?", btn: "I ACCEPT" },
    { title: "Compliance", q: "Will you abide by the Kitchen's limits?", btn: "I AGREE" }
  ];

  // --- 3. THE QUIZ GATE (COMPLIANCE) ---
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
          <p className="text-3xl font-[900] uppercase tracking-tighter leading-none mb-8">{questions[quizStep].q}</p>
          <button onClick={() => quizStep < 2 ? setQuizStep(quizStep + 1) : setPassedQuiz(true)} className="w-full py-5 bg-[#00FF41] text-black font-black text-xs uppercase tracking-widest rounded-sm">
            {questions[quizStep].btn}
          </button>
        </div>
      </div>
    );
  }

  // --- 4. MAIN DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans">
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-[900] uppercase">Young Investors</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-[#00FF41] text-black px-3 py-1 text-[8px] font-black uppercase rounded-sm">Sous-Chef Lvl 1</div>
          <button onClick={() => setShowLogoutModal(true)} className="text-zinc-500 hover:text-red-500 text-[10px] font-black uppercase tracking-widest">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-12">
            <h1 className="text-5xl font-[900] uppercase tracking-tighter mb-2">{kitchenName}</h1>
            <div className="text-[#00FF41] text-[10px] font-black tracking-[0.3em] uppercase">✓ Governance_Certified_Active</div>
          </div>

          {/* PRICES */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-lg">
              <span className="text-[10px] font-black text-zinc-600 uppercase">Sasol JSE</span>
              <div className="text-3xl font-[900]">R{prices.sasol.toFixed(2)}</div>
            </div>
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-lg">
              <span className="text-[10px] font-black text-zinc-600 uppercase">Capitec JSE</span>
              <div className="text-3xl font-[900]">R{prices.capitec.toFixed(2)}</div>
            </div>
          </div>

          {/* RESTORED VOTING LOGIC */}
          <div className="p-8 bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-lg mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-[#00FF41] uppercase tracking-widest">Live_Governance_Vote</span>
                <h2 className="text-2xl font-[900] uppercase tracking-tighter">Action: {activeVote.type} {activeVote.asset}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Quorum Needed</span>
                <div className="text-xl font-[900]">{activeVote.votes}/{activeVote.totalNeeded}</div>
              </div>
            </div>
            {!activeVote.voted ? (
              <div className="flex gap-4">
                <button onClick={() => setActiveVote({...activeVote, voted: true, votes: activeVote.votes + 1})} className="flex-1 py-4 bg-[#00FF41] text-black font-black uppercase text-xs">Approve Trade</button>
                <button className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase text-xs">Veto</button>
              </div>
            ) : (
              <div className="py-4 text-center border border-[#00FF41]/30 text-[#00FF41] text-[10px] font-black uppercase tracking-widest">Vote Registered. Waiting for Quorum...</div>
            )}
          </div>

          {/* EXCHANGE FEED LOGS */}
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-lg font-mono text-[10px]">
            <span className="text-zinc-600 uppercase font-black mb-4 block">System_Audit_Trail</span>
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 mb-1">
                <span className="text-zinc-700">[{log.time}]</span>
                <span className="text-[#00FF41]">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONSTITUTION SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-lg">
            <h3 className="text-[10px] font-black uppercase text-[#00FF41] mb-4">Kitchen_Constitution</h3>
            <div className="space-y-4 text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase">Style</span>
                <span className="font-black uppercase">{kitchenStyle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 uppercase">Quorum</span>
                <span className="font-black uppercase">{kitchenStyle === 'mutual' ? '80%' : '60%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase">Risk Level</span>
                <span className="font-black uppercase text-red-500">Medium</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <DashboardContent />
    </Suspense>
  );
}
