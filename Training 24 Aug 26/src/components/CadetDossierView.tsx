'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Award,
  Layers,
  Sparkles,
  BookOpen,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  Plus,
} from 'lucide-react';
import { CadetStudent, CadetGoNoGoStatus, StageEvaluationRecord } from '@/types';

export const CadetDossierView: React.FC = () => {
  const {
    students,
    courses,
    evaluations,
    attendances,
    setSelectedCadetForDossier,
    setIsEvaluationModalOpen,
    markAttendance,
    assignRemedialTraining,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCadetId, setSelectedCadetId] = useState<string>(students[0]?.id || 'stu-1');

  // Quick makeup modal state
  const [makeupModalCadet, setMakeupModalCadet] = useState<CadetStudent | null>(null);

  const filteredCadets = students.filter((stu) => {
    if (batchFilter !== 'ALL' && stu.batch_code !== batchFilter) return false;
    if (statusFilter !== 'ALL' && stu.go_no_go_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        stu.full_name.toLowerCase().includes(q) ||
        stu.student_number.toLowerCase().includes(q) ||
        stu.airline_sponsor.toLowerCase().includes(q) ||
        stu.batch_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCadet = students.find((s) => s.id === selectedCadetId) || filteredCadets[0] || students[0];
  const cadetCourse = courses.find((c) => c.id === activeCadet?.enrolled_course_id) || courses[0];
  const cadetEvaluations = evaluations.filter((e) => e.student_id === activeCadet?.id);
  const cadetAttendances = attendances.filter((a) => a.student_id === activeCadet?.id);

  // Statistics
  const totalCadets = students.length;
  const clearedGoCadets = students.filter((s) => s.go_no_go_status === 'GO_CLEARED').length;
  const blockedCadets = students.filter((s) => s.go_no_go_status === 'NO_GO_BLOCKED' || s.has_missed_sessions).length;
  const remedialCadets = students.filter((s) => s.go_no_go_status === 'REMEDIAL_ACTIVE').length;

  const handleOpenEvaluation = (cadet: CadetStudent) => {
    setSelectedCadetForDossier(cadet);
    setIsEvaluationModalOpen(true);
  };

  const handleResolveMakeup = (cadet: CadetStudent) => {
    markAttendance({
      id: `att-makeup-${Date.now()}`,
      student_id: cadet.id,
      session_code: 'GND-TECH-01-MAKEUP',
      session_title: 'Technical Makeup Class Cleared',
      date: '2026-09-01',
      status: 'MAKEUP_COMPLETED',
      notes: 'Mandatory theory makeup completed with instructor. Unblocked for FFS.',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-skyline-500 dark:text-skyline-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Cadet Electronic Training Records (ETR) & Progress
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Individual Pilot Dossiers, Missed Class/Session Gatekeeper Blockers, CBTA Stage Exam History & Remedial Tracking
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search candidate name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-skyline-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500 font-mono"
          >
            <option value="ALL">All Go/No-Go Statuses</option>
            <option value="GO_CLEARED">🟢 Cleared (Go)</option>
            <option value="NO_GO_BLOCKED">🔴 Missed Class / Blocked</option>
            <option value="REMEDIAL_ACTIVE">🟡 Remedial Active</option>
          </select>

          <button
            onClick={() => handleOpenEvaluation(activeCadet)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 transition-all cursor-pointer font-mono"
          >
            <Award className="w-4 h-4" />
            <span>Record Stage Evaluation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400 font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">{totalCadets}</div>
            <div className="text-xs font-mono text-slate-500">Enrolled Trainees</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">{clearedGoCadets}</div>
            <div className="text-xs font-mono text-slate-500">🟢 Cleared (Go Status)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-rose-600 dark:text-rose-400">{blockedCadets}</div>
            <div className="text-xs font-mono text-slate-500">🔴 Missed Class Blockers</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-amber-600 dark:text-amber-400">{remedialCadets}</div>
            <div className="text-xs font-mono text-slate-500">🟡 Remedial Active</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Trainee Table on Left, Selected Trainee Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trainees Table */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>TRAINEE ROSTER ({filteredCadets.length})</span>
            <span>SELECT TO VIEW DOSSIER</span>
          </div>

          <div className="space-y-2.5">
            {filteredCadets.map((cadet) => {
              const isSelected = activeCadet?.id === cadet.id;
              const isBlocked = cadet.has_missed_sessions || cadet.go_no_go_status === 'NO_GO_BLOCKED';
              const isRemedial = cadet.go_no_go_status === 'REMEDIAL_ACTIVE';

              return (
                <div
                  key={cadet.id}
                  onClick={() => setSelectedCadetId(cadet.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white dark:bg-aviation-900 border-skyline-500 shadow-md dark:shadow-glow-cyan'
                      : 'bg-white/80 dark:bg-aviation-900/60 border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 flex items-center justify-center font-heading font-bold text-xs text-skyline-600 dark:text-skyline-400">
                        {cadet.avatar_initials}
                      </div>
                      <div>
                        <div className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                          {cadet.full_name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {cadet.student_number} • {cadet.batch_code} ({cadet.airline_sponsor})
                        </div>
                      </div>
                    </div>

                    <div>
                      {isBlocked ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold text-[10px] border border-rose-200 dark:border-rose-500/30">
                          🔴 NO-GO BLOCKED
                        </span>
                      ) : isRemedial ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px] border border-amber-200 dark:border-amber-500/30">
                          🟡 REMEDIAL ({cadet.remedial_hours_assigned}h)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] border border-emerald-200 dark:border-emerald-500/30">
                          🟢 CLEARED (GO)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Course Progress ({cadet.current_stage_name})</span>
                      <span className="font-bold text-slate-900 dark:text-white">{cadet.progress_percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-aviation-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isBlocked ? 'bg-rose-500' : isRemedial ? 'bg-amber-500' : 'bg-gradient-to-r from-skyline-500 to-indigo-500'
                        }`}
                        style={{ width: `${cadet.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Cadet Dossier */}
        {activeCadet && (
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-6 shadow-sm dark:shadow-none">
              {/* Cadet Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-skyline-500 to-indigo-600 text-white font-heading font-extrabold text-base flex items-center justify-center shadow-md shadow-skyline-500/20">
                    {activeCadet.avatar_initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                        {activeCadet.full_name}
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                        {activeCadet.student_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Batch {activeCadet.batch_code} • {activeCadet.airline_sponsor} Cadet Pilot
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEvaluation(activeCadet)}
                    className="px-3 py-1.5 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-skyline-500/20"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Record Exam
                  </button>
                </div>
              </div>

              {/* Blocker Alert Box if Missed Classes / Remedial */}
              {activeCadet.has_missed_sessions && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>PREREQUISITE VIOLATION: Missed Ground / Sim Session</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-500/30 text-rose-900 dark:text-rose-200 text-[10px]">
                      Progression Locked
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {activeCadet.blocker_reason || 'Candidate has unexcused absence. Cannot proceed to simulator skill checks until makeup class is logged.'}
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleResolveMakeup(activeCadet)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clear Makeup & Unlock Cadet
                    </button>
                  </div>
                </div>
              )}

              {activeCadet.remedial_hours_assigned > 0 && !activeCadet.has_missed_sessions && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>REMEDIAL TRAINING MANDATED: {activeCadet.remedial_hours_assigned}h Assigned</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {activeCadet.blocker_reason || 'Candidate required remedial instruction to meet competency standards.'}
                  </p>
                </div>
              )}

              {/* Course & Progress Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-aviation-800 pb-2">
                  <span className="text-slate-500">ENROLLED SYLLABUS</span>
                  <span className="font-bold text-skyline-600 dark:text-skyline-400">
                    {cadetCourse?.course_code} ({cadetCourse?.has_mcc_jit ? 'With MCC/JIT' : 'Fast-Track / TR Holder'})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ground Logged</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{activeCadet.ground_hours_completed}h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">FTD Logged</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{activeCadet.sim_ftd_hours_completed}h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">FFS Logged</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{activeCadet.sim_ffs_hours_completed}h</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Stage</span>
                    <span className="font-bold text-skyline-600 dark:text-skyline-400 text-sm">{activeCadet.current_stage_id}</span>
                  </div>
                </div>
              </div>

              {/* Stage Gate Evaluations & Exam History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-skyline-500" />
                    <span>CBTA Stage Evaluations & Exam History ({cadetEvaluations.length})</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {cadetEvaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-aviation-950/60 border border-slate-200 dark:border-aviation-800 flex items-start justify-between text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{ev.stage_name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ev.outcome === 'PASSED'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : ev.outcome === 'REMEDIAL_REQUIRED'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {ev.outcome} ({ev.score_percent}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{ev.remarks}</p>
                        <div className="text-[10px] text-slate-400">
                          Evaluator: {ev.evaluator_instructor_name} • Date: {ev.evaluation_date}
                        </div>
                      </div>

                      {ev.remedial_hours_required > 0 && (
                        <span className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                          +{ev.remedial_hours_required}h Remedial
                        </span>
                      )}
                    </div>
                  ))}

                  {cadetEvaluations.length === 0 && (
                    <div className="p-6 border border-dashed border-slate-200 dark:border-aviation-800 rounded-2xl text-center text-xs font-mono text-slate-400">
                      No formal stage checks recorded yet for this candidate.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
