import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-[family-name:var(--font-geist-sans)] selection:bg-black selection:text-white">
      <section className="h-screen flex flex-col justify-between p-8 md:p-12 border-b-[12px] border-black">
        <nav className="flex justify-between items-start">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Young Investors Pty Ltd</div>
          <Link href="/kitchen">
            <button className="bg-black text-white px-6 py-2 font-mono text-xs hover:bg-gray-800 transition-all border border-black uppercase tracking-wider">
              Launch Terminal -&gt;
            </button>
          </Link>
        </nav>
        <div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase italic mb-6">We Cook.</h1>
          <p className="max-w-2xl text-xl md:text-2xl font-medium leading-relaxed text-gray-800">
            Bridging the gap between student liquidity and institutional assets through bimodal governance.
          </p>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-sm font-mono">EST. 2026 // MAKHANDA, SA</div>
          <div className="text-xs font-bold uppercase tracking-widest animate-bounce">Scroll for Briefing ↓</div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-12 border-b-2 border-black bg-gray-50 text-center">
        <h2 className="text-2xl font-bold uppercase mb-4">The Logic</h2>
        <p className="text-gray-500 max-w-lg mx-auto mb-12">The Bimodal Liquidity Bridge ensures that student capital is aggregated for institutional-grade execution.</p>
        <div className="flex justify-center">
             <div className="w-64 h-32 bg-gray-200 border-2 border-black rounded-t-full relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10 blur-xl"></div>
             </div>
        </div>
      </section>

      <footer className="py-12 px-8 md:px-12 bg-black text-white text-center">
        <p className="text-2xl italic font-serif mb-2">Young Investors</p>
        <p className="text-[10px] text-gray-500 font-mono">PREPARED FOR PROFESSOR BUNTING</p>
      </footer>
    </main>
  );
}
