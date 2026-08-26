'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  BookOpen,
  X,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { TrainingCourse, CourseStage, CourseAudience } from '@/types';

export const CreateCourseModal: React.FC = () => {
  const { isCreateCourseModalOpen, setIsCreateCourseModalOpen, addCourse, fleets } = useStore();

  const [courseCode, setCourseCode] = useState<string>('TR-A320-CUSTOM');
  const [courseTitle, setCourseTitle] = useState<string>('Airbus A320 Custom Transition Course');
  const [fleetCode, setFleetCode] = useState<string>('A320');
  const [audience, setAudience] = useState<CourseAudience>('TYPE_RATED_TRANSITION');
  const [hasMccJit, setHasMccJit] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(
    'Fast-track type transition course tailored for existing type-rated pilots. Omits MCC/JIT module.'
  );

  // Dynamic syllabus stages
  const [stages, setStages] = useState<CourseStage[]>([
    {
      stage_id: 'STAGE-1',
      stage_number: 1,
      stage_name: 'Aircraft Systems & Performance Theory',
      stage_type: 'GROUND_THEORY',
      ground_hours: 40,
      sim_ftd_hours: 0,
      sim_ffs_hours: 0,
      flight_hours: 0,
      description: 'Airbus A320 fly-by-wire autoflight, hydraulic, and FADEC engine systems',
      has_exam_or_check: true,
      passing_score_percent: 80,
      requires_stage_cleared_to_proceed: true,
    },
    {
      stage_id: 'STAGE-2',
      stage_number: 2,
      stage_name: 'FTD Procedures & FMC Training',
      stage_type: 'FTD_PROCEDURES',
      ground_hours: 8,
      sim_ftd_hours: 12,
      sim_ffs_hours: 0,
      flight_hours: 0,
      description: 'Flight Training Device FMC programming, FMGS abnormal management',
      has_exam_or_check: false,
      passing_score_percent: 75,
      requires_stage_cleared_to_proceed: true,
    },
    {
      stage_id: 'STAGE-3',
      stage_number: 3,
      stage_name: 'Full Flight Simulator (FFS Phase)',
      stage_type: 'FFS_FULL_SIM',
      ground_hours: 12,
      sim_ftd_hours: 0,
      sim_ffs_hours: 28,
      flight_hours: 0,
      description: 'Level D FFS handling, single-engine go-arounds, windshear, CAT II/III ILS',
      has_exam_or_check: false,
      passing_score_percent: 80,
      requires_stage_cleared_to_proceed: true,
    },
    {
      stage_id: 'STAGE-4',
      stage_number: 4,
      stage_name: 'CA-40 Skill Test & IR Check',
      stage_type: 'SKILL_TEST_CHECK',
      ground_hours: 4,
      sim_ftd_hours: 0,
      sim_ffs_hours: 4,
      flight_hours: 0,
      description: 'DGCA Designated Examiner Skill Test on Level D FFS',
      has_exam_or_check: true,
      passing_score_percent: 85,
      requires_stage_cleared_to_proceed: true,
    },
  ]);

  if (!isCreateCourseModalOpen) return null;

  const totalGround = stages.reduce((acc, s) => acc + s.ground_hours, 0);
  const totalFtd = stages.reduce((acc, s) => acc + s.sim_ftd_hours, 0);
  const totalFfs = stages.reduce((acc, s) => acc + s.sim_ffs_hours, 0);
  const totalCourseHours = totalGround + totalFtd + totalFfs;

  const handleAddStage = () => {
    const nextNum = stages.length + 1;
    const newStage: CourseStage = {
      stage_id: `STAGE-${nextNum}`,
      stage_number: nextNum,
      stage_name: `New Stage ${nextNum}`,
      stage_type: 'GROUND_THEORY',
      ground_hours: 10,
      sim_ftd_hours: 0,
      sim_ffs_hours: 0,
      flight_hours: 0,
      description: 'Custom curriculum phase description',
      has_exam_or_check: false,
      passing_score_percent: 80,
      requires_stage_cleared_to_proceed: true,
    };
    setStages([...stages, newStage]);
  };

  const handleRemoveStage = (idx: number) => {
    if (stages.length <= 1) return;
    const updated = stages.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      stage_number: i + 1,
      stage_id: `STAGE-${i + 1}`,
    }));
    setStages(updated);
  };

  const handleStageChange = (index: number, field: keyof CourseStage, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseTitle) return;

    const newCourse: TrainingCourse = {
      id: `course-${Date.now()}`,
      course_code: courseCode,
      course_title: courseTitle,
      aircraft_type_id: fleetCode,
      aircraft_type_name: fleets.find((f) => f.id === fleetCode)?.model_name || fleetCode,
      target_audience: audience,
      has_mcc_jit: hasMccJit,
      mcc_jit_hours: hasMccJit ? 20 : 0,
      total_ground_hours: totalGround,
      total_ftd_hours: totalFtd,
      total_ffs_hours: totalFfs,
      total_course_hours: totalCourseHours,
      estimated_duration_days: Math.ceil(totalCourseHours / 6) + 5,
      description,
      stages,
      is_active: true,
    };

    addCourse(newCourse);
    setIsCreateCourseModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Create Training Course & Syllabus
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Configure curriculum stages, MCC/JIT inclusion, exam checkpoints, and stage gate prerequisites
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateCourseModalOpen(false)}
            aria-label="Close create course modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Course Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. TR-A320-FAST"
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. A320 Type Rating for Type-Rated Pilots (Without MCC/JIT)"
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Row 2: Fleet & Audience & MCC/JIT Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Aircraft Fleet Type
              </label>
              <select
                value={fleetCode}
                onChange={(e) => setFleetCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value="A320">Airbus A320</option>
                <option value="B737">Boeing 737</option>
                <option value="ATR 72-600">ATR 72-600</option>
                <option value="Q400">DHC-8 Q400</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Target Pilot Cohort
              </label>
              <select
                value={audience}
                onChange={(e) => {
                  const aud = e.target.value as CourseAudience;
                  setAudience(aud);
                  // Automatically toggle MCC/JIT based on audience
                  if (aud === 'FRESHER_AB_INITIO') {
                    setHasMccJit(true);
                  } else if (aud === 'TYPE_RATED_TRANSITION') {
                    setHasMccJit(false);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value="FRESHER_AB_INITIO">Fresher / Ab-Initio (Needs MCC/JIT)</option>
                <option value="TYPE_RATED_TRANSITION">Type-Rated Transition (No MCC/JIT)</option>
                <option value="CAPTAIN_UPGRADE">Captain Command Upgrade</option>
                <option value="RECURRENT_REFRESHER">Recurrent Refresher</option>
                <option value="SPECIAL_OPERATIONS">Special Operations (UPRT/PBN)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                MCC / JIT Module Status
              </label>
              <div
                onClick={() => setHasMccJit(!hasMccJit)}
                className={`w-full p-2 rounded-xl border text-xs font-mono font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                  hasMccJit
                    ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300'
                    : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <span>{hasMccJit ? 'WITH MCC / JIT (20h)' : 'WITHOUT MCC / JIT (Exempt)'}</span>
                <span className="text-[10px] underline">Toggle</span>
              </div>
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              Course Scope & Regulatory Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Row 4: Curriculum Stages Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-skyline-500" />
                <label className="text-xs font-mono font-semibold text-slate-800 dark:text-white">
                  Curriculum Stages & Checkpoints ({stages.length} Stages • {totalCourseHours} Total Hours)
                </label>
              </div>

              <button
                type="button"
                onClick={handleAddStage}
                className="px-2.5 py-1 rounded-xl bg-skyline-100 dark:bg-skyline-500/20 text-skyline-700 dark:text-skyline-300 hover:bg-skyline-200 text-xs font-mono font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stage
              </button>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage, idx) => (
                <div
                  key={stage.stage_id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-3 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-skyline-500 text-white font-bold flex items-center justify-center text-xs">
                        {stage.stage_number}
                      </span>
                      <input
                        type="text"
                        value={stage.stage_name}
                        onChange={(e) => handleStageChange(idx, 'stage_name', e.target.value)}
                        placeholder="Stage Name"
                        className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-aviation-700 focus:outline-none focus:border-skyline-500 text-xs px-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={stage.stage_type}
                        onChange={(e) => handleStageChange(idx, 'stage_type', e.target.value)}
                        className="bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg px-2 py-1 text-[11px]"
                      >
                        <option value="GROUND_THEORY">Ground Theory</option>
                        <option value="MCC_JIT">MCC / JIT</option>
                        <option value="FTD_PROCEDURES">FTD Procedures</option>
                        <option value="FFS_FULL_SIM">FFS Simulator</option>
                        <option value="SKILL_TEST_CHECK">Skill Test / Check</option>
                      </select>

                      {stages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-500 block text-[10px]">Ground Hrs</label>
                      <input
                        type="number"
                        min="0"
                        value={stage.ground_hours}
                        onChange={(e) => handleStageChange(idx, 'ground_hours', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1 text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block text-[10px]">FTD Hrs</label>
                      <input
                        type="number"
                        min="0"
                        value={stage.sim_ftd_hours}
                        onChange={(e) => handleStageChange(idx, 'sim_ftd_hours', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1 text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block text-[10px]">FFS Hrs</label>
                      <input
                        type="number"
                        min="0"
                        value={stage.sim_ffs_hours}
                        onChange={(e) => handleStageChange(idx, 'sim_ffs_hours', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1 text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block text-[10px]">Exam / Test?</label>
                      <button
                        type="button"
                        onClick={() => handleStageChange(idx, 'has_exam_or_check', !stage.has_exam_or_check)}
                        className={`w-full p-1 rounded-lg border text-center font-bold text-[10px] ${
                          stage.has_exam_or_check
                            ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-300 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-aviation-950 border-slate-200 text-slate-500'
                        }`}
                      >
                        {stage.has_exam_or_check ? 'YES (Exam)' : 'NO'}
                      </button>
                    </div>

                    <div>
                      <label className="text-slate-500 block text-[10px]">Pass %</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={stage.passing_score_percent}
                        onChange={(e) => handleStageChange(idx, 'passing_score_percent', parseInt(e.target.value) || 80)}
                        className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1 text-center font-bold text-skyline-600 dark:text-skyline-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-aviation-800">
            <div className="text-xs font-mono text-slate-500">
              Total Ground: <strong className="text-slate-900 dark:text-white">{totalGround}h</strong> • FTD:{' '}
              <strong className="text-slate-900 dark:text-white">{totalFtd}h</strong> • FFS:{' '}
              <strong className="text-slate-900 dark:text-white">{totalFfs}h</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateCourseModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20"
              >
                Create & Publish Course
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
