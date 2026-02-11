'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [proposals, setProposals] = useState([]);

  // Fetch data from your Django Backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/kitchen/')
      .then((res) => res.json())
      .then((data) => setProposals(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <main className="min-h-screen bg-white text-black p-8 md:p-12 font-sans border-[12px] border-black">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-6 mb-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter italic uppercase">
            The Kitchen.
          </h1>
          <p className="text-sm font-bold tracking-[0.3em] mt-2 uppercase text-gray-600">
            Young Investors Academy // Terminal 01
          </p>
        </div>
        <div className="text-right mt-6 md:mt-0">
          <p className="text-xs font-mono border border-black px-2 py-1 inline-block">
            LIVE FEED: JSE EQUITIES
          </p>
        </div>
      </header>

      {/* BIMODAL LOGIC VISUAL (Added) */}
      <section className="mb-12 flex flex-col md:flex-row items-center justify-between border-2 border-dashed border-gray-300 p-6 bg-gray-50">
        <div className="md:w-1/2 mb-4 md:mb-0">
            <h3 className="font-bold text-xl uppercase mb-2">The Logic</h3>
            <p className="font-mono text-xs text-gray-600 max-w-md">
                We bridge the gap between low-capital students (Left Peak) and high-value institutional assets (Right Peak) through collective governance.
            </p>
        </div>
        
        {/* The CSS Graph */}
        <div className="relative w-full md:w-1/2 h-32 bg-white rounded-lg overflow-hidden border border-gray-200">
            {/* Peak 1: Students */}
            <div className="absolute bottom-0 left-10 w-20 h-16 bg-black opacity-90 rounded-t-full z-10"></div>
            <div className="absolute bottom-2 left-12 text-white text-[10px] font-bold z-20">STUDENTS</div>
            
            {/* Peak 2: Market */}
            <div className="absolute bottom-0 right-10 w-32 h-24 bg-gray-500 opacity-90 rounded-t-full z-10"></div>
            <div className="absolute bottom-2 right-16 text-white text-[10px] font-bold z-20">MARKET</div>
            
            {/* The Connector */}
            <div className="absolute bottom-0 left-20 right-20 h-8 bg-gray-300 opacity-50 rounded-t-full blur-sm"></div>
        </div>
      </section>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Loop through proposals */}
        {proposals.map((item) => (
          <div key={item.id} className="group border-2 border-black p-6 hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">
            
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-6xl font-serif">{item.ticker}</h2>
              <span className="text-xs font-bold border border-black group-hover:border-white px-2 py-1 uppercase">
                {item.action}
              </span>
            </div>

            <div className="space-y-4 font-mono text-sm border-t border-black group-hover:border-white pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500 group-hover:text-gray-400">QTY</span>
                <span className="font-bold">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 group-hover:text-gray-400">PRICE</span>
                <span className="font-bold">R {item.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 group-hover:text-gray-400">STATUS</span>
                <span className={item.is_executed ? "text-green-600 font-bold" : "text-gray-400"}>
                  {item.is_executed ? 'EXECUTED' : 'VOTING OPEN'}
                </span>
              </div>
            </div>

            {/* Voting Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>CONSENSUS</span>
                <span>{item.approval_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1">
                <div 
                  className="bg-black group-hover:bg-white h-1 transition-all duration-1000" 
                  style={{ width: `${item.approval_rate}%` }}
                ></div>
              </div>
            </div>

          </div>
        ))}

        {/* Empty State */}
        {proposals.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 border-2 border-dashed border-gray-300">
              <p className="font-mono text-gray-400">CONNECTING TO KITCHEN SERVER...</p>
              <p className="text-xs text-gray-300 mt-2">(Make sure Django is running)</p>
            </div>
        )}

      </div>
    </main>
  );
}
