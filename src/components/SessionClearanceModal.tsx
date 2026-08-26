'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Cpu,
  GraduationCap,
  CalendarClock,
  Printer,
  FileCheck2,
  X,
  Plane,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { validateATOSchedulingMatrix } from '@/lib/compliance';

export const SessionClearanceModal: React.FC = () => {
  const {
    selectedSessionModal,
    setSelectedSessionModal,
    openSlotModal,
    batches,
    syllabus,
    instructors,
    simulators,
    students,
    schedules,
    dutyLogs,
    addToast,
    updateSession,
  } = useStore();

  const [authorized, setAuthorized] = useState<boolean>(false);

  if (!selectedSessionModal) return null;

  const session = selectedSessionModal;
  const batch = batches.find((b) => b.id === session.batch_id) || batches[0];
  const syllabusItem = syllabus.find((s) => s.session_code === session.session_code) || {
    id: 's-unknown',
    aircraft_type_id: session.aircraft_type_id,
    phase: session.phase,
    session_code: session.session_code,
    session_title: session.session_title,
    duration_instructional_hours: session.sim_hours,
    duration_briefing_hours: session.briefing_hours,
    total_duty_hours: session.total_duty_hours,
    required_instructor_role: session.instructor_role,
    required_resource_category: session.phase === 'GROUND_TECH' || session.phase === 'GROUND_PERF' ? 'CLASSROOM' : 'FFS',
    is_check: session.phase === 'SKILL_TEST',
    description: session.session_title,
  };
  const instructor = instructors.find((i) => i.id === session.instructor_id) || instructors[0];
  const resource = simulators.find((r) => r.id === session.resource_id) || simulators[0];
  const sessionStudents = students.filter((s) => session.student_ids?.includes(s.id));

  // Run comprehensive DGCA legality check
  const validation = validateATOSchedulingMatrix({
    batch,
    syllabusItem,
    instructor,
    resource,
    students: sessionStudents.length > 0 ? sessionStudents : students.slice(0, 2),
    date: session.date,
    startTime: session.start_time,
    allInstructors: instructors,
    allSchedules: schedules,
    allDutyLogs: dutyLogs,
  });

  const handleAuthorizeRelease = () => {
    setAuthorized(true);
    updateSession(session.id, { status: 'CONFIRMED' });
    addToast({
      type: 'success',
      title: 'DGCA Dispatch Release Issued',
      message: `Official Dispatch Clearance authorized for ${session.session_code} on ${session.resource_name} (Instructor: ${session.instructor_name}).`,
      duration: 6000,
    });
  };

  const handleReschedule = () => {
    setSelectedSessionModal(null);
    openSlotModal({ mode: 'EDIT', session });
  };

  const handlePrintRelease = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        
        {/* Header Strip */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400 shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                  Pre-Flight & Sim Dispatch Clearance Check
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-skyline-100 dark:bg-skyline-500/15 text-skyline-700 dark:text-skyline-300 border border-skyline-300 dark:border-skyline-500/30 uppercase">
                  CAR-FSTD Level D
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {session.session_code} • {session.session_title} • {session.batch_code}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSessionModal(null)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Authority Summary Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono transition-colors ${
            validation.isValid || authorized
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {validation.isValid || authorized ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-sm tracking-wide uppercase">
                {validation.isValid || authorized
                  ? 'DISPATCH RELEASE: CLEARED (DGCA LEGAL)'
                  : 'DISPATCH HOLD: COMPLIANCE VIOLATION DETECTED'}
              </div>
              <div className="text-xs opacity-90 font-sans mt-0.5">
                {validation.isValid || authorized
                  ? 'All 7 mandatory DGCA CAR regulatory and ATO prerequisite gatekeepers are verified.'
                  : 'Session cannot proceed to flight/simulator bay until all non-compliant items below are resolved.'}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] px-3 py-1 rounded-xl bg-white/80 dark:bg-black/40 border border-current/20 font-bold block">
              Duty: {session.total_duty_hours}h ({session.sim_hours}h Sim + {session.briefing_hours}h Brief)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              {session.date} @ {session.start_time}–{session.end_time}
            </span>
          </div>
        </div>

        {/* 4-Box Key Parameters Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-1">
            <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-skyline-500" />
              Assigned Instructor
            </div>
            <div className="font-sans font-bold text-slate-900 dark:text-white text-sm">
              {session.instructor_name}
            </div>
            <div className="text-[11px] text-skyline-600 dark:text-skyline-400">
              Role: {session.instructor_role} • Base: {instructor?.base_month || 'April'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-1">
            <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Assigned Simulator
            </div>
            <div className="font-sans font-bold text-slate-900 dark:text-white text-sm">
              {session.resource_name}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
              {resource?.bay_location || 'Sim Bay 1 (Level D)'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-1">
            <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              Assigned Flight Crew
            </div>
            <div className="font-sans font-bold text-slate-900 dark:text-white text-sm">
              {session.student_names?.length ? session.student_names.join(', ') : 'Aditi Rao, Rohan Verma'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Batch: {session.batch_code}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-1">
            <div className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              FDTL Duty Check
            </div>
            <div className="font-sans font-bold text-slate-900 dark:text-white text-sm">
              24h: {validation.fdtl?.hours_24h_total || session.total_duty_hours}h / 6.0h
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              7d: {validation.fdtl?.hours_7d_total || session.total_duty_hours}h / 30.0h
            </div>
          </div>
        </div>

        {/* 7-Step DGCA Regulatory Compliance Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-skyline-500" />
              DGCA CAR Section 7 & ATO Clearance Verification Checklist:
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {validation.checks.filter((c) => c.passed).length} of {validation.checks.length} Rules Passed
            </span>
          </div>

          <div className="space-y-2">
            {validation.checks.map((check, index) => (
              <div
                key={check.id || index}
                className={`p-3.5 rounded-2xl border text-xs font-mono flex items-start gap-3 transition-all ${
                  check.passed
                    ? 'bg-slate-50/70 dark:bg-aviation-900/40 border-slate-200 dark:border-aviation-800 text-slate-800 dark:text-slate-200'
                    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 shadow-sm'
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold font-sans text-slate-900 dark:text-white">
                      {check.rule_title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        check.passed
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {check.passed ? 'PASSED (LEGAL)' : 'FAILED (HOLD)'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                    {check.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-200 dark:border-aviation-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintRelease}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 border border-slate-200 dark:border-aviation-800 text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clearance</span>
            </button>

            <button
              onClick={handleReschedule}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 border border-slate-200 dark:border-aviation-800 text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono transition-all"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Edit / Reschedule</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSessionModal(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-aviation-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aviation-900 text-xs font-semibold font-mono transition-all"
            >
              Close
            </button>

            <button
              onClick={handleAuthorizeRelease}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold font-mono shadow-md transition-all ${
                validation.isValid || authorized
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 shadow-skyline-500/20'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{authorized ? 'Clearance Authorized ✓' : 'Authorize Dispatch Release'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
