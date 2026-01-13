"use client"
import React from 'react';
import Link from 'next/link';

const types = [
  {
    title: "The Mutual Kitchen",
    subtitle: "STABLE & LONG-TERM",
    description: "Focuses on Top 40 JSE Blue Chips. 4/5 Majority required for all trades.",
    risk: "LOW",
    color: "border-blue-500/50"
  },
  {
    title: "The Hedge Kitchen",
    subtitle: "AGGRESSIVE GROWTH",
    description: "Focuses on Tech & Volatile sectors. 3/5 Majority required for speed.",
    risk: "HIGH",
    color: "border-red-500/50"
  },
  {
    title: "The Custom Kitchen",
    subtitle: "TOTAL FREEDOM",
    description: "Define your own quorum and asset universe. Sandbox approval required.",
    risk: "VARIES",
    color: "border-[#00FF41]/50"
  }
];

export default function KitchenType() {
  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="max-w-5xl mx-auto pt-20">
        <h1 className="text-7xl font-[900] tracking-[-0.07em] uppercase leading-[0.9] mb-4">
          Select Your<br/>Mandate
        </h1>
        <p className="text-zinc-500 font-medium text-lg mb-16 max-w-xl">
          Every Kitchen requires a constitution. Choose a template that matches your group's risk appetite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {types.map((type, i) => (
            <div key={i} className={`p-8 bg-zinc-950 border ${type.color} rounded-lg flex flex-col justify-between hover:bg-zinc-900 transition-all cursor-pointer group`}>
              <div>
                <p className="text-[10px] font-black tracking-widest text-zinc-500 mb-2">{type.subtitle}</p>
                <h3 className="text-2xl font-[900] uppercase tracking-tighter mb-4 group-hover:text-[#00FF41]">{type.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">{type.description}</p>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <span className="text-[10px] font-black uppercase text-zinc-600">Risk Profile</span>
                <span className="text-[10px] font-black text-white">{type.risk}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full py-5 bg-white text-black font-[900] text-sm uppercase tracking-widest rounded-sm hover:bg-[#00FF41] transition-all">
              Initialize Group
            </button>
          </Link>
          <Link href="/dashboard" className="px-10 py-5 border border-white/10 text-zinc-500 font-[900] text-sm uppercase tracking-widest rounded-sm hover:text-white transition-all">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
