"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1); // 1 = Apprentice, 2 = Sous-Chef
  const [showQuiz, setShowQuiz] = useState(false);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });

  // JSE LIVE FEED SIMULATOR
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 0.6 - 0.3),
        capitec: prev.capitec + (Math.random() * 4 - 2)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = () => {
    if (votes < 5) setVotes(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      {/* MODERN HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-xl md:text-2xl font-light tracking-[0.2em] text-white uppercase">
            Young <span className="font-bold text-[#00FF41]">Investors</span>
          </h1>
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] mt-1">Wealth Academy x Kitchen 01</p>
        </div>
        <div className="hidden md:flex bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${userLevel >= 2 ? 'bg-[#00FF41]' : 'bg-orange-500'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
            {userLevel === 1 ? 'Lvl 1: Apprentice' : 'Lvl 2: Sous-Chef'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: TREASURY & TEAM */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TREASURY CARD */}
          <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Total Portfolio Value</p>
            <div className="flex items-baseline gap-3 mb-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">R 85,240<span className="text-zinc-600">.00</span></h2>
              <span className="text-[#00FF41] text-xs font-bold px-2 py-1 bg-[#00FF41]/10 rounded-lg">+2.45%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase mb-1">Sasol Ltd ($SOL)</p>
                <p className="text-xl font-medium tracking-tight">R {prices.sasol.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase mb-1">Capitec Bank ($CPI)</p>
                <p className="text-xl font-medium tracking-tight">R {prices.capitec.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* TEAM SECTION */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/5">
            <h3 className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] mb-4">Kitchen_Staff (Active)</h3>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['Z', 'T', 'L', 'M', 'S'].map((initial, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-4 border-[#050505] flex items-center justify-center text-xs font-bold 
                    ${i === 0 ? 'bg-[#00FF41] text-black' : 'bg-zinc-800 text-white'}`}>
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-zinc-400 ml-2">+4 others online</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GOVERNANCE & QUIZ */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between relative overflow-hidden">
          
          {/* LOCK OVERLAY */}
          {userLevel === 1 && !showQuiz && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <span className="text-xl">🔒</span>
              </div>
              <h4 className="text-sm font-bold mb-2">Governance Locked</h4>
              <p className="text-[10px] text-zinc-400 mb-6 leading-relaxed">Complete your certification to unlock the voting terminal.</p>
              <button 
                onClick={() => setShowQuiz(true)}
                className="w-full py-3 bg-[#00FF41] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                Begin Assessment
              </button>
            </div>
          )}

          <div>
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-sm font-bold tracking-tight text-zinc-200">Active Proposal #104</h3>
              <span className="text-[8px] bg-white/10 px-2 py-1 rounded-full text-zinc-400 uppercase">Multi-Sig</span>
            </div>
            
            <p className="text-xs text-zinc-400 mb-1">Execute Trade Order:</p>
            <p className="text-lg font-bold mb-6">Buy 50 Units of $SOL</p>

            {/* QUIZ INTERFACE */}
            {showQuiz ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-[#00FF41]/20">
                  <p className="text-[11px] text-zinc-200 leading-relaxed">Q: What is the primary function of a "Stop-Loss" in a group trade?</p>
                </div>
                <button 
                  onClick={() => {setUserLevel(2); setShowQuiz(false);}}
                  className="w-full text-left p-4 text-[10px] border border-white/5 rounded-xl hover:bg-[#00FF41]/10 hover:border-[#00FF41] transition-all"
                >
                  A) To automatically sell and limit group losses.
                </button>
                <button 
                  onClick={() => alert("Incorrect. This would increase risk.")}
                  className="w-full text-left p-4 text-[10px] border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all"
                >
                  B) To double the leverage on a losing position.
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    <span>Quorum</span>
                    <span className="text-[#00FF41]">{votes} / 5 Votes</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-[#00FF41] h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${(votes / 5) * 100}%`,
                        boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)'
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 italic leading-relaxed">Minimum 3 votes required to push order to broker.</p>
              </div>
            )}
          </div>

          {!showQuiz && (
            <button 
              onClick={handleVote}
              disabled={userLevel < 2 || votes >= 5}
              className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all mt-8
                ${userLevel >= 2 
                  ? 'bg-white text-black hover:bg-[#00FF41] active:scale-95' 
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
              {votes >= 5 ? 'Quorum Reached' : 'Cast Approval'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
