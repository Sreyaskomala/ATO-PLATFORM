'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  CalendarClock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Play,
  Layers,
  Cpu,
  User,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export const FlightScheduler: React.FC = () => {
  const {
    batches,
    syllabus,
    instructors,
    simulators,
    students,
    form,
    updateForm,
    applyPreset,
    validation,
    runValidation,
    commitSessionBooking,
  } = useStore();

  const [activePreset, setActivePreset] = useState<string>('valid-sfi-ffs');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    runValidation();
  }, [form, runValidation]);

  const handlePresetSelect = (presetKey: any) => {
    setActivePreset(presetKey);
    applyPreset(presetKey);
  };

  const selectedBatch = batches.find((b) => b.id === form.batchId) || batches[0];
  const selectedSyllabus = syllabus.find((s) => s.session_code === form.syllabusCode) || syllabus[0];
  const batchStudents = students.filter((s) => s.batch_id === selectedBatch.id);

  const handleStudentToggle = (studentId: string) => {
    const current = form.selectedStudentIds;
    if (current.includes(studentId)) {
      updateForm({ selectedStudentIds: current.filter((id) => id !== studentId) });
    } else {
      updateForm({ selectedStudentIds: [...current, studentId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await commitSessionBooking();
    setIsSubmitting(false);
  };

  const passCount = validation.checks.filter((c) => c.passed).length;
  const failCount = validation.checks.filter((c) => !c.passed).length;

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Top Presets Strip */}
      <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-skyline-500 dark:text-skyline-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                ATO Operational Scheduling Workbench
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Test real operational scenarios: Tech GI systems classes, Perf GI flight planning, SFI simulator slots, gatekeeper prerequisites & FDTL limits
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePresetSelect('valid-ground-tech')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'valid-ground-tech'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/50 shadow-sm dark:shadow-glow-cyan'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tech GI Ground Class</span>
            </button>

            <button
              onClick={() => handlePresetSelect('valid-ground-perf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'valid-ground-perf'
                  ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/50 shadow-sm'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Perf GI W&B Class</span>
            </button>

            <button
              onClick={() => handlePresetSelect('valid-sfi-ffs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'valid-sfi-ffs'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50 shadow-sm dark:shadow-glow-emerald'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SFI Level D Session</span>
            </button>

            <button
              onClick={() => handlePresetSelect('blocked-prereq-sim')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'blocked-prereq-sim'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50 shadow-sm dark:shadow-glow-rose'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ground Gatekeeper Lock</span>
            </button>

            <button
              onClick={() => handlePresetSelect('fdtl-exceeded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'fdtl-exceeded'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50 shadow-sm dark:shadow-glow-rose'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>FDTL 30h Exceeded</span>
            </button>

            <button
              onClick={() => handlePresetSelect('refresher-lockout')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activePreset === 'refresher-lockout'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/50 shadow-sm dark:shadow-glow-rose'
                  : 'bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-aviation-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Refresher Lockout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Compliance Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Session Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-aviation-800">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Session Parameters</h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                {selectedBatch.aircraft_type_name}
              </span>
            </div>

            {/* Target Batch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-skyline-500 dark:text-skyline-400" /> Target Cadet Batch
              </label>
              <select
                value={form.batchId}
                onChange={(e) => {
                  const bId = e.target.value;
                  updateForm({ batchId: bId });
                  useStore.getState().autoMatchInstructorAndResource(bId, form.syllabusCode);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-sm focus:border-skyline-500 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_code} - {b.batch_name} ({b.aircraft_type_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Syllabus Item */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Syllabus Training Session
                </label>
                <button
                  type="button"
                  onClick={() => useStore.getState().autoMatchInstructorAndResource(form.batchId, form.syllabusCode)}
                  className="text-[10px] font-mono text-skyline-600 dark:text-skyline-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Match Instructor & Bay</span>
                </button>
              </div>
              <select
                value={form.syllabusCode}
                onChange={(e) => {
                  const sCode = e.target.value;
                  updateForm({ syllabusCode: sCode });
                  useStore.getState().autoMatchInstructorAndResource(form.batchId, sCode);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-sm focus:border-skyline-500 focus:outline-none"
              >
                {syllabus.map((s) => (
                  <option key={s.id} value={s.session_code}>
                    {s.session_code}: {s.session_title} (Req: {s.required_instructor_role} • {s.total_duty_hours}h Duty)
                  </option>
                ))}
              </select>
            </div>

            {/* Instructional Duty Breakdown Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-mono">Duty Breakdown:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedSyllabus.duration_briefing_hours > 0 ? (
                    <>Briefing: {selectedSyllabus.duration_briefing_hours}h + Sim: {selectedSyllabus.duration_instructional_hours}h</>
                  ) : (
                    <>Classroom Lecture: {selectedSyllabus.duration_instructional_hours}h</>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-mono">Total Duty:</span>
                <span className="font-mono font-bold text-skyline-600 dark:text-skyline-400 text-sm">
                  {selectedSyllabus.total_duty_hours} Hours
                </span>
              </div>
            </div>

            {/* Assigned Instructor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-skyline-500 dark:text-skyline-400" /> Assigned Instructor
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Auto-Matched for {selectedSyllabus.required_instructor_role}
                </span>
              </label>
              <select
                value={form.instructorId}
                onChange={(e) => updateForm({ instructorId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-sm focus:border-skyline-500 focus:outline-none"
              >
                {instructors.filter(ins => ins.employment_status !== 'RESIGNED').map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.full_name} ({ins.roles.join(', ')} • {ins.staff_id} • Fleets: {ins.assigned_fleets.join('/')})
                  </option>
                ))}
              </select>
            </div>

            {/* Training Resource (FFS, FTD, Room) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Training Resource (Sim Bay / Room)
              </label>
              <select
                value={form.resourceId}
                onChange={(e) => updateForm({ resourceId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-sm focus:border-skyline-500 focus:outline-none"
              >
                {simulators.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.resource_name} ({res.level} • {res.bay_location})
                  </option>
                ))}
              </select>
            </div>

            {/* Cadets Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedSyllabus.phase === 'GROUND_TECH' || selectedSyllabus.phase === 'GROUND_PERF'
                    ? `Assigned Ground Class Trainees (${form.selectedStudentIds.length} Selected)`
                    : `Assigned Flight Crew (PF & PM + Observer: ${form.selectedStudentIds.length} Selected)`}
                </label>
                {(selectedSyllabus.phase === 'GROUND_TECH' || selectedSyllabus.phase === 'GROUND_PERF') && (
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => updateForm({ selectedStudentIds: batchStudents.map((s) => s.id) })}
                      className="text-skyline-600 hover:text-skyline-700 dark:text-skyline-400 font-semibold"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => updateForm({ selectedStudentIds: [] })}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {batchStudents.map((s) => {
                  const isChecked = form.selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleStudentToggle(s.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-skyline-50 dark:bg-skyline-500/10 border-skyline-400 dark:border-skyline-500/40 text-skyline-900 dark:text-white font-semibold'
                          : 'bg-slate-50 dark:bg-aviation-950 border-slate-200 dark:border-aviation-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>{s.full_name} ({s.student_number})</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {s.ground_tech_completed && s.ground_perf_completed ? '✓ Ground Cleared' : '⏳ Ground Incomplete'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date & Start Time */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm({ date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-xs font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateForm({ startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-slate-800 dark:text-slate-200 text-xs font-mono focus:border-skyline-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Commit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-aviation-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  validation.isValid
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/20'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {validation.isValid ? 'Commit Confirmed Session' : 'Commit Blocked (Trigger P0001 Protection)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (7 Cols): Live DGCA CAR Compliance Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Verdict Banner */}
          <div
            className={`p-6 rounded-2xl border backdrop-blur-xl transition-all ${
              validation.isValid
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-glow-emerald'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40 shadow-sm dark:shadow-glow-rose'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  validation.isValid
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                }`}
              >
                {validation.isValid ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full ${
                      validation.isValid
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                    }`}
                  >
                    {validation.isValid ? 'LEGAL TO COMMIT' : 'DGCA RULE VIOLATION'}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {passCount}/{validation.checks.length} Rules Satisfied
                  </span>
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-1">
                  {validation.isValid
                    ? 'Training Session is Fully Compliant'
                    : 'Transaction Blocked by Regulatory Rules'}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{validation.summary}</p>
              </div>
            </div>
          </div>

          {/* FDTL Live Gauges Bar */}
          {validation.fdtl && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 24-Hour Duty Bar */}
              <div className="p-4 rounded-xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">DGCA 24H DUTY (6.0h Max)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{validation.fdtl.hours_24h_total} / 6.0h</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      validation.fdtl.percentage_24h > 100
                        ? 'bg-rose-500'
                        : validation.fdtl.percentage_24h > 80
                        ? 'bg-amber-400'
                        : 'bg-skyline-500'
                    }`}
                    style={{ width: `${Math.min(100, validation.fdtl.percentage_24h)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                  <span>{validation.fdtl.percentage_24h}% Used</span>
                  <span>{validation.fdtl.remaining_24h}h Remaining</span>
                </div>
              </div>

              {/* 7-Day Duty Bar */}
              <div className="p-4 rounded-xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">DGCA 7-DAY DUTY (30.0h Max)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{validation.fdtl.hours_7d_total} / 30.0h</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      validation.fdtl.percentage_7d > 100
                        ? 'bg-rose-500'
                        : validation.fdtl.percentage_7d > 80
                        ? 'bg-amber-400'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, validation.fdtl.percentage_7d)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                  <span>{validation.fdtl.percentage_7d}% Used</span>
                  <span>{validation.fdtl.remaining_7d}h Remaining</span>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Checklist Cards */}
          <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl shadow-sm dark:shadow-none">
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-3">
              DGCA CAR & ATO Compliance Matrix
            </h4>
            <div className="space-y-3">
              {validation.checks.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    c.passed
                      ? 'bg-slate-50 dark:bg-aviation-950/60 border-slate-200 dark:border-aviation-800 text-slate-700 dark:text-slate-300'
                      : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {c.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{c.rule_title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{c.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
