'use client'; 

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-money-green font-mono flex flex-col items-center justify-center p-4">
      <div className="border-2 border-money-green p-10 max-w-md w-full shadow-[0_0_20px_rgba(0,255,65,0.2)]">
        
        <h1 className="text-3xl font-bold mb-2 tracking-tighter text-center uppercase">
          Young Investors
        </h1>
        <p className="text-[10px] mb-8 text-center opacity-70 uppercase tracking-widest">
          Sandboxed Wealth Academy
        </p>
        
        <div className="space-y-4 mb-10 text-xs">
          <p className="border-l-2 border-white pl-2 uppercase">System: Online</p>
          <p className="border-l-2 border-white pl-2 uppercase">Ping: 6ms</p>
        </div>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-money-green text-black py-4 font-black hover:bg-white hover:scale-[1.02] transition-all uppercase"
        >
          {">"} Initialize Login
        </button>
      </div>
    </main>
  );
}