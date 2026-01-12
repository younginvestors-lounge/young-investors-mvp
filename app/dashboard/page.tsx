"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });
  const [logs, setLogs] = useState([
    { id: 1, time: '10:42:01', msg: 'SYSTEM_READY', type: 'info' },
    { id: 2, time: '10:45:12', msg: 'KITCHEN_01_CONNECTED', type: 'success' }
  ]);

  // LIVE DATA SIMULATOR
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 0.4 - 0.2),
        capitec: prev.capitec + (Math.random() * 2 - 1)
      }));
      
      // Randomly add a log entry every few seconds
      if (Math.random() > 0.7) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const newLog = { id: Date.now(), time, msg: 'MARKET_DATA_REFRESHED', type: 'info' };
        setLogs(prev => [newLog, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = () => {
    if (userLevel < 2) return;
    setVotes(v => Math.min(5, v + 1));
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [{ id: Date.now(), time, msg: 'VOTE_CAST_BY_CHEF_Z', type: 'success' }, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans">
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#00FF41] rounded flex items-center justify-center text-black font-black text-xs">YI</div>
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">Terminal</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded border border-white/10">
              {userLevel === 1 ? 'Apprentice' : 'Sous-Chef'}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* ASSET DATA */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="precision-card inner-glow p-8">
            <header className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 font-bold">Consolidated Portfolio</p>
                <h2 className="text-5xl font-bold tracking-tight">R 85,240<span className="opacity-20">.00</span></h2>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">$SOL</p>
                <p className="text-2xl font-semibold tracking-tight">R{prices.sasol.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">$CPI</p>
                <p className="text-2xl font-semibold tracking-tight">R{prices.capitec.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* THE NEW EXCHANGE FEED */}
          <div className="precision-card inner-glow p-6 bg-black/40">
            <h3 className="text-[10px] text-zinc-500 uppercase font-bold mb-4 tracking-widest">Live_Exchange_Feed</h3>
            <div className="space-y-3 font-mono">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 items-center text-[10px] border-b border-white/5 pb-2">
                  <span className="text-zinc-600">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-[#00FF41]' : 'text-zinc-400'}>
                    {">"} {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GOVERNANCE SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="precision-card inner-glow p-6 flex flex-col justify-between h-full min-h-[400px]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">Governance</h3>
              
              {showQuiz ? (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-300 font-medium italic">Certification: Purpose of Stop-Loss?</p>
                  <button onClick={() => {setUserLevel(2); setShowQuiz(false);}} className="w-full text-left p-4 text-[11px] bg-white/5 border border-white/10 rounded-lg hover:border-[#00FF41]">
                    Limit downside risk
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-bold mb-2 uppercase tracking-tighter">Proposal #104: Execute $SOL</p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00FF41]" style={{ width: `${(votes/5)*100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase">{votes}/5 Approved</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => userLevel === 1 ? setShowQuiz(true) : handleVote()}
              className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded hover:bg-[#00FF41] transition-all"
            >
              {userLevel === 1 ? 'Start Certification' : 'Verify & Approve'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
