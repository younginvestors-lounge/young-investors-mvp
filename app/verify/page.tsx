"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FICAVerification() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const handleComplete = () => {
    setUploading(true);
    // Simulate biometric & database handshake with Home Affairs/FIC
    setTimeout(() => {
      router.push('/dashboard?verified=true');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center justify-center">
      <div className="max-w-xl w-full">
        {/* REGULATORY HEADER */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
            SECURE_FICA_GATEWAY // ACT_38_OF_2001
          </span>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl font-[900] uppercase tracking-tighter leading-[0.9] mb-6">
              Identity<br/>Authentication
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
              To activate your investment kitchen, we must verify your status against the Financial Intelligence Centre database.
            </p>
            
            <div className="space-y-4 mb-10">
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">SA ID Number</label>
                <input 
                  type="text" 
                  maxLength={13}
                  placeholder="000000 0000 00 0" 
                  className="w-full bg-black border-b border-white/20 p-2 text-2xl font-black tracking-[0.2em] focus:border-[#00FF41] outline-none transition-all placeholder:text-zinc-900" 
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-6 bg-white text-black font-[900] text-xs uppercase tracking-[0.3em] hover:bg-[#00FF41] transition-all"
            >
              Next_Step: Document_Upload
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-[900] uppercase tracking-tighter mb-4">Verification Documents</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="aspect-square bg-zinc-950 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#00FF41]/40 cursor-pointer transition-all group">
                <div className="text-[20px] group-hover:scale-110 transition-transform">🪪</div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Upload ID Photo</span>
              </div>
              <div className="aspect-square bg-zinc-950 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#00FF41]/40 cursor-pointer transition-all group">
                <div className="text-[20px] group-hover:scale-110 transition-transform">🏠</div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Proof of Address</span>
              </div>
            </div>

            <button 
              onClick={handleComplete}
              disabled={uploading}
              className="w-full py-6 bg-[#00FF41] text-black font-[900] text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50"
            >
              {uploading ? "VERIFYING_WITH_AUTHORITIES..." : "FINALIZE_CERTIFICATION"}
            </button>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full mt-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-all"
            >
              ← Back to Details
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex justify-between items-center opacity-30">
            <span className="text-[8px] font-bold uppercase tracking-widest">SHA-256 Encryption</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#00FF41]">POPIA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
