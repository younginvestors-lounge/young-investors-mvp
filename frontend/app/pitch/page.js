'use client';
import { useState } from 'react';

export default function PitchDeck() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      // SLIDE 1: IDENTITY & MOTTO
      title: "YOUNG INVESTORS PTY LTD",
      subtitle: "The Governance Engine for Gen Z",
      content: (
        <div className="space-y-6">
          <div className="border-l-4 border-black pl-6 my-8">
            <h2 className="text-4xl font-bold italic tracking-tighter">"WE COOK."</h2>
            <p className="text-sm font-mono mt-2 text-gray-600">OFFICIAL MOTTO</p>
          </div>
          <p className="text-lg font-serif">
            A digitized collective investment ecosystem that combines institutional governance with cultural relatability.
          </p>
          <div className="flex justify-between text-xs font-mono uppercase border-t border-black pt-4">
             <span>Structure: Pty Ltd</span>
             <span>Stage: Live Prototype</span>
          </div>
        </div>
      )
    },
    {
      // SLIDE 2: THE FOUNDER'S STORY (UPDATED)
      title: "THE ORIGIN STORY",
      subtitle: "From Theory to 3 AM Execution",
      content: (
        <div className="space-y-4 font-serif text-lg leading-relaxed">
          <p>
            "I graduated with a <strong>Bachelor of Economics</strong>, yet I realized something terrifying: 
            I understood the <em>theory</em> of markets, but I had no idea how to actually <em>invest</em>."
          </p>
          
          <div className="bg-gray-100 p-4 border-l-4 border-black font-sans text-sm">
            <strong>The Spark (3:00 AM):</strong><br/>
            "This wasn't built in a boardroom. I woke up at 3 AM, opened my terminal, and just started <strong>vibe coding</strong>. 
            I needed to bridge the gap between my degree and my bank account. By sunrise, the 'Governance Engine' was alive."
          </div>

          <p className="text-xs font-mono text-gray-500 mt-2">
            - Denzel Zawani, CEO
          </p>
        </div>
      )
    },
    {
      // SLIDE 3: THE PROBLEM & STAT
      title: "THE MARKET GAP",
      subtitle: "Why Youth Don't Invest",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm">
          <div className="border border-black p-4 bg-black text-white">
            <strong className="block mb-2 text-xl text-red-500">THE STAT</strong>
            <p className="text-lg">
              Less than <strong>4%</strong> of South Africans directly own shares on the JSE.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              (Source: JSE Retail Participation Data)
            </p>
          </div>
          <div className="border border-black p-4">
            <strong className="block mb-2 text-lg">THE BARRIER: FEAR</strong>
            <p>
              For a student, the market is daunting. Minimum capital requirements are high, 
              and the risk of losing money <em>alone</em> is paralyzing.
            </p>
          </div>
        </div>
      )
    },
    {
      // SLIDE 4: THE SOLUTION (TEAMWORK)
      title: "THE SOLUTION",
      subtitle: "Low Capital & Collective Safety",
      content: (
        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-black pb-2">
            <strong className="text-lg">A. THE "SQUAD" EFFECT</strong>
          </div>
          <p className="text-sm">
            We replace "Solo Trading" with <strong>Collective Execution</strong>. By pooling funds:
          </p>
          <ul className="list-disc pl-5 text-sm font-mono space-y-2">
            <li><strong>Low Entry Barrier:</strong> Students can start with as little as R50.</li>
            <li><strong>Psychological Safety:</strong> You aren't guessing alone; you are voting with a team.</li>
          </ul>

          <div className="flex justify-between items-center border-b border-black pb-2 pt-4">
            <strong className="text-lg">B. THE "KITCHEN" LOGIC</strong>
          </div>
          <p className="text-xs font-mono mt-2 text-gray-600">
             We use the term "Kitchen" because a kitchen is where a team works together to create a result. 
             If the squad (60%) doesn't agree on the recipe (the trade), we don't cook.
          </p>
        </div>
      )
    },
    {
      // SLIDE 5: BUSINESS MODEL
      title: "REVENUE MODEL",
      subtitle: "Diversified Streams (B2C, B2B, B2I)",
      content: (
        <div className="space-y-4 font-mono text-sm">
          <div className="bg-gray-100 p-3 border-l-4 border-black">
            <strong>1. B2C (Direct to Student)</strong>
            <p className="text-xs mt-1">Freemium Model. Free "Sandbox" access; Subscription for premium "Live Kitchen" tools.</p>
          </div>

          <div className="bg-gray-100 p-3 border-l-4 border-black">
            <strong>2. B2I (Institutions)</strong>
            <p className="text-xs mt-1">SaaS Licensing to Investment Societies (ABSIP, Rhodes Econ). We provide the "Governance Infrastructure" for their funds.</p>
          </div>

          <div className="bg-gray-100 p-3 border-l-4 border-black">
            <strong>3. B2B (Banks/Corporates)</strong>
            <p className="text-xs mt-1">Talent Pipeline. We sell data insights on high-performing students to recruiters.</p>
          </div>
        </div>
      )
    },
    {
      // SLIDE 6: THE TEAM
      title: "THE DIRECTORS",
      subtitle: "Young Investors Pty Ltd",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono border-t border-black pt-4">
            <div>
                <p className="font-bold text-lg">DENZEL ZAWANI</p>
                <p className="text-gray-500">Chief Executive Officer (CEO)</p>
            </div>
            <div>
                <p className="font-bold text-lg">TINOMUDA BOPOTO</p>
                <p className="text-gray-500">Chief Technology Officer (CTO)</p>
            </div>
            <div>
                <p className="font-bold text-lg">LUBABALO JAWUKA</p>
                <p className="text-gray-500">Chief Operating Officer (COO)</p>
            </div>
            <div>
                <p className="font-bold text-lg">JOSH MAKORIE</p>
                <p className="text-gray-500">Chief Financial Officer (CFO)</p>
            </div>
            <div className="col-span-1 md:col-span-2 border-t border-gray-200 pt-2 mt-2">
                <p className="font-bold text-lg">GARY MUNYONGA</p>
                <p className="text-gray-500">Chief Marketing Officer (CMO)</p>
            </div>
        </div>
      )
    },
    {
      // SLIDE 7: SCALING & CONCLUSION
      title: "SCALING & GROWTH",
      subtitle: "From Rhodes to National Rollout",
      content: (
        <div className="space-y-6">
          <ul className="space-y-3 text-sm border-l-2 border-black pl-4">
            <li>
              <strong>PHASE 1 (NOW):</strong> 
              Validation at Rhodes University. Testing the "60% Rule" and Backend Stability.
            </li>
            <li>
              <strong>PHASE 2 (EXPANSION):</strong> 
              Onboarding 5 major SA campuses (UCT, Wits, Stellies) via the ABSIP network.
            </li>
            <li>
              <strong>PHASE 3 (ASSET CLASS):</strong> 
              Adding Global Markets, Crypto, and Bonds to the curriculum.
            </li>
          </ul>
          <div className="pt-6 border-t-4 border-black text-center">
            <p className="text-xl font-bold italic">"LET HIM COOK."</p>
            <p className="text-xs font-mono uppercase mt-1">READY FOR DEPLOYMENT</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-white text-black p-8 md:p-12 font-sans border-[12px] border-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter italic uppercase">
            Start-Up Deck.
          </h1>
          <p className="text-xs font-mono mt-2">YOUNG INVESTORS PTY LTD</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-mono">CONFIDENTIAL</p>
          <p className="text-xs font-mono">PREPARED FOR: MARK BUNTING</p>
        </div>
      </header>

      {/* SLIDE CONTENT */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div className="mb-4">
            <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                SLIDE 0{activeSlide + 1} / 0{slides.length}
            </span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-serif mb-2 uppercase">{slides[activeSlide].title}</h2>
        <p className="text-lg md:text-xl font-mono text-gray-500 mb-8 uppercase tracking-widest">
            {slides[activeSlide].subtitle}
        </p>
        
        <div className="text-lg md:text-xl leading-relaxed">
            {slides[activeSlide].content}
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <footer className="flex justify-between items-center border-t-4 border-black pt-6 mt-8">
        <button 
            onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
            disabled={activeSlide === 0}
            className="text-xl font-bold hover:bg-black hover:text-white px-6 py-2 border-2 border-black disabled:opacity-30 transition-all"
        >
            ← PREV
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
            className="text-xl font-bold hover:bg-black hover:text-white px-6 py-2 border-2 border-black disabled:opacity-30 transition-all"
        >
            NEXT →
        </button>
      </footer>

    </main>
  );
}
