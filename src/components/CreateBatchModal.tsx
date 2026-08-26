'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  GraduationCap,
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  ShieldCheck,
  PlaneTakeoff,
} from 'lucide-react';
import { TrainingPhase } from '@/types';

interface CadetRow {
  full_name: string;
  student_number: string;
  airline: string;
  medical_class1_expiry: string;
  contact_email: string;
}

export const CreateBatchModal: React.FC = () => {
  const { isCreateBatchModalOpen, setIsCreateBatchModalOpen, addBatch, fleets } = useStore();

  const [batchName, setBatchName] = useState<string>('');
  const [batchCode, setBatchCode] = useState<string>('IND-A320-26E');
  const [airlineOperator, setAirlineOperator] = useState<string>('IndiGo Airlines');
  const [aircraftTypeId, setAircraftTypeId] = useState<string>(fleets[0]?.id || 'fleet-a320');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState<string>('2026-12-15');
  const [currentPhase, setCurrentPhase] = useState<TrainingPhase>('GROUND_TECH');

  const [cadets, setCadets] = useState<CadetRow[]>([
    {
      full_name: 'Aditya Deshmukh',
      student_number: 'CADET-2026-009',
      airline: 'IndiGo Airlines',
      medical_class1_expiry: '2027-08-31',
      contact_email: 'aditya.deshmukh@cadet.aero',
    },
    {
      full_name: 'Meera Nambiar',
      student_number: 'CADET-2026-010',
      airline: 'IndiGo Airlines',
      medical_class1_expiry: '2027-09-15',
      contact_email: 'meera.nambiar@cadet.aero',
    },
  ]);

  if (!isCreateBatchModalOpen) return null;

  const handleAddCadetRow = () => {
    const nextIdx = cadets.length + 9;
    setCadets([
      ...cadets,
      {
        full_name: '',
        student_number: `CADET-2026-${String(nextIdx).padStart(3, '0')}`,
        airline: airlineOperator,
        medical_class1_expiry: '2027-09-30',
        contact_email: '',
      },
    ]);
  };

  const handleRemoveCadetRow = (index: number) => {
    if (cadets.length > 1) {
      setCadets(cadets.filter((_, i) => i !== index));
    }
  };

  const handleCadetChange = (index: number, field: keyof CadetRow, value: string) => {
    const updated = [...cadets];
    updated[index] = { ...updated[index], [field]: value };
    setCadets(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !batchCode) return;

    const selectedFleet = fleets.find((f) => f.id === aircraftTypeId) || fleets[0];

    addBatch(
      {
        batch_name: batchName,
        batch_code: batchCode,
        airline_operator: airlineOperator,
        aircraft_type_id: selectedFleet.id,
        aircraft_type_name: `${selectedFleet.manufacturer} ${selectedFleet.model_name}`,
        start_date: startDate,
        expected_completion_date: expectedCompletionDate,
        current_phase: currentPhase,
        status: 'ACTIVE',
      },
      cadets.filter((c) => c.full_name.trim().length > 0)
    );

    setIsCreateBatchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-skyline-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Register Training Batch & Enroll Cadets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Airline Cohort Syllabus Enrollment & Medical Class 1 Verification
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateBatchModalOpen(false)}
            aria-label="Close create batch modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Core Info */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Cohort / Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IndiGo A320 Initial Type Rating 26E"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-skyline-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Batch Code (Unique ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IND-A320-26E"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Airline Operator / Sponsor
                </label>
                <input
                  type="text"
                  value={airlineOperator}
                  onChange={(e) => setAirlineOperator(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Aircraft Type Rating
                </label>
                <select
                  value={aircraftTypeId}
                  onChange={(e) => setAircraftTypeId(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                >
                  {fleets.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.manufacturer} {f.model_name} ({f.variant})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Initial Syllabus Phase
                </label>
                <select
                  value={currentPhase}
                  onChange={(e) => setCurrentPhase(e.target.value as any)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                >
                  <option value="GROUND_TECH">Phase 1A: Ground Technical</option>
                  <option value="GROUND_PERF">Phase 1B: Ground Performance & W&B</option>
                  <option value="SIM_FTD">Phase 2A: FTD Level 2 Procedures</option>
                  <option value="SIM_FFS">Phase 2B: Full Flight Simulator (FFS)</option>
                  <option value="SKILL_TEST">Phase 3: CA-40 Skill Test</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Training Commencement Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Target Graduation Date
                </label>
                <input
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Enrolled Cadets Multi-Row Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Enrolled Cadets & Trainees ({cadets.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Enter student names, ID badges, and Class 1 Medical validity dates
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCadetRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-skyline-50 dark:bg-skyline-500/15 hover:bg-skyline-100 dark:hover:bg-skyline-500/25 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/30 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cadet</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {cadets.map((cadet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-aviation-900/40 border border-slate-200 dark:border-aviation-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Cadet Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Deshmukh"
                      value={cadet.full_name}
                      onChange={(e) => handleCadetChange(idx, 'full_name', e.target.value)}
                      className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-skyline-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Student ID Code</label>
                    <input
                      type="text"
                      value={cadet.student_number}
                      onChange={(e) => handleCadetChange(idx, 'student_number', e.target.value)}
                      className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Class 1 Medical Expiry</label>
                    <input
                      type="date"
                      value={cadet.medical_class1_expiry}
                      onChange={(e) => handleCadetChange(idx, 'medical_class1_expiry', e.target.value)}
                      className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                    <button
                      type="button"
                      disabled={cadets.length === 1}
                      onClick={() => handleRemoveCadetRow(idx)}
                      aria-label="Remove cadet row"
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-aviation-800">
            <button
              type="button"
              onClick={() => setIsCreateBatchModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
            >
              Create Batch & Enroll Cadets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
