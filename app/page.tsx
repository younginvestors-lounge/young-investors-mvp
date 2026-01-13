'use client'; 
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-money-green font-mono flex flex-col items-center justify-center p-4">
      <div className="border-2 border-money-green p-10 max-w-md w-full shadow-[0_0_20px_rgba(0,255,65,0.2)]">
        
<h1 className="text-7xl md:text-9xl font-[900] tracking-[-0.07em] uppercase leading-[0.85]">
  Young<br/>Investors
</h1>
        <p className="text-[10px] mb-8 text-center opacity-70 uppercase tracking-widest">
          Sandboxed Wealth Academy
        </p>
        
        <div className="space-y-4 mb-10 text-xs">
          <p className="border-l-2 border-white pl-2 uppercase">System: Online</p>
          <p className="border-l-2 border-white pl-2 uppercase">Ping: 6ms</p>
        </div>

        <Link href="/kitchen-type">
  <button className="w-full py-3 bg-money-green text-black font-bold text-sm uppercase tracking-widest hover:bg-opacity-80 transition-all">ENTER_TERMINAL</button>
</Link>

      </div>
    </main>
  );
}