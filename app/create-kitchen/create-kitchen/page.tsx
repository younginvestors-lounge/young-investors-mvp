"use client"
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupKitchen() {
  const params = useParams();
  const router = useRouter();
  const style = params.style as string;
  const [kitchenName, setKitchenName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate contract deployment delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto py-20">
        <div className="mb-8">
          <Link href="/create-kitchen" className="text-zinc-500 text-[10px] font-[900] uppercase tracking-widest hover:text-[#00FF41] transition-colors">
            ← Back to Selection
          </Link>
        </div>

        <h1 className="text-6xl font-[900] tracking-[-0.07em] uppercase mb-4">
          Setup {style === 'hedge' ? 'High-Heat' : 'Slow-Cook'}<br/>Kitchen
        </h1>
        <p className="text-zinc-500 font-medium mb-12 tracking-tight">
          Configure your investment group parameters.
        </p>

        <div className="space-y-8 mb-12">
          <div className="space-y-2">
            <label className="text-[10px] font-[900] uppercase tracking-widest text-zinc-400">Kitchen Name</label>
            <input 
              type="text" 
              value={kitchenName}
              onChange={(e) => setKitchenName(e.target.value)}
              placeholder="e.g. The Sunday Club"
              className="w-full bg-zinc-950 border border-white/10 p-4 text-white font-bold focus:outline-none focus:border-[#00FF41] transition-colors rounded-lg"
            />
          </div>

          <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
            <h3 className="text-[10px] font-[900] uppercase tracking-widest mb-4 text-[#00FF41]">Constitution Preview</h3>
            <ul className="space-y-3 text-xs text-zinc-500 font-mono">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Governance Model</span>
                <span className="text-white uppercase">{style === 'hedge' ? 'High-Heat' : 'Slow-Cook'}</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Quorum Requirement</span>
                <span className="text-white">{style === 'hedge' ? '60% (3/5)' : '80% (4/5)'}</span>
              </li>
              <li className="flex justify-between">
                <span>Max. Asset Exposure</span>
                <span className="text-white">{style === 'hedge' ? 'R15,000' : 'R5,000'}</span>
              </li>
            </ul>
          </div>
        </div>

        <button 
          onClick={handleDeploy}
          disabled={isDeploying}
          className={`w-full py-5 font-[900] text-sm uppercase tracking-widest rounded-lg transition-all ${isDeploying ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-white text-black hover:bg-[#00FF41]'}`}
        >
          {isDeploying ? 'Deploying Contract...' : 'Deploy Kitchen Contract'}
        </button>
      </div>
    </div>
  );
}