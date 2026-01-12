"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });
  const [logs, setLogs] = useState([
    { id: 1, time: '23:14:01', msg: 'SYSTEM_ENCRYPTED', type: 'info' },
    { id: 2, time: '23:15:12', msg: 'SECURE_CHANNEL_OPEN', type: 'success' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 0.4 - 0.2),
        capitec: prev.capitec + (Math.random() * 2 - 1)
      }));
      
      if (Math.random() > 0.8) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setLogs(prev => [{ id: Date.now(), time, msg: 'VOLATILITY_SYNC_OK', type: 'info' }, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = () => {
    if (userLevel < 2) return;
    setVotes(v => Math.min(5, v + 1));
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [{ id: Date.now(), time, msg: 'QUORUM_VOTE_RECORDED', type: 'success' }, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6">
      
      {/* HEADER */}
      <nav className="max-w-7xl mx-auto h-20 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
             <div className="w-3 h-3 bg-black rounded-sm"></div>
          </div>
          <span className="apple-bold text-lg uppercase tracking-tighter">YOUNG INVESTORS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#00FF41]/10 text-[#00FF41] px-3 py-1.5 rounded-full border border-[#00FF41]/20">
            {userLevel === 1 ? 'Lvl 1: Apprentice' : 'Lvl 2: Sous-Chef'}
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 grid grid-cols-12 gap-8">
        
        {/* LEFT: MARKET DATA */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="precision-card p-10">
            <p className="text-zinc-500 apple-bold text-[11px] uppercase tracking-widest mb-4">Total Portfolio Balance</p>
            <div className="flex items-baseline gap-4 mb-12">
              <h2 className="text-7xl apple-bold tracking-tighter">R 85,240<span className="text-zinc-800">.00</span></h2>
              <div className="bg-[#00FF41] text-black text-[10px] font-black px-2 py-0.5 rounded">+2.4%</div>
            </div>

            <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-10">
              <div className="space-y-1">
                <p className="text-zinc-500 apple-bold text-[10px] uppercase tracking-widest font-bold">$SOL (Sasol)</p>
                <p className="text-3xl apple-bold">R{prices.sasol.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 apple-bold text-[10px] uppercase tracking-widest font-bold">$CPI (Capitec)</p>
                <p className="text-3xl apple-bold">R{prices.capitec.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* EXCHANGE FEED LOG */}
          <div className="precision-card p-6 bg-black/20">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></div>
                <h3 className="apple-bold text-[10px] text-zinc-400 uppercase tracking-widest">Exchange_Feed_v1.0</h3>
             </div>
             <div className="space-y-3 font-mono">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 items-center text-[10px] opacity-70 border-l-2 border-white/5 pl-4 py-1">
                  <span className="text-zinc-600 font-bold">{log.time}</span>
                  <span className={log.type === 'success' ? 'text-[#00FF41]' : 'text-zinc-100'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: GOVERNANCE */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="precision-card p-8 min-h-[450px] flex flex-col justify-between border-t-2 border-[#00FF41]">
            <div>
              <h3 className="apple-bold text-[11px] uppercase tracking-widest text-zinc-500 mb-10">Consensus Engine</h3>
              
              {showQuiz ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <p className="text-sm apple-bold leading-tight">Identify the primary benefit of a Stop-Loss order?</p>
                  <button onClick={() => {setUserLevel(2); setShowQuiz(false);}} className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#00FF41] text-[11px] apple-bold transition-all">
                    Risk Mitigation & Loss Caps
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-2">
                    <p className="apple-bold text-xs uppercase tracking-tighter">Proposal #104: Execute $SOL</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Group approval required for broker release.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end apple-bold text-[10px] uppercase">
                      <span className="text-zinc-500">Quorum Progress</span>
                      <span className="text-[#00FF41]">{votes}/5 Verified</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00FF41] shadow-[0_0_20px_#00FF41] transition-all duration-1000"
                        style={{ width: `${(votes/5)*100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => userLevel === 1 ? setShowQuiz(true) : handleVote()}
              className="w-full py-5 bg-white text-black apple-bold text-[12px] uppercase tracking-[0.1em] rounded-xl hover:bg-[#00FF41] transition-all"
            >
              {userLevel === 1 ? 'Unlock Terminal' : 'Cast Approval Vote'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
