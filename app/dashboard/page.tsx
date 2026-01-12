// Inside your Governance card, replace the progress bar section with this:
<div className="w-full bg-zinc-800/50 h-3 rounded-full overflow-hidden p-[px] border border-white/5">
  {/* ... content ... */}
</div>
"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 0.5 - 0.25),
        capitec: prev.capitec + (Math.random() * 2 - 1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* MODERN HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-2xl font-light tracking-widest text-white">YOUNG <span className="font-bold text-yi-green">INVESTORS</span></h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Wealth Academy x Stokvel</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yi-green animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-tighter">
            {userLevel === 1 ? 'Apprentice' : 'Sous-Chef'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TREASURY CARD - Modern Gradient */}
        <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-zinc-900/50 to-black">
          <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest font-semibold">Total Portfolio Value</p>
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-5xl font-bold tracking-tight">R 85,240<span className="text-zinc-500">.00</span></h2>
            <span className="text-yi-green text-sm font-bold">+2.4% today</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Sasol ($SOL)</p>
              <p className="text-lg font-medium">R {prices.sasol.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Capitec ()</p>
              <p className="text-lg font-medium">R {prices.capitec.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* GOVERNANCE - Glass Look */}
        <div className="glass-card p-8 flex flex-col justify-between border-yi-green/20">
          <div>
            <h3 className="text-sm font-bold mb-1">Active Proposal</h3>
            <p className="text-xs text-zinc-400 mb-6">Execution of  Position</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-zinc-500">Quorum Progress</span>
                <span className="text-yi-green">{votes}/5 Members</span>
              </div>
              
              {/* Corrected Progress Bar Section */}
              <div className="w-full bg-zinc-800/50 h-3 rounded-full overflow-hidden p-[1px] border border-white/5">
                <div 
                  className="bg-[#00FF41] h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${(votes / 5) * 100}%`,
                    boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)' 
                  }}
                ></div>
              </div>

            </div>
          </div>

          <button 
            onClick={() => setVotes(v => v < 5 ? v + 1 : v)}
            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-yi-green transition-all transform active:scale-95"
          >
            Vote to Execute
          </button>
        </div>

      </div>
    </div>
  );
}
