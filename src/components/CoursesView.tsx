'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  BookOpen,
  Plus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  Sparkles,
  Plane,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Users,
} from 'lucide-react';
import { TrainingCourse, CourseAudience } from '@/types';

export const CoursesView: React.FC = () => {
  const {
    courses,
    setIsCreateCourseModalOpen,
    fleets,
    setActiveTab,
  } = useStore();

  const [fleetFilter, setFleetFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-1');

  const filteredCourses = courses.filter((c) => {
    if (fleetFilter !== 'ALL' && c.aircraft_type_id !== fleetFilter) return false;
    if (audienceFilter !== 'ALL' && c.target_audience !== audienceFilter) return false;
    return true;
  });

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || filteredCourses[0] || courses[0];

  const getAudienceBadge = (aud: CourseAudience) => {
    switch (aud) {
      case 'FRESHER_AB_INITIO':
        return { label: 'Fresher Ab-Initio', class: 'bg-skyline-50 dark:bg-skyline-500/15 text-skyline-700 dark:text-skyline-300 border-skyline-200 dark:border-skyline-500/30' };
      case 'TYPE_RATED_TRANSITION':
        return { label: 'Type-Rated Transition', class: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' };
      case 'CAPTAIN_UPGRADE':
        return { label: 'Command Upgrade', class: 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' };
      default:
        return { label: 'Special Operations', class: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-skyline-500 dark:text-skyline-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Course Curricula & Syllabus Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard Type Rating Syllabi (With MCC/JIT for Freshers & Fast-Track Without MCC/JIT for TR Holders), Custom Special Courses & CBTA Stage Gate Rules
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={fleetFilter}
            onChange={(e) => setFleetFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500 font-mono"
          >
            <option value="ALL">All Aircraft Fleets</option>
            {fleets.map((f) => (
              <option key={f.id} value={f.id}>{f.model_name} ({f.variant})</option>
            ))}
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500 font-mono"
          >
            <option value="ALL">All Target Cohorts</option>
            <option value="FRESHER_AB_INITIO">With MCC/JIT (Freshers)</option>
            <option value="TYPE_RATED_TRANSITION">Without MCC/JIT (TR Holders)</option>
            <option value="CAPTAIN_UPGRADE">Command Upgrades</option>
            <option value="SPECIAL_OPERATIONS">Special Operations (UPRT)</option>
          </select>

          <button
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 transition-all cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Course</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Course Cards on Left, Active Course Stage Flow on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Courses Catalog List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>AVAILABLE COURSES ({filteredCourses.length})</span>
            <span>CLICK TO VIEW SYLLABUS</span>
          </div>

          <div className="space-y-3">
            {filteredCourses.map((course) => {
              const isSelected = activeCourse?.id === course.id;
              const audBadge = getAudienceBadge(course.target_audience);

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white dark:bg-aviation-900 border-skyline-500 shadow-md dark:shadow-glow-cyan'
                      : 'bg-white/80 dark:bg-aviation-900/60 border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-aviation-950 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs border border-slate-200 dark:border-aviation-800">
                          {course.course_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${audBadge.class}`}>
                          {audBadge.label}
                        </span>
                      </div>
                      <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white pt-1">
                        {course.course_title}
                      </h3>
                    </div>

                    <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-skyline-500 translate-x-1' : 'text-slate-400'}`} />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-aviation-800/60 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${course.has_mcc_jit ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>
                        {course.has_mcc_jit ? '✓ WITH MCC/JIT (20h)' : '✗ WITHOUT MCC/JIT'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {course.total_course_hours} Total Hours
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Course Detailed Syllabus & Stage Gate Pipeline */}
        {activeCourse && (
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-6 shadow-sm dark:shadow-none">
              {/* Course Overview Bar */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-skyline-50 dark:bg-skyline-500/15 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/30 text-xs font-mono font-bold">
                      {activeCourse.course_code}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Aircraft Fleet: {activeCourse.aircraft_type_name}
                    </span>
                  </div>
                  <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                    {activeCourse.course_title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {activeCourse.description}
                  </p>
                </div>
              </div>

              {/* Course Hour Breakdown Metric Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">GROUND THEORY</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">{activeCourse.total_ground_hours}h</span>
                  <span className="text-[10px] text-slate-400 block">Classroom & CBT</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">FTD LEVEL 2</span>
                  <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">{activeCourse.total_ftd_hours}h</span>
                  <span className="text-[10px] text-slate-400 block">Procedures & FMC</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">FFS LEVEL D</span>
                  <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">{activeCourse.total_ffs_hours}h</span>
                  <span className="text-[10px] text-slate-400 block">Full Flight Sim</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">MCC / JIT MODULE</span>
                  <span className="text-base font-extrabold text-skyline-600 dark:text-skyline-400">
                    {activeCourse.has_mcc_jit ? `${activeCourse.mcc_jit_hours}h` : 'EXEMPT'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{activeCourse.has_mcc_jit ? 'Included' : 'For TR Holders'}</span>
                </div>
              </div>

              {/* Stage Gate Progression Visualizer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    <Layers className="w-4 h-4 text-skyline-500" />
                    <span>Curriculum Stage Gates & Evaluation Checkpoints ({activeCourse.stages.length} Stages)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                    Stage Gate Strict Prerequisite Active
                  </span>
                </div>

                <div className="space-y-3">
                  {activeCourse.stages.map((stage, idx) => (
                    <div
                      key={stage.stage_id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-aviation-950/60 border border-slate-200 dark:border-aviation-800 space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-skyline-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs font-mono shadow-sm">
                            {stage.stage_number}
                          </div>
                          <div>
                            <div className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                              {stage.stage_name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              Stage Type: {stage.stage_type.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          {stage.has_exam_or_check ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              Exam Pass Mark: {stage.passing_score_percent}%
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-aviation-900 text-slate-600 dark:text-slate-400 text-[10px]">
                              Continuous Assessment
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-11">
                        {stage.description}
                      </p>

                      <div className="pl-11 pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {stage.ground_hours > 0 && <span>Ground: <strong className="text-slate-900 dark:text-white">{stage.ground_hours}h</strong></span>}
                        {stage.sim_ftd_hours > 0 && <span>FTD: <strong className="text-cyan-600 dark:text-cyan-400">{stage.sim_ftd_hours}h</strong></span>}
                        {stage.sim_ffs_hours > 0 && <span>FFS: <strong className="text-purple-600 dark:text-purple-400">{stage.sim_ffs_hours}h</strong></span>}
                        {stage.requires_stage_cleared_to_proceed && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            ⚠️ Blocker: Must pass before Stage {idx + 2}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2 border-t border-slate-200 dark:border-aviation-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-500">
                  Ready to enrol trainee batch into {activeCourse.course_code}?
                </div>
                <button
                  onClick={() => setActiveTab('cadets')}
                  className="px-4 py-2 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-skyline-500/20"
                >
                  <GraduationCap className="w-4 h-4" />
                  View Enrolled Trainees & ETR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
