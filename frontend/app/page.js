'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* SECTION 1: HERO & NAVIGATION */}
      <section className="h-screen flex flex-col justify-between p-8 md:p-12 border-b-[12px] border-black">
        <nav className="flex justify-between items-start">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Young Investors Pty Ltd</div>
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
          <p className="max-w-2xl text-xl md:text-2xl font-medium leading-relaxed text-gray-800">
            Bridging the gap between student liquidity and institutional assets through bimodal governance.
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="text-sm font-mono">
            EST. 2026 // MAKHANDA, SA
          </div>
          <div className="text-xs font-bold uppercase tracking-widest animate-bounce">
            Scroll for Briefing ↓
          </div>
        </div>
      </section>

      {/* SECTION 2: THE BIMODAL LOGIC */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black bg-gray-50 text-center">
        <h2 className="text-2xl font-bold uppercase mb-4">The Logic</h2>
        <p className="text-gray-500 max-w-lg mx-auto mb-12">
            The Bimodal Liquidity Bridge ensures that student capital is aggregated for institutional-grade execution.
        </p>
        
        {/* CSS Only Bimodal Graph */}
        <div className="flex justify-center">
             <div className="w-full max-w-md h-40 bg-white border-2 border-black relative overflow-hidden rounded-xl">
                {/* Left Peak */}
                <div className="absolute bottom-0 left-8 w-24 h-24 bg-gray-300 rounded-t-full"></div>
                <div className="absolute bottom-2 left-10 text-[10px] font-bold">STUDENTS</div>
                
                {/* Right Peak */}
                <div className="absolute bottom-0 right-8 w-32 h-32 bg-black rounded-t-full"></div>
                <div className="absolute bottom-2 right-12 text-[10px] text-white font-bold">INSTITUTIONAL</div>
                
                {/* Bridge */}
                <div className="absolute bottom-0 left-20 right-20 h-8 bg-gray-200 opacity-50 blur-md"></div>
             </div>
        </div>
      </section>

      {/* SECTION 3: THE BOARD */}
      <section className="py-24 px-8 md:px-12 border-b-2 border-black">
        <h2 className="text-4xl font-bold uppercase mb-12 flex items-center gap-4">
            <span className="w-4 h-4 bg-black block"></span>
            The Board
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="border border-black p-6 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-2xl font-serif italic mb-2">Denzel</h3>
            <p className="text-xs font-bold uppercase tracking-widest mb-4">Chief Executive Officer</p>
            <p className="text-sm opacity-80">Vision, Strategy, and Institutional Partnerships.</p>
          </div>

          <div className="border border-black p-6 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-2xl font-serif italic mb-2">Tino</h3>
            <p className="text-xs font-bold uppercase tracking-widest mb-4">Chief Technology Officer</p>
            <p className="text-sm opacity-80">Kitchen Architecture and Governance Algorithms.</p>
          </div>

          <div className="border border-black p-6 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-2xl font-serif italic mb-2">Luba</h3>
            <p className="text-xs font-bold uppercase tracking-widest mb-4">Operations Director</p>
            <p className="text-sm opacity-80">Grahamstown Logistics and Student Acquisition.</p>
          </div>

          <div className="border border-black p-6 hover:bg-black hover:text-white transition-colors">
            <h3 className="text-2xl font-serif italic mb-2">Josh</h3>
            <p className="text-xs font-bold uppercase tracking-widest mb-4">Legal & Compliance</p>
            <p className="text-sm opacity-80">FSCA Alignment and Governance Frameworks.</p>
          </div>

        </div>
      </section>

      {/* SECTION 4: REVENUE & FOOTER */}
      <section className="py-24 px-8 md:px-12 bg-black text-white">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-12 md:mb-0">
            <h2 className="text-4xl font-bold uppercase mb-6">Revenue Model</h2>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center gap-4">
                <span className="w-4 h-4 bg-white block"></span>
                <span>2.5% Management Fee on Kitchen Assets</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-4 h-4 bg-gray-500 block"></span>
                <span>15% Performance Fee (High Water Mark)</span>
              </li>
            </ul>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 mb-2">CONFIDENTIAL</p>
            <p className="text-2xl font-serif">Young Investors Pty Ltd</p>
            <p className="text-sm text-gray-500 mt-2">© 2026. All Rights Reserved.</p>
            <p className="text-xs text-gray-600 mt-8">Prepared for Professor Mark Bunting</p>
          </div>
        </div>
      </section>

    </main>
  );
}
