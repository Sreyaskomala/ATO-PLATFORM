'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Layers, Cpu, ShieldCheck, Plane } from 'lucide-react';

export const FleetResources: React.FC = () => {
  const { fleets, simulators } = useStore();

  return (
    <div className="space-y-6">
      {/* Header Intro */}
      <div className="p-6 rounded-2xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-skyline-500/10 border border-skyline-500/30 flex items-center justify-center text-skyline-400 shrink-0">
          <Plane className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl text-white">Multi-Fleet Aircraft & FSTD Simulator Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Certified Training Devices for Airbus A320, Boeing B737, ATR 72-600, and DHC-8 Q400 fleets with Level D DGCA/EASA approvals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Simulators & Resources */}
        <div className="p-6 rounded-2xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-heading font-bold text-lg text-white">FSTD Simulator Bays & Classrooms</h3>
          </div>

          <div className="space-y-4">
            {simulators.map((res) => (
              <div key={res.id} className="p-4 rounded-xl bg-aviation-950 border border-aviation-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{res.resource_name}</h4>
                    <span className="text-xs text-slate-400">{res.bay_location} • {res.level}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      res.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">Supported Fleets:</span>
                  {res.supported_aircraft_names.map((ac) => (
                    <span key={ac} className="px-2 py-0.5 rounded bg-aviation-900 border border-aviation-750 text-[10px] font-mono text-skyline-300">
                      {ac}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-aviation-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {res.approval_authority}: {res.approval_number}
                  </span>
                  <span>Expires: {res.approval_expiry}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aircraft Fleets Master Data */}
        <div className="p-6 rounded-2xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-skyline-400" />
            <h3 className="font-heading font-bold text-lg text-white">ATO Aircraft Fleets Master Data</h3>
          </div>

          <div className="space-y-4">
            {fleets.map((fleet) => (
              <div key={fleet.id} className="p-4 rounded-xl bg-aviation-950 border border-aviation-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white">
                      {fleet.manufacturer} {fleet.model_name}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-skyline-500/10 text-skyline-400 border border-skyline-500/30">
                      {fleet.type_rating_code}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {fleet.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">ACTIVE TR COURSE</span>
                </div>

                <p className="text-xs text-slate-400">{fleet.description}</p>
                <div className="text-[10px] font-mono text-slate-500">Variants: {fleet.variant}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
