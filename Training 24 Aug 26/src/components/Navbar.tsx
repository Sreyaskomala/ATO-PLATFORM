'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Layers, ShieldCheck, Users, PlusCircle, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { organisation, fleets, simulators, instructors, batches, setActiveTab } = useStore();

  const activeSims = simulators.filter((s) => s.resource_category === 'FFS' && s.status === 'AVAILABLE').length;

  return (
    <header className="h-20 border-b border-aviation-800/80 bg-aviation-900/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl text-white tracking-wide">
              AeroMatrix <span className="text-skyline-400">ATO Platform</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded-full bg-skyline-500/10 border border-skyline-500/30 text-skyline-400">
              DGCA CAR CAR-FSTD Level D
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {organisation.trading_name} • Fleet TR: A320, B737, ATR 72-600, Q400
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Quick HUD Metrics */}
        <div className="hidden lg:flex items-center gap-6 border-r border-aviation-800 pr-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aviation-800 flex items-center justify-center text-skyline-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Batches</div>
              <div className="text-xs font-semibold text-white font-mono">{batches.length} Programs</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aviation-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Level-D FFS</div>
              <div className="text-xs font-semibold text-emerald-400 font-mono">{activeSims} Available</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aviation-800 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Instructors</div>
              <div className="text-xs font-semibold text-white font-mono">{instructors.length} GI/SFI/SFE</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setActiveTab('scheduler')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-skyline-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Operational Scheduler</span>
        </button>
      </div>
    </header>
  );
};
