'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* 1. TITLE & HERO (Rubric: Title and Description) */}
      <section className="h-screen flex flex-col justify-between p-8 md:p-12 border-b-[12px] border-black">
        <nav className="flex justify-between items-start">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-400">
            Young Investors Pty Ltd
          </div>
          <Link href="/kitchen">
            <button className="bg-black text-white px-6 py-2 font-mono text-xs hover:bg-gray-800 transition-all border border-black uppercase tracking-wider">
              Launch Terminal &rarr;
            </button>
          </Link>
        </nav>

        <div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase italic mb-6">
            We Cook.
          </h1>
          <p className="max-w-3xl text-xl md:text-2xl font-medium leading-relaxed text-gray-800">
            <strong>The Concept:</strong> A Bimodal Governance Structure bridging the gap between student liquidity and institutional assets.
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="text-sm font-mono">
            EST. 2026 // MAKHANDA, SA
          </div>
          <div className="text-xs font-bold uppercase tracking-widest animate-bounce">
            Scroll for Academic Briefing ↓
          </div>
        </div>
      </section>

      {/* 2. PROBLEM & VALUE PROPOSITION (Rubric Section 1) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
                <h2 className="text-3xl font-bold uppercase mb-4">01. Problem & Value</h2>
                <div className="w-12 h-2 bg-black mb-6"></div>
            </div>
            <div className="md:w-2/3 space-y-8">
                <div>
                    <h3 className="font-bold text-xl mb-2">The Problem (Market Gap)</h3>
                    <p className="text-gray-700">
                        Students possess <strong>high time-preference</strong> and <strong>low individual capital</strong>. 
                        Legacy financial institutions ignore this segment due to high acquisition costs and low account balances, 
                        leaving students structurally excluded from premium market instruments.
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-2">The Value Proposition</h3>
                    <p className="text-gray-700">
                        We aggregate micro-capital into a unified <strong>"Kitchen" (Quorum)</strong>. 
                        By acting as a single institutional entity, we unlock high-yield instruments and reduce transaction fees, 
                        giving students access to institutional-grade wealth creation.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 3. MARKET SIZE & ACCESS (Rubric Section 2) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
                <h2 className="text-3xl font-bold uppercase mb-4">02. Market & Access</h2>
                <div className="w-12 h-2 bg-black mb-6"></div>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-black p-6">
                    <h3 className="font-bold text-lg mb-2">Target Market</h3>
                    <p className="text-sm text-gray-600">
                        University Students (Ages 18-24) in South Africa. Initial focus on Rhodes University (Makhanda).
                    </p>
                </div>
                <div className="border border-black p-6">
                    <h3 className="font-bold text-lg mb-2">Market Access</h3>
                    <p className="text-sm text-gray-600">
                        <strong>Direct Acquisition:</strong> Campus partnerships, Society events (RUESS), and peer-to-peer referral networks.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. VIABILITY & COMPETITION (Rubric Section 3) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
             <div className="md:w-1/3">
                <h2 className="text-3xl font-bold uppercase mb-4">03. Competitive Edge</h2>
                <div className="w-12 h-2 bg-black mb-6"></div>
            </div>
            <div className="md:w-2/3">
                <p className="text-lg mb-6">
                    <strong>Competitors:</strong> EasyEquities (Retail), Stokvels (Traditional), Crypto Exchanges (High Risk).
                </p>
                <div className="bg-white border-2 border-black p-8 relative overflow-hidden">
                    <h3 className="font-bold text-2xl italic mb-4">The "Kitchen" Advantage</h3>
                    <p className="text-gray-700 mb-4">
                        Unlike retail apps that encourage isolated gambling, the Kitchen forces <strong>Collaborative Intelligence</strong>. 
                        Trades require <strong>60% Consensus</strong> to execute, filtering out impulsive decisions.
                    </p>
                    <div className="absolute top-4 right-4 text-xs font-bold border border-black px-2 py-1 uppercase">
                        Differentiation
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. OPERATIONALIZATION (Rubric Section 4) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
                <h2 className="text-3xl font-bold uppercase mb-4">04. Operations</h2>
                <div className="w-12 h-2 bg-black mb-6"></div>
            </div>
            <div className="md:w-2/3 space-y-6 font-mono text-sm">
                <div className="flex items-start gap-4">
                    <span className="font-bold">01. INPUT:</span>
                    <span>Students deposit capital into the "Waiting Room" (Escrow).</span>
                </div>
                <div className="flex items-start gap-4">
                    <span className="font-bold">02. PROCESS:</span>
                    <span>Investment Committee proposes assets. Students vote via the App.</span>
                </div>
                <div className="flex items-start gap-4">
                    <span className="font-bold">03. OUTPUT:</span>
                    <span>If &gt;60% Yes: Trade Executed. If &lt;60%: Proposal Rejected.</span>
                </div>
            </div>
        </div>
      </section>

      {/* 6. REVENUE & FEASIBILITY (Rubric Sections 5 & 6) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black bg-black text-white">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
                <h2 className="text-3xl font-bold uppercase mb-4">05. Financials</h2>
                <div className="w-12 h-2 bg-white mb-6"></div>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Revenue Model</h3>
                    <ul className="space-y-4 font-mono text-sm">
                        <li className="flex justify-between">
                            <span>Management Fee</span>
                            <span className="font-bold">2.5% p.a.</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Performance Fee</span>
                            <span className="font-bold">15.0%</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Feasibility & Risk</h3>
                    <p className="text-sm text-gray-400 mb-2">
                        <strong>Regulatory:</strong> Compliance with FSCA (CAT II License pathway).
                    </p>
                    <p className="text-sm text-gray-400">
                        <strong>Financial:</strong> Break-even analysis requires 500 Active Users at R500 avg. deposit.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 7. THE BOARD (5 DIRECTORS) */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black">
        <h2 className="text-4xl font-bold uppercase mb-12 text-center">The Board of Directors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Denzel */}
          <div className="border border-black p-4 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-xl font-serif italic mb-1">Denzel</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Chief Executive</p>
            <p className="text-xs opacity-80">Vision & Strategy.</p>
          </div>

          {/* Tino */}
          <div className="border border-black p-4 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-xl font-serif italic mb-1">Tino</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Chief Technology</p>
            <p className="text-xs opacity-80">Systems Architecture.</p>
          </div>

          {/* Luba */}
          <div className="border border-black p-4 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-xl font-serif italic mb-1">Luba</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Chief Operating</p>
            <p className="text-xs opacity-80">Logistics & Ops.</p>
          </div>

          {/* Josh */}
          <div className="border border-black p-4 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-xl font-serif italic mb-1">Josh</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Chief Financial</p>
            <p className="text-xs opacity-80">Risk & Capital.</p>
          </div>

          {/* Gary */}
          <div className="border border-black p-4 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-xl font-serif italic mb-1">Gary</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Chief Marketing</p>
            <p className="text-xs opacity-80">Growth & Brand.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 md:px-12 bg-black text-white text-center">
        <p className="text-2xl italic font-serif mb-2">Young Investors Pty Ltd</p>
        <p className="text-[10px] text-gray-500 font-mono">
            PREPARED FOR PROFESSOR MARK BUNTING // ENTREPRENEURSHIP 2026
        </p>
      </footer>
    </main>
  );
}
