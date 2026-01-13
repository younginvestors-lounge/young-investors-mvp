"use client"
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KitchenType() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd clear cookies/sessions here
    router.push('/');
  };

  const types = [
    { title: "Mutual Kitchen", desc: "Long-term, Blue-chip focus.", risk: "LOW" },
    { title: "Hedge Kitchen", desc: "Aggressive, high-volatility.", risk: "HIGH" }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <nav className="flex justify-between items-center mb-20">
        <span className="text-xl font-[900] tracking-tighter uppercase">Young Investors</span>
        <button 
          onClick={handleLogout}
          className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all"
        >
          System_Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-[900] tracking-[-0.07em] uppercase mb-12">Select Kitchen<br/>Mandate</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {types.map((t, i) => (
            <div key={i} className="p-8 bg-zinc-900 border border-white/5 rounded-lg hover:border-[#00FF41] transition-all cursor-pointer">
              <h3 className="text-2xl font-[900] uppercase tracking-tighter mb-2">{t.title}</h3>
              <p className="text-zinc-500 text-sm mb-6">{t.desc}</p>
              <span className="text-[10px] font-black bg-white text-black px-2 py-1 rounded">RISK: {t.risk}</span>
            </div>
          ))}
        </div>

        <Link href="/dashboard">
          <button className="w-full py-5 bg-[#00FF41] text-black font-[900] text-sm uppercase tracking-widest rounded-sm">
            Confirm & Initialize
          </button>
        </Link>
      </div>
    </div>
  );
}
