'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import {
  GraduationCap,
  Plane,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Cpu,
  Award,
  ChevronRight,
  Plus,
} from 'lucide-react';

export const BatchPipeline: React.FC = () => {
  const { batches, students, setSelectedBatchId, setActiveTab, setIsCreateBatchModalOpen } = useStore();

  const handleScheduleForBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setActiveTab('scheduler');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-skyline-400" />
            <h2 className="font-heading font-extrabold text-2xl text-white">Batch Training Progression Pipeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end type rating lifecycle: Technical & Performance Ground Classes (GIs) → Simulator FTD & FFS Training (SFIs) → CA-40 Skill Test (SFEs)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-2 rounded-xl bg-aviation-950 border border-aviation-750 font-mono text-xs text-slate-300">
            {batches.length} Active Batches
          </span>

          <button
            onClick={() => setIsCreateBatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Batch</span>
          </button>
        </div>
      </div>

      {/* Batches Pipeline Cards */}
      <div className="grid grid-cols-1 gap-6">
        {batches.map((batch) => {
          const batchStudents = students.filter((s) => s.batch_id === batch.id);

          const isGroundComplete = batchStudents.every((s) => s.ground_tech_completed && s.ground_perf_completed);
          const isSimComplete = batchStudents.every((s) => s.sim_hours_completed >= 16.0);

          return (
            <div
              key={batch.id}
              className="p-6 rounded-2xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl hover:border-aviation-700 transition-all space-y-6"
            >
              {/* Batch Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-skyline-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan font-heading font-extrabold text-sm">
                    {batch.aircraft_type_name.split(' ')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-bold text-lg text-white">{batch.batch_name}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-skyline-500/10 border border-skyline-500/30 text-skyline-400">
                        {batch.batch_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Airline: <strong className="text-slate-200">{batch.airline_operator}</strong></span>
                      <span>•</span>
                      <span>Fleet: <strong className="text-skyline-400">{batch.aircraft_type_name}</strong></span>
                      <span>•</span>
                      <span>Cadets: <strong className="text-slate-200">{batchStudents.length} Enrolled</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleScheduleForBatch(batch.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aviation-950 border border-skyline-500/40 hover:bg-skyline-500/10 text-skyline-400 text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Schedule Sessions for Batch</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3-Stage Lifecycle Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Stage 1: Ground School Phase */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isGroundComplete
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100'
                      : batch.current_phase === 'GROUND_TECH' || batch.current_phase === 'GROUND_PERF'
                      ? 'bg-skyline-500/10 border-skyline-500/40 shadow-glow-cyan text-white'
                      : 'bg-aviation-950 border-aviation-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-skyline-400" />
                      <span className="font-heading font-semibold text-xs tracking-wider uppercase">
                        Stage 1: Ground School
                      </span>
                    </div>
                    {isGroundComplete ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> CLEARED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-skyline-400 bg-skyline-500/10 px-2 py-0.5 rounded">
                        ACTIVE PHASE
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    <div>• <strong>Tech GI:</strong> Systems, Electrics & Avionics</div>
                    <div className="mt-0.5">• <strong>Perf GI / SME:</strong> W&B, Charts, Flight Planning</div>
                  </div>
                </div>

                {/* Stage 2: Simulator Training Phase */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isSimComplete
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100'
                      : batch.current_phase === 'SIM_FFS' || batch.current_phase === 'SIM_FTD'
                      ? 'bg-skyline-500/10 border-skyline-500/40 shadow-glow-cyan text-white'
                      : !isGroundComplete
                      ? 'bg-aviation-950/40 border-aviation-850 opacity-60 text-slate-500'
                      : 'bg-aviation-950 border-aviation-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span className="font-heading font-semibold text-xs tracking-wider uppercase">
                        Stage 2: Simulator (FSTD)
                      </span>
                    </div>
                    {isSimComplete ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> 16h COMPLETED
                      </span>
                    ) : isGroundComplete ? (
                      <span className="text-[10px] font-mono text-skyline-400 bg-skyline-500/10 px-2 py-0.5 rounded">
                        FFS IN PROGRESS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-aviation-900 px-2 py-0.5 rounded">
                        LOCKED (Req Ground)
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    <div>• <strong>SFIs:</strong> FFS-01 to FFS-08 Emergency Profiles</div>
                    <div className="mt-0.5">• <strong>Structure:</strong> 2h Pre/Post Briefing + 4h Sim Flight</div>
                  </div>
                </div>

                {/* Stage 3: Skill Test & Licensing */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    batch.progress_percentage === 100
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100'
                      : !isSimComplete
                      ? 'bg-aviation-950/40 border-aviation-850 opacity-60 text-slate-500'
                      : 'bg-aviation-950 border-aviation-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="font-heading font-semibold text-xs tracking-wider uppercase">
                        Stage 3: CA-40 Check
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-aviation-900 px-2 py-0.5 rounded">
                      {isSimComplete ? 'READY FOR TEST' : 'LOCKED (Req 16h Sim)'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-300">
                    <div>• <strong>SFEs:</strong> DGCA CA-40 Day & Night Skill Test</div>
                    <div className="mt-0.5">• <strong>Outcome:</strong> License Type Rating Endorsement</div>
                  </div>
                </div>

              </div>

              {/* Cadet Roster Table */}
              <div className="pt-2 border-t border-aviation-800/80">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  ENROLLED CADETS & CLEARANCE STATUS:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {batchStudents.map((cadet) => (
                    <div
                      key={cadet.id}
                      className="p-3 rounded-xl bg-aviation-950 border border-aviation-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{cadet.full_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{cadet.student_number}</div>
                      </div>
                      <div className="text-right">
                        {cadet.ground_tech_completed && cadet.ground_perf_completed ? (
                          <span className="text-[10px] font-mono font-semibold text-emerald-400 block">
                            ✓ Sim Cleared ({cadet.sim_hours_completed}h)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 block">
                            ⏳ Ground Phase
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
