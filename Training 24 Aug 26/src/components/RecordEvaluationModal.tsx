'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  Award,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { StageEvaluationRecord, StageEvalOutcome, CadetGoNoGoStatus } from '@/types';

export const RecordEvaluationModal: React.FC = () => {
  const {
    isEvaluationModalOpen,
    setIsEvaluationModalOpen,
    recordStageEvaluation,
    students,
    courses,
    instructors,
    selectedCadetForDossier,
  } = useStore();

  const [studentId, setStudentId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [stageId, setStageId] = useState<string>('STAGE-1');
  const [evaluatorId, setEvaluatorId] = useState<string>('');
  const [scorePercent, setScorePercent] = useState<number>(85);
  const [outcome, setOutcome] = useState<StageEvalOutcome>('PASSED');
  const [remedialHours, setRemedialHours] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('Candidate demonstrated sound understanding of systems.');

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];
  const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];
  const selectedStage = selectedCourse?.stages.find((s) => s.stage_id === stageId) || selectedCourse?.stages[0];

  useEffect(() => {
    if (selectedCadetForDossier) {
      setStudentId(selectedCadetForDossier.id);
      if (selectedCadetForDossier.enrolled_course_id) {
        setCourseId(selectedCadetForDossier.enrolled_course_id);
      }
    } else if (students[0]) {
      setStudentId(students[0].id);
      setCourseId(students[0].enrolled_course_id || courses[0]?.id || '');
    }
    if (instructors[0]) {
      setEvaluatorId(instructors[0].id);
    }
  }, [selectedCadetForDossier, students, courses, instructors, isEvaluationModalOpen]);

  if (!isEvaluationModalOpen) return null;

  // Auto calculate outcome based on passing mark
  const handleScoreChange = (newScore: number) => {
    setScorePercent(newScore);
    const passMark = selectedStage?.passing_score_percent || 80;
    if (newScore >= passMark) {
      setOutcome('PASSED');
      setRemedialHours(0);
      setRemarks('Cleared stage evaluation requirements with satisfactory performance.');
    } else if (newScore >= passMark - 10) {
      setOutcome('REMEDIAL_REQUIRED');
      setRemedialHours(2.0);
      setRemarks(`Score below passing mark (${passMark}%). Requires 2.0 hours remedial review prior to re-check.`);
    } else {
      setOutcome('FAILED');
      setRemedialHours(4.0);
      setRemarks(`Unsatisfactory score (${newScore}%). Stage Gate NO-GO Blocked. Comprehensive remedial training mandated.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !selectedStage) return;

    const evalRecord: StageEvaluationRecord = {
      id: `eval-${Date.now()}`,
      student_id: studentId,
      student_name: selectedStudent?.full_name || 'Cadet',
      course_id: selectedCourse?.id || 'course-1',
      stage_id: selectedStage.stage_id,
      stage_name: selectedStage.stage_name,
      evaluation_date: '2026-09-01',
      evaluator_instructor_id: evaluatorId,
      evaluator_instructor_name: instructors.find((i) => i.id === evaluatorId)?.full_name || 'Instructor',
      score_percent: scorePercent,
      outcome: outcome,
      remedial_hours_required: remedialHours,
      cleared_for_next_stage: outcome === 'PASSED',
      remarks: remarks,
    };

    recordStageEvaluation(evalRecord);
    setIsEvaluationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Record Trainee Stage Gate Evaluation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                CBTA Performance Grading, Pass/Fail Record & Remedial Training Assignment Gate
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEvaluationModalOpen(false)}
            aria-label="Close evaluation modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Go/No-Go Decision Preview Banner */}
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 transition-colors ${
            outcome === 'PASSED'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : outcome === 'REMEDIAL_REQUIRED'
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}
        >
          {outcome === 'PASSED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : outcome === 'REMEDIAL_REQUIRED' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="font-bold text-sm flex items-center justify-between">
              <span>
                {outcome === 'PASSED'
                  ? '🟢 GO DECISION: CLEARED FOR NEXT STAGE'
                  : outcome === 'REMEDIAL_REQUIRED'
                  ? '🟡 REMEDIAL GATE: MUST COMPLETE MAKEUP HOURS'
                  : '🔴 NO-GO BLOCKED: STAGE FAILED'}
              </span>
              <span className="text-xs">Pass Standard: {selectedStage?.passing_score_percent || 80}%</span>
            </div>
            <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
              {outcome === 'PASSED'
                ? 'Candidate has satisfied syllabus competencies and is authorized to progress to simulator sessions and skill checks.'
                : 'Session progression is locked by the compliance gatekeeper until instructor logs required remedial makeup hours.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Cadet & Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Trainee / Cadet Candidate *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.full_name} ({stu.student_number}) — {stu.batch_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Enrolled Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  const c = courses.find((crs) => crs.id === e.target.value);
                  if (c && c.stages[0]) setStageId(c.stages[0].stage_id);
                }}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {courses.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.course_code}: {crs.course_title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Stage Checkpoint & Evaluator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Curriculum Stage Checkpoint *
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {(selectedCourse?.stages || []).map((stg) => (
                  <option key={stg.stage_id} value={stg.stage_id}>
                    Stage {stg.stage_number}: {stg.stage_name} (Pass: {stg.passing_score_percent}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Evaluating Examiner / Instructor *
              </label>
              <select
                value={evaluatorId}
                onChange={(e) => setEvaluatorId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                {instructors.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.full_name} [{ins.roles.join(', ')}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Score % & Outcome */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Performance Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorePercent}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-skyline-600 dark:text-skyline-400 text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Evaluation Outcome
                </label>
                <select
                  value={outcome}
                  onChange={(e) => {
                    const out = e.target.value as StageEvalOutcome;
                    setOutcome(out);
                    if (out === 'PASSED') setRemedialHours(0);
                    else if (out === 'REMEDIAL_REQUIRED' && remedialHours === 0) setRemedialHours(2.0);
                  }}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                >
                  <option value="PASSED">PASSED (Cleared)</option>
                  <option value="REMEDIAL_REQUIRED">REMEDIAL REQUIRED</option>
                  <option value="FAILED">FAILED (Blocked)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Remedial Hours Mandated
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={remedialHours}
                  onChange={(e) => setRemedialHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white text-center"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Remarks */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Examiner Assessment Remarks & Debrief Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-aviation-800">
            <button
              type="button"
              onClick={() => setIsEvaluationModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20"
            >
              Log Stage Evaluation & Update ETR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
