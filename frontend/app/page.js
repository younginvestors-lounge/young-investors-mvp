'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LegalPitchDeck() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      // SLIDE 1: IDENTITY & LEGAL STATUS
      title: "YOUNG INVESTORS PTY LTD",
      subtitle: "Corporate & Regulatory Overview",
      content: (
        <div className="space-y-6">
          <div className="border-l-4 border-black pl-6 my-8">
            <h2 className="text-4xl font-bold italic tracking-tighter">"WE COOK."</h2>
            <p className="text-sm font-mono mt-2 text-gray-600">BIMODAL GOVERNANCE ENGINE</p>
          </div>
          <p className="text-lg font-serif">
            A proprietary financial technology layer designed to aggregate retail capital through algorithmic democratic consensus.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono uppercase border-t border-black pt-4">
             <div>
                <span className="block font-bold text-gray-500">Entity Status</span>
                <span>CIPC Registered (For-Profit)</span>
             </div>
             <div>
                <span className="block font-bold text-gray-500">Target Framework</span>
                <span>FSCA Regulatory Sandbox</span>
             </div>
          </div>
        </div>
      )
    },
    {
      // SLIDE 2: COMMERCIAL LOGIC
      title: "COMMERCIAL LOGIC",
      subtitle: "The Non-Custodial Gateway",
      content: (
        <div className="space-y-4 font-serif text-lg leading-relaxed">
          <p>
            Traditional funds pool capital and assume high fiduciary liability. Young Investors operates as a <strong>Technology Enabler</strong>, not a depository bank.
          </p>
          
          <div className="bg-gray-100 p-4 border-l-4 border-black font-sans text-sm">
            <strong>The Architecture:</strong><br/>
            Users retain capital in their own brokerage accounts. Our application provides the "Voting Interface." Once a 60% algorithmic consensus is reached, the system executes the trade via API. 
          </div>
        </div>
      )
    },
    {
      // SLIDE 3: LEGAL QUERIES (REGULATORY)
      title: "QUERIES: REGULATORY",
      subtitle: "FAIS, CISCA & Capital Reserves",
      content: (
        <div className="space-y-4 font-mono text-sm">
          <p className="font-serif text-lg mb-2">For review by Adv. S. Rahim & Committee:</p>
          
          <div className="border border-black p-3">
            <strong className="block mb-1">1. The FAIS Act (Voting Logic vs. Discretion)</strong>
            <p className="text-gray-700">If we operate strictly as a Non-Custodial API Gateway where trades only execute upon 60% algorithmic consensus, does this remove our "discretion", thereby exempting us from needing a Category II FSP License?</p>
          </div>

          <div className="border border-black p-3">
            <strong className="block mb-1">2. CISCA (Fund Classification)</strong>
            <p className="text-gray-700">Does aggregating retail voting power (without pooling cash into our corporate bank accounts) protect us from classification as an unregistered Collective Investment Scheme (CIS)?</p>
          </div>

          <div className="border border-black p-3 bg-black text-white">
            <strong className="block mb-1">3. Capital Reserves (FSCA Sandbox)</strong>
            <p className="text-gray-300">To test this micro-credential and trading loop within the FSCA Regulatory Sandbox, what are the hard minimum capital reserve thresholds required?</p>
          </div>
        </div>
      )
    },
    {
      // SLIDE 4: LEGAL QUERIES (COMMERCIAL & IP)
      title: "QUERIES: IP & CONTRACTS",
      subtitle: "Liability, Patents & Licensing",
      content: (
        <div className="space-y-4 font-mono text-sm">
          
          <div className="border-l-4 border-black pl-4">
            <strong className="block mb-1 text-base">4. Liability Firewall (Trading Partner MoU)</strong>
            <p className="text-gray-700">Ahead of our meeting with the Trading Provider CEO: How do we ring-fence Young Investors legally? If the broker's API fails, what specific indemnity clauses ensure liability sits with their execution engine, not our software?</p>
          </div>

          <div className="border-l-4 border-black pl-4">
            <strong className="block mb-1 text-base">5. Intellectual Property (Interim Protection)</strong>
            <p className="text-gray-700">With formal patent costs projected around R15,000, what interim protections (e.g., CIPC provisional filings, codebase copyright, trade secret documentation) can secure the "Bimodal Consensus Engine" while we raise capital?</p>
          </div>

          <div className="border-l-4 border-black pl-4">
            <strong className="block mb-1 text-base">6. The Rhodes Partnership (Micro-Credential)</strong>
            <p className="text-gray-700">How do we structure an educational licensing agreement with Rhodes Business School to distribute our Financial Literacy Academy module, strictly without ceding equity or core technology IP to the University?</p>
          </div>

        </div>
      )
    },
    {
      // SLIDE 5: THE BOARD
      title: "THE BOARD",
      subtitle: "Young Investors Pty Ltd",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-black pt-4">
            <div>
                <p className="font-bold text-base">DENZEL ZAWANI</p>
                <p className="text-gray-500">Chief Executive Officer</p>
            </div>
            <div>
                <p className="font-bold text-base">MUNASHE SITHOLE</p>
                <p className="text-gray-500">Chief Legal Officer</p>
                <p className="text-[10px] text-gray-400 italic">BCom Law - Regulatory & MoUs</p>
            </div>
            <div>
                <p className="font-bold text-base">TINOMUDA BOPOTO</p>
                <p className="text-gray-500">Chief Technology Officer</p>
            </div>
            <div>
                <p className="font-bold text-base">JOSH MAKORIE</p>
                <p className="text-gray-500">Chief Financial Officer</p>
            </div>
            <div>
                <p className="font-bold text-base">LUBABALO JAWUKA</p>
                <p className="text-gray-500">Chief Operating Officer</p>
            </div>
            <div>
                <p className="font-bold text-base">GARY MUNYONGA</p>
                <p className="text-gray-500">Chief Marketing Officer</p>
            </div>
        </div>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-white text-black p-8 md:p-12 font-sans border-[12px] border-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start border-b-4 border-black pb-6 mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter italic uppercase">
            Legal Briefing.
          </h1>
          <p className="text-xs font-mono mt-2">FOR: ADV. S. RAHIM & RHODES BUSINESS SCHOOL</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Link href="/kitchen">
                <button className="bg-black text-white px-4 py-2 font-mono text-xs hover:bg-gray-800 transition-all border border-black uppercase tracking-wider">
                    Launch Tech Prototype &rarr;
                </button>
            </Link>
          <div className="text-right hidden md:block mt-2">
            <p className="text-[10px] font-mono">CONFIDENTIAL // CIPC REGISTERED</p>
          </div>
        </div>
      </header>

      {/* SLIDE CONTENT */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full min-h-[400px]">
        <div className="mb-4">
            <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                EXHIBIT 0{activeSlide + 1} / 0{slides.length}
            </span>
        </div>
        
        <h2 className="text-3xl md:text-6xl font-serif mb-2 uppercase">{slides[activeSlide].title}</h2>
        <p className="text-sm md:text-xl font-mono text-gray-500 mb-8 uppercase tracking-widest">
            {slides[activeSlide].subtitle}
        </p>
        
        <div className="text-base md:text-lg leading-relaxed">
            {slides[activeSlide].content}
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <footer className="flex justify-between items-center border-t-4 border-black pt-6 mt-8">
        <button 
            onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
            disabled={activeSlide === 0}
            className="text-sm md:text-xl font-bold hover:bg-black hover:text-white px-6 py-2 border-2 border-black disabled:opacity-30 transition-all"
        >
            &larr; PREV
        </button>
        
        <div className="flex space-x-2">
            {slides.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2 w-2 rounded-full ${idx === activeSlide ? 'bg-black' : 'bg-gray-300'}`}
                />
            ))}
        </div>

        <button 
            onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
            disabled={activeSlide === slides.length - 1}
            className="text-sm md:text-xl font-bold hover:bg-black hover:text-white px-6 py-2 border-2 border-black disabled:opacity-30 transition-all"
        >
            NEXT &rarr;
        </button>
      </footer>

    </main>
  );
}
