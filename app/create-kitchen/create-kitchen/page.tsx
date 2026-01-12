"use client"
import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateKitchen() {
  const [selectedStyle, setSelectedStyle] = useState('mutual');

  const templates = [
    { id: 'mutual', name: 'Slow-Cook', desc: 'Diversified JSE Top 40. Long term.', risk: 'Low', quorum: '4/5' },
    { id: 'hedge', name: 'High-Heat', desc: 'Aggressive growth. High volatility.', risk: 'High', quorum: '3/5' }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-6xl font-[900] tracking-[-0.07em] uppercase mb-4">Design your<br/>Kitchen</h1>
        <p className="text-zinc-500 font-medium mb-12 tracking-tight">Select a constitution template for your investment group.</p>

        <div className="space-y-4 mb-12">
          {templates.map((t) => (
            <div 
              key={t.id}
              onClick={() => setSelectedStyle(t.id)}
              className={`p-6 border rounded-lg cursor-pointer transition-all ${
                selectedStyle === t.id ? 'border-[#00FF41] bg-[#00FF41]/5' : 'border-white/10 bg-zinc-950'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-[900] uppercase tracking-tighter">{t.name}</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${t.risk === 'High' ? 'bg-red-500' : 'bg-[#00FF41] text-black'}`}>
                  {t.risk} RISK
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">{t.desc}</p>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Consensus Requirement: <span className="text-white">{t.quorum}</span>
              </div>
            </div>
          ))}
        </div>

        <Link href={`/create-kitchen/${selectedStyle}/setup`}>
          <button className="w-full py-5 bg-white text-black font-[900] text-sm uppercase tracking-widest rounded-lg hover:bg-[#00FF41] transition-all">
            Initialize Kitchen
          </button>
        </Link>
      </div>
    </div>
  );
}