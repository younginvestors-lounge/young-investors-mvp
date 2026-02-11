'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Kitchen() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/kitchen/')
      .then((res) => res.json())
      .then((data) => setProposals(data))
      .catch((err) => console.log("Backend offline"));
  }, []);

  return (
    <main className="min-h-screen bg-white text-black p-8 border-[12px] border-black font-sans">
      <header className="flex justify-between items-end border-b-4 border-black pb-6 mb-12">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold uppercase italic">The Kitchen.</h1>
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Terminal 01 // Monitoring</p>
        </div>
        <Link href="/">
          <button className="text-[10px] font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-all uppercase">
            Back to Briefing
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {proposals.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-gray-300 text-center">
            <p className="font-mono text-gray-400">UPLINK PENDING: 127.0.0.1:8000</p>
          </div>
        ) : (
          proposals.map((item) => (
            <div key={item.id} className="border-2 border-black p-6">
              <h2 className="text-4xl font-serif">{item.ticker}</h2>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
