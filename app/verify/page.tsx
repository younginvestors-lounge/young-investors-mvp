"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FICAOnboarding() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate FIC/Home Affairs API Handshake
    setTimeout(() => {
      router.push('/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
            FIC_REGULATORY_REQUIREMENT: ACT_38_OF_2001
          </span>
        </div>

        <h1 className="text-6xl font-[900] tracking-[-0.07em] uppercase leading-[0.9] mb-8">
          Identity<br/>Verification
        </h1>

        <div className="space-y-6 mb-12">
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
            <h3 className="text-sm font-black uppercase mb-4 text-[#00FF41]">Section A: Know Your Customer (KYC)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-2">SA ID Number / Passport</label>
                <input type="text" placeholder="ENTER 13-DIGIT ID" className="w-full bg-black border-b border-white/20 p-2 text-xl font-bold focus:border-[#00FF41] outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
            <h3 className="text-sm font-black uppercase mb-4 text-[#00FF41]">Section B: Source of Funds</h3>
            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
              To prevent money laundering (AML), the Reserve Bank requires you to declare the origin of your investment capital.
            </p>
            <select className="w-full bg-black border border-white/10 p-3 text-xs font-black uppercase tracking-widest">
              <option>Employment Income</option>
              <option>Savings / Inheritance</option>
              <option>Business Profit</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full py-6 bg-white text-black font-[900] text-sm uppercase tracking-[0.3em] hover:bg-[#00FF41] transition-all disabled:opacity-50"
        >
          {isVerifying ? "ENCRYPTING_DATA_FOR_FIC..." : "SUBMIT_TO_CLEARING_HOUSE"}
        </button>

        <p className="mt-6 text-center text-[8px] font-medium text-zinc-700 uppercase tracking-widest">
          All data is encrypted via SHA-256 and stored according to POPIA (Protection of Personal Information Act) standards.
        </p>
      </div>
    </div>
  );
}
