"use client"
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [votes, setVotes] = useState(2);
  const [userLevel, setUserLevel] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });

  // JSE LIVE FEED SIMULATOR
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // VOTING FUNCTION
  const handleVote = () => {
    console.log("Attempting to vote...");
    if (userLevel < 2) {
      alert("SYSTEM LOCKED: Pass Level 2 Exam first.");
      return;
    }
    if (votes < 5) {
      setVotes(prev => prev + 1);
    } else {
      alert("MAX VOTES REACHED (5/5)");
    }
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setUserLevel(2);
      setShowQuiz(false);
    } else {
      alert("INCORRECT. TRY AGAIN.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      {/* HEADER */}
      <div className="border-b border-yi-green pb-4 mb-8 flex justify-between items-end">
        <h1 className="text-xl text-yi-green font-bold tracking-tighter">
          {">"} Y.I. SYSTEM_ACTIVE
        </h1>
        <div className="text-right">
          <span className={`px-2 py-1 text-[10px] font-black ${userLevel >= 2 ? 'bg-yi-green text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {userLevel === 1 ? 'LVL 1: APPRENTICE' : 'LVL 2: SOUS-CHEF'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. JSE TICKER */}
        <div className="border border-yi-green p-4 bg-zinc-900/40">
          <h2 className="text-[10px] text-yi-green mb-4 underline uppercase">Market_Watch</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>SASOL</span>
              <span className="text-yi-green">R {prices.sasol.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CAPITEC</span>
              <span className="text-yi-green">R {prices.capitec.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 2. WEALTH ACADEMY GATE */}
        <div className="border border-white p-4">
          <h2 className="text-[10px] text-yi-green mb-4 underline uppercase">Skill_Tree</h2>
          {userLevel === 1 ? (
            !showQuiz ? (
              <button onClick={() => setShowQuiz(true)} className="w-full border border-yi-green py-2 text-xs hover:bg-yi-green hover:text-black">
                START EXAM
              </button>
            ) : (
              <div className="text-[10px] space-y-2">
                <p className="mb-2">Q: Purpose of a Stop-Loss?</p>
                <button onClick={() => handleQuizAnswer(true)} className="block w-full text-left p-2 border border-zinc-700 hover:bg-zinc-800 underline">1. Limit potential losses</button>
                <button onClick={() => handleQuizAnswer(false)} className="block w-full text-left p-2 border border-zinc-700 hover:bg-zinc-800">2. Increase leverage</button>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <p className="text-yi-green text-[10px] font-bold">ACCESS GRANTED</p>
              <p className="text-[9px] opacity-50 uppercase">VOTING_ENABLED</p>
            </div>
          )}
        </div>

        {/* 3. GOVERNANCE (The Multi-Sig) */}
        <div className={`border-2 p-4 transition-all duration-500 ${userLevel >= 2 ? 'border-yi-green' : 'border-zinc-800 opacity-30'}`}>
          <h2 className="text-[10px] text-yi-green mb-4 underline uppercase">Governance_Engine</h2>
          <div className="flex justify-between text-[10px] mb-2">
             <span>PROGRESS</span>
             <span className="text-yi-green">{votes}/5</span>
          </div>
          <div className="w-full bg-zinc-800 h-4 mb-6 border border-zinc-700 overflow-hidden">
            <div 
              className="bg-yi-green h-full shadow-[0_0_15px_#00FF41] transition-all duration-1000" 
              style={{ width: `${(votes / 5) * 100}%` }}
            ></div>
          </div>
          <button 
            onClick={handleVote}
            className={`w-full py-3 text-xs font-black transition-all ${userLevel >= 2 ? 'bg-yi-green text-black hover:bg-white cursor-pointer' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
          >
            {userLevel >= 2 ? "[ CAST_VOTE ]" : "[ LOCKED ]"}
          </button>
        </div>

      </div>
    </div>
  );
}