"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });
  const [logs, setLogs] = useState([
    { id: 1, time: '23:14:01', msg: 'ENCRYPTED_SESSION_START', type: 'info' },
    { id: 2, time: '23:15:12', msg: 'LIQUIDITY_BUFFER_OK', type: 'success' }
  ]);

  // JSE LIVE FEED SIMULATOR
  useEffect(() => {
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
  }, []);

  const handleCertification = () => {
    setUserLevel(2);
    setShowQuiz(false);
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [{ id: Date.now(), time, msg: 'CHEF_ZANNY_CREDENTIALS_VERIFIED', type: 'success' }, ...prev]);
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans">
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col leading-none">
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Young</span>
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Investors</span>
        </div>
        <div className={`px-4 py-2 rounded-sm text-[10px] font-[900] uppercase tracking-tighter ${userLevel >= 2 ? 'bg-[#00FF41] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
          {userLevel === 1 ? 'Apprentice' : 'Sous-Chef'}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-zinc-950 border border-white/5 p-12 rounded-lg">
            <p className="text-zinc-500 font-[900] text-[12px] uppercase tracking-widest mb-6">Portfolio Balance</p>
            <h2 className="text-8xl font-[900] tracking-[-0.08em] mb-12">R 85,240<span className="opacity-10">.00</span></h2>
            
            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5">
              <div>
                <p className="text-zinc-500 font-[900] text-[10px] uppercase mb-2">$SOL</p>
                <p className="text-4xl font-[900] tracking-[-0.05em]">R{prices.sasol.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500 font-[900] text-[10px] uppercase mb-2">$CPI</p>
                <p className="text-4xl font-[900] tracking-[-0.05em]">R{prices.capitec.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 p-8 border border-white/5 rounded-lg font-mono">
            <h3 className="text-[10px] font-[900] uppercase text-zinc-500 mb-6 tracking-[0.2em]">Live_Exchange_Feed</h3>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="text-[10px] flex gap-4 opacity-50">
                  <span className="text-zinc-600">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-[#00FF41]' : 'text-white'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          {/* KITCHEN CONSTITUTION BOX */}
          <div className="precision-card p-6 bg-[#00FF41]/5 border border-[#00FF41]/20 mb-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-[900] uppercase tracking-widest text-[#00FF41]">Active_Constitution</h3>
              <span className="text-[8px] bg-[#00FF41] text-black px-2 py-0.5 font-black rounded-sm uppercase">Hedge_Fund_Style</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-zinc-400">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Min. Approval Quorum</span>
                <span className="text-white">60% (3/5)</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Max. Asset Exposure</span>
                <span className="text-white">R15,000 / Trade</span>
              </li>
              <li className="flex justify-between">
                <span>Asset Universe</span>
                <span className="text-white">JSE_TOP_40 + TECH</span>
              </li>
            </ul>
          </div>

          <div className="bg-white text-black p-8 rounded-lg min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-[900] uppercase tracking-[-0.05em] mb-8">Consensus</h3>
              
              {showQuiz ? (
                <div className="space-y-6">
                  <p className="text-sm font-[900] leading-tight uppercase tracking-tight">Confirm: Stop-loss is used to mitigate capital risk?</p>
                  <button onClick={handleCertification} className="w-full bg-black text-white py-4 font-[900] text-xs uppercase tracking-widest hover:bg-[#00FF41] hover:text-black transition-colors">
                    Confirm & Verify
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-[900] uppercase text-zinc-400">Proposal #104</p>
                    <p className="text-2xl font-[900] uppercase tracking-tighter leading-none">Execute $SOL Order</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between font-[900] text-[10px] uppercase">
                      <span>Quorum</span>
                      <span>{votes}/5</span>
                    </div>
                    <div className="h-4 bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-black transition-all duration-1000" style={{ width: `${(votes/5)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={userLevel < 2}
              onClick={() => setVotes(v => Math.min(5, v+1))}
              className={`w-full py-5 font-[900] text-sm uppercase tracking-widest transition-all ${userLevel >= 2 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
            >
              {userLevel === 1 ? 'Locked' : 'Approve Order'}
            </button>
            {userLevel === 1 && !showQuiz && (
              <button onClick={() => setShowQuiz(true)} className="mt-4 text-[10px] font-[900] uppercase underline text-center w-full">Begin Certification</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
