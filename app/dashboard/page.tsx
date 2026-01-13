"use client"
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 1. Rename your current function to DashboardContent
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenStyle = searchParams.get('style') || 'hedge';
  const kitchenName = searchParams.get('name');

  const [prices, setPrices] = useState({ sasol: 184.50, capitec: 2150.00 });
  const [logs, setLogs] = useState([
    { id: 1, time: '23:14:01', msg: 'ENCRYPTED_SESSION_START', type: 'info' },
    { id: 2, time: '23:15:12', msg: 'LIQUIDITY_BUFFER_OK', type: 'success' }
  ]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  // ADD THIS STATE AT THE TOP OF DashboardContent
const [passedQuiz, setPassedQuiz] = useState(false);

{/* RESTORED QUIZ SECTION */}
{!passedQuiz && (
  <div className="precision-card p-8 bg-[#00FF41]/10 border border-[#00FF41] mb-8 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-2 h-2 bg-[#00FF41] rounded-full" />
      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">Governance_Certification_Required</h3>
    </div>
    <p className="text-xl font-[900] uppercase tracking-tighter mb-6">
      Do you agree to abide by the consensus of the Kitchen and never trade without a 3/5 majority?
    </p>
    <button 
      onClick={() => setPassedQuiz(true)}
      className="w-full py-4 bg-[#00FF41] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
    >
      I_CONFIRM_UNDERSTANDING
    </button>
  </div>
)}

{passedQuiz && (
  <div className="text-[10px] font-black text-[#00FF41] mb-4 uppercase tracking-[0.3em]">
    ✓ Governance_Certified_User_Active
  </div>
)}

  // JSE LIVE FEED SIMULATOR
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => ({
        sasol: prev.sasol + (Math.random() * 2 - 1),
        capitec: prev.capitec + (Math.random() * 10 - 5)
      }));

      if (Math.random() > 0.85) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const events = ["VOLATILITY_SYNC_OK", "JSE_API_HEARTBEAT", "LIQUIDITY_CHECK_PASSED"];
        const randomMsg = events[Math.floor(Math.random() * events.length)];
        
        setLogs(prev => [{ 
          id: Date.now(), 
          time, 
          msg: randomMsg, 
          type: 'info' 
        }, ...prev].slice(0, 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 font-sans">
      <nav className="max-w-7xl mx-auto h-24 flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col leading-none cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Young</span>
          <span className="text-3xl font-[900] tracking-[-0.07em] uppercase">Investors</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/create-kitchen')}
            className="text-zinc-500 hover:text-white text-[10px] font-[900] uppercase tracking-widest transition-colors"
          >
            ← Exit Kitchen
          </button>

          <div className={`px-4 py-2 rounded-sm text-[10px] font-[900] uppercase tracking-tighter ${userLevel >= 2 ? 'bg-[#00FF41] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {userLevel === 1 ? 'Apprentice' : 'Sous-Chef'}
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="text-zinc-500 hover:text-red-500 text-[10px] font-[900] uppercase tracking-widest transition-colors"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-8">
             <h1 className="text-4xl font-[900] uppercase tracking-tighter mb-2">
              {kitchenName || 'My Kitchen'}
            </h1>
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
              <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
              LIVE_JSE_FEED_ACTIVE
            </div>
          </div>

          {/* PRICES GRID */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
              <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-2">Sasol Ltd</div>
              <div className="text-3xl font-[900] tracking-tighter">R{prices.sasol.toFixed(2)}</div>
            </div>
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
              <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-2">Capitec Bank</div>
              <div className="text-3xl font-[900] tracking-tighter">R{prices.capitec.toFixed(2)}</div>
            </div>
          </div>

          {/* LOGS */}
          <div className="bg-zinc-950 border border-white/10 rounded-lg p-6 font-mono text-xs">
            <div className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest mb-4">System Logs</div>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-zinc-600">{log.time}</span>
                  <span className={log.type === 'success' ? 'text-[#00FF41]' : 'text-zinc-300'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          {/* KITCHEN CONSTITUTION BOX */}
          <div className="precision-card p-6 bg-[#00FF41]/5 border border-[#00FF41]/20 mb-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-[900] uppercase tracking-widest text-[#00FF41]">Active_Constitution</h3>
              <span className="text-[8px] bg-[#00FF41] text-black px-2 py-0.5 font-black rounded-sm uppercase">{kitchenStyle === 'mutual' ? 'Slow_Cook_Style' : 'Hedge_Fund_Style'}</span>
            </div>
            <ul className="space-y-2 text-[10px] font-medium text-zinc-400">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Min. Approval Quorum</span>
                <span className="text-white">{kitchenStyle === 'mutual' ? '80% (4/5)' : '60% (3/5)'}</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Max. Asset Exposure</span>
                <span className="text-white">{kitchenStyle === 'mutual' ? 'R5,000 / Trade' : 'R15,000 / Trade'}</span>
              </li>
              <li className="flex justify-between">
                <span>Asset Universe</span>
                <span className="text-white">JSE_TOP_40 + TECH</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 p-8 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-[900] uppercase tracking-tighter mb-2">Confirm Exit</h3>
            <p className="text-zinc-500 text-xs font-medium mb-8">Are you sure you want to log out of your session?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-zinc-900 text-white font-[900] text-[10px] uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => router.push('/')} className="flex-1 py-3 bg-white text-black font-[900] text-[10px] uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Export a main Dashboard function that wraps the content in Suspense
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00FF41] font-[900] uppercase tracking-[0.3em] animate-pulse">
          INITIALIZING_TERMINAL...
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
