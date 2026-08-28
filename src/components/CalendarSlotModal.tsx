'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  CalendarClock,
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  UserCheck,
  GraduationCap,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { TrainingScheduleSession, TrainingPhase, InstructorRole, ScheduleStatus } from '@/types';
import { validateATOSchedulingMatrix } from '@/lib/compliance';

export const CalendarSlotModal: React.FC = () => {
  const {
    isSlotModalOpen,
    slotModalData,
    closeSlotModal,
    addSession,
    updateSession,
    cancelSession,
    batches,
    syllabus,
    instructors,
    simulators,
    students,
    schedules,
    dutyLogs,
  } = useStore();

  const [batchId, setBatchId] = useState<string>('');
  const [syllabusCode, setSyllabusCode] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [resourceId, setResourceId] = useState<string>('');
  const [selectedCadetIds, setSelectedCadetIds] = useState<string[]>([]);
  const [date, setDate] = useState<string>('2026-08-26');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [status, setStatus] = useState<ScheduleStatus>('CONFIRMED');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);

  // Initialize form from slotModalData
  useEffect(() => {
    if (!slotModalData) return;

    if (slotModalData.mode === 'EDIT' && slotModalData.session) {
      const s = slotModalData.session;
      setBatchId(s.batch_id);
      setSyllabusCode(s.session_code);
      setInstructorId(s.instructor_id);
      setResourceId(s.resource_id);
      setSelectedCadetIds(s.student_ids || []);
      setDate(s.date);
      setStartTime(s.start_time);
      setStatus(s.status);
      setShowCancelPrompt(false);
    } else {
      // CREATE Mode
      const defaultBatch = batches[0];
      const defaultSyllabus = syllabus.find((s) => s.phase === 'SIM_FFS') || syllabus[0];
      const defaultInstructor = instructors.find((i) => !i.is_locked_out && i.employment_status === 'ACTIVE') || instructors[0];
      const defaultResource = slotModalData.prefillResourceId 
        ? (simulators.find((r) => r.id === slotModalData.prefillResourceId) || simulators[0])
        : simulators[0];

      setBatchId(defaultBatch?.id || '');
      setSyllabusCode(defaultSyllabus?.session_code || 'FFS-01');
      setInstructorId(defaultInstructor?.id || '');
      setResourceId(defaultResource?.id || '');
      setDate(slotModalData.prefillDate || '2026-08-26');
      setStartTime(slotModalData.prefillTime || '08:00');
      setStatus('CONFIRMED');
      setShowCancelPrompt(false);

      const batchCadets = students.filter((stu) => stu.batch_id === defaultBatch?.id).map((stu) => stu.id);
      setSelectedCadetIds(batchCadets.slice(0, 2));
    }
  }, [slotModalData, batches, syllabus, instructors, simulators, students]);

  if (!isSlotModalOpen || !slotModalData) return null;

  const currentBatch = batches.find((b) => b.id === batchId) || batches[0];
  const currentSyllabus = syllabus.find((s) => s.session_code === syllabusCode) || syllabus[0];
  const currentInstructor = instructors.find((i) => i.id === instructorId) || instructors[0];
  const currentResource = simulators.find((r) => r.id === resourceId) || simulators[0];
  const assignedCadets = students.filter((s) => selectedCadetIds.includes(s.id));

  // Run live compliance check
  const validationResult = validateATOSchedulingMatrix({
    batch: currentBatch,
    syllabusItem: currentSyllabus,
    instructor: currentInstructor,
    resource: currentResource,
    students: assignedCadets,
    date,
    startTime,
    allInstructors: instructors,
    allSchedules: schedules,
    allDutyLogs: dutyLogs,
  });

  const handleCadetToggle = (id: string) => {
    if (selectedCadetIds.includes(id)) {
      setSelectedCadetIds(selectedCadetIds.filter((cid) => cid !== id));
    } else {
      if (selectedCadetIds.length < 2) {
        setSelectedCadetIds([...selectedCadetIds, id]);
      } else {
        setSelectedCadetIds([selectedCadetIds[0], id]);
      }
    }
  };

  const handleBatchChange = (newBatchId: string) => {
    setBatchId(newBatchId);
    const newBatchCadets = students.filter((s) => s.batch_id === newBatchId).map((s) => s.id);
    setSelectedCadetIds(newBatchCadets.slice(0, 2));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Exact minute-level time resolution
    const [startHoursStr, startMinutesStr] = startTime.split(':');
    const startH = parseInt(startHoursStr, 10) || 8;
    const startM = parseInt(startMinutesStr || '0', 10) || 0;
    const dutyMinutes = Math.round(currentSyllabus.total_duty_hours * 60);
    const totalMinutes = startH * 60 + startM + dutyMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    if (slotModalData.mode === 'EDIT' && slotModalData.session) {
      updateSession(slotModalData.session.id, {
        batch_id: currentBatch.id,
        batch_code: currentBatch.batch_code,
        session_code: currentSyllabus.session_code,
        session_title: `${currentSyllabus.session_code} - ${currentSyllabus.session_title}`,
        phase: currentSyllabus.phase,
        aircraft_type_id: currentBatch.aircraft_type_id,
        aircraft_type_name: currentBatch.aircraft_type_name,
        instructor_id: currentInstructor.id,
        instructor_name: currentInstructor.full_name,
        instructor_role: currentSyllabus.required_instructor_role,
        resource_id: currentResource.id,
        resource_name: currentResource.resource_name,
        student_ids: assignedCadets.map((c) => c.id),
        student_names: assignedCadets.map((c) => c.full_name),
        date,
        start_time: startTime,
        end_time: endTimeStr,
        briefing_hours: currentSyllabus.duration_briefing_hours,
        sim_hours: currentSyllabus.duration_instructional_hours,
        total_duty_hours: currentSyllabus.total_duty_hours,
        status,
      });
    } else {
      const newSession: TrainingScheduleSession = {
        id: `sch-${Date.now()}`,
        batch_id: currentBatch.id,
        batch_code: currentBatch.batch_code,
        session_code: currentSyllabus.session_code,
        session_title: `${currentSyllabus.session_code} - ${currentSyllabus.session_title}`,
        phase: currentSyllabus.phase,
        aircraft_type_id: currentBatch.aircraft_type_id,
        aircraft_type_name: currentBatch.aircraft_type_name,
        instructor_id: currentInstructor.id,
        instructor_name: currentInstructor.full_name,
        instructor_role: currentSyllabus.required_instructor_role,
        resource_id: currentResource.id,
        resource_name: currentResource.resource_name,
        student_ids: assignedCadets.map((c) => c.id),
        student_names: assignedCadets.map((c) => c.full_name),
        date,
        start_time: startTime,
        end_time: endTimeStr,
        briefing_hours: currentSyllabus.duration_briefing_hours,
        sim_hours: currentSyllabus.duration_instructional_hours,
        total_duty_hours: currentSyllabus.total_duty_hours,
        status: 'CONFIRMED',
      };
      addSession(newSession);
    }

    closeSlotModal();
  };

  const handleCancelSessionSubmit = () => {
    if (slotModalData.session) {
      cancelSession(slotModalData.session.id, cancelReason || 'Operational cancellation');
      closeSlotModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {slotModalData.mode === 'EDIT' ? 'Reschedule / Edit Session Slot' : 'Book New Flight / Sim Slot'}
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-600 dark:text-slate-400">
                  {date} @ {startTime}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Real-Time DGCA FDTL & Prerequisite Compliance Dispatcher
              </p>
            </div>
          </div>

          <button
            onClick={closeSlotModal}
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Compliance Feedback Banner */}
        <div
          className={`p-4 rounded-2xl border text-xs font-mono transition-colors ${
            validationResult.isValid
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50/90 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            {validationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span className="text-sm">
                  {validationResult.isValid ? 'DGCA CAR Compliant Slot (Legal)' : 'Compliance Hold / Booking Blocked'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/70 dark:bg-black/40 border border-current/20 font-bold">
                  24h: {validationResult.fdtl.hours_24h_total}h / 6.0h • 7d: {validationResult.fdtl.hours_7d_total}h / 30.0h
                </span>
              </div>

              {validationResult.isValid ? (
                <p className="mt-1 text-xs opacity-90 leading-relaxed">
                  ✓ All DGCA CAR Section 7, FDTL duty limitations, simulator device approvals, and cadet prerequisites satisfied.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5 pt-1.5 border-t border-rose-200 dark:border-rose-500/30">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Exact Non-Compliance Reasons Detected:
                  </div>
                  <ul className="space-y-1 text-xs">
                    {validationResult.checks
                      .filter((c) => !c.passed)
                      .map((check) => (
                        <li key={check.id} className="flex items-start gap-2 bg-white/60 dark:bg-aviation-950/60 p-2 rounded-xl border border-rose-200 dark:border-rose-500/20">
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
                            {check.category}
                          </span>
                          <div className="flex-1">
                            <strong className="text-rose-950 dark:text-rose-100 block">{check.rule_title}:</strong>
                            <span className="text-rose-800 dark:text-rose-200 text-[11px] leading-tight block mt-0.5">
                              {check.message}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Row 1: Batch & Syllabus Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Training Batch *
              </label>
              <select
                value={batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_code} — {b.aircraft_type_name} ({b.airline_operator})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Syllabus Module / Session *
              </label>
              <select
                value={syllabusCode}
                onChange={(e) => setSyllabusCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {syllabus.map((s) => (
                  <option key={s.id} value={s.session_code}>
                    {s.session_code}: {s.session_title} ({s.total_duty_hours}h duty)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Instructor & Device */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Assigned Instructor *
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {instructors.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.full_name} [{ins.roles.join(', ')}] ({ins.assigned_fleets.join('/')}) {ins.is_locked_out ? '⚠️ LOCKED' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Simulator Bay / Classroom *
              </label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {simulators.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.resource_name} ({res.level}) — {res.bay_location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Date, Start Time & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Session Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Start Time (HH:MM) *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((t) => (
                  <option key={t} value={t}>{t} IST</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Session Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value="CONFIRMED">CONFIRMED (Ready)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Live)</option>
                <option value="COMPLETED">COMPLETED (Logged)</option>
                <option value="DRAFT">DRAFT (Tentative)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Row 4: Cadet Crew Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Assigned Trainees / Cadets (PF & PM)</span>
              <span className="text-[11px] text-slate-500 font-normal">Select up to 2 for Simulator Crew</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {students
                .filter((stu) => stu.batch_id === batchId)
                .map((cadet) => {
                  const isSelected = selectedCadetIds.includes(cadet.id);
                  const isBlocked = cadet.has_missed_sessions || cadet.go_no_go_status === 'NO_GO_BLOCKED';

                  return (
                    <button
                      type="button"
                      key={cadet.id}
                      onClick={() => handleCadetToggle(cadet.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-mono ${
                        isSelected
                          ? 'bg-skyline-50 dark:bg-skyline-500/20 border-skyline-400 dark:border-skyline-500 text-skyline-900 dark:text-white font-bold'
                          : 'bg-slate-50 dark:bg-aviation-900 border-slate-200 dark:border-aviation-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="truncate">{cadet.full_name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{cadet.student_number}</div>
                      {isBlocked && (
                        <div className="text-[9px] text-rose-500 font-bold mt-1">⚠️ Missed Class</div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Cancel session confirmation area */}
          {showCancelPrompt && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 space-y-2">
              <div className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Confirm Session Cancellation & Free Slot
              </div>
              <input
                type="text"
                placeholder="Reason for cancellation (e.g. Instructor indisposed / Simulator maintenance)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-white dark:bg-aviation-950 border border-rose-200 dark:border-rose-500/30 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-aviation-900 text-xs font-mono"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancelSessionSubmit}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-sm"
                >
                  Confirm Cancel Session
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-aviation-800">
            {slotModalData.mode === 'EDIT' && !showCancelPrompt ? (
              <button
                type="button"
                onClick={() => setShowCancelPrompt(true)}
                className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Cancel Session
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSlotModal}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={!validationResult.isValid}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                  validationResult.isValid
                    ? 'bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan cursor-pointer'
                    : 'bg-slate-300 dark:bg-aviation-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                {slotModalData.mode === 'EDIT' ? 'Save Changes & Reschedule' : 'Dispatch & Confirm Slot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
