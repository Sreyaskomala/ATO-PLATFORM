'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  RotateCw,
  X,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  Award,
  AlertTriangle,
} from 'lucide-react';

export const RenewRecurrentModal: React.FC = () => {
  const { renewModalInstructor, setRenewModalInstructor, renewInstructorRecurrent, instructors } = useStore();

  const [checkDate, setCheckDate] = useState<string>('2026-08-26');
  const [examinerName, setExaminerName] = useState<string>('Capt. Arun Kapur (SFE-CHIEF-301)');
  const [checkType, setCheckType] = useState<string>('Annual Standardization & PPC Check');

  if (!renewModalInstructor) return null;

  const bMonth = renewModalInstructor.base_month || 'September';
  const newExpiryYear = 2027;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewInstructorRecurrent(renewModalInstructor.id, checkDate, examinerName);
    setRenewModalInstructor(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-skyline-600 flex items-center justify-center text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Log Completed Recurrent Check
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Annual Standardization Check & Base Month Preservation
              </p>
            </div>
          </div>

          <button
            onClick={() => setRenewModalInstructor(null)}
            aria-label="Close renew recurrent modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructor Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-aviation-800 border border-slate-300 dark:border-aviation-700 flex items-center justify-center font-heading font-bold text-skyline-700 dark:text-skyline-400 text-sm">
              {renewModalInstructor.avatar_initials}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{renewModalInstructor.full_name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {renewModalInstructor.staff_id} • {renewModalInstructor.roles.join(', ')} • Fleets: {renewModalInstructor.assigned_fleets.join('/')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">Base Month</div>
            <div className="text-xs font-mono font-bold text-skyline-600 dark:text-skyline-400">{bMonth}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Recurrent / PPC Check Completion Date *
            </label>
            <input
              type="date"
              required
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Conducting Synthetic Flight Examiner (SFE / Designated Inspector) *
            </label>
            <input
              type="text"
              required
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
              placeholder="e.g. Capt. Arun Kapur (SFE-CHIEF-301)"
              className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-skyline-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Standardization Scope
            </label>
            <select
              value={checkType}
              onChange={(e) => setCheckType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-skyline-500 focus:outline-none"
            >
              <option value="Annual Standardization & PPC Check">Annual Standardization & PPC Check (Level D FFS)</option>
              <option value="DGCA Refresher & Renewal Assessment">DGCA Refresher & Renewal Assessment</option>
              <option value="Line Standardization Check">Line Standardization Check</option>
            </select>
          </div>

          {/* Base Month Preservation Calculation Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Base Month Rule Applied</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              Check completed within the 3-month window. The anniversary base month (<strong>{bMonth}</strong>) is preserved, extending flight instructional privileges forward to <strong>{bMonth} {newExpiryYear}</strong>.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-aviation-800">
            <button
              type="button"
              onClick={() => setRenewModalInstructor(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-skyline-600 hover:from-emerald-400 hover:to-skyline-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
            >
              Confirm & Renew Qualification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
