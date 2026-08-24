'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import {
  Activity,
  Calendar,
  Clock,
  Cpu,
  GraduationCap,
  PlaneTakeoff,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  Layers,
  BarChart3,
  Search,
  RotateCw,
  TrendingUp,
  Download,
} from 'lucide-react';
import { TrainingScheduleSession } from '@/types';

export const DashboardView: React.FC = () => {
  const {
    organisation,
    fleets,
    batches,
    instructors,
    simulators,
    students,
    schedules,
    setActiveTab,
    setSelectedSessionModal,
    setSelectedCalendarDate,
    setCalendarView,
    setIsAddInstructorModalOpen,
    setIsCreateBatchModalOpen,
    setIsExportPrintModalOpen,
    setRenewModalInstructor,
  } = useStore();

  const todayStr = '2026-08-25';
  const todaySchedules = schedules.filter((s) => s.date === todayStr);

  const totalSimHoursToday = todaySchedules
    .filter((s) => s.phase === 'SIM_FFS' || s.phase === 'SIM_FTD' || s.phase === 'SKILL_TEST')
    .reduce((acc, s) => acc + s.sim_hours, 0);

  const totalBriefingHoursToday = todaySchedules.reduce((acc, s) => acc + s.briefing_hours, 0);

  const handleOpenSessionInspector = (session: TrainingScheduleSession) => {
    setSelectedSessionModal(session);
  };

  // Instructors inside 3-month window or needing check
  const instructorsInGraceWindow = instructors.filter(
    (ins) => ins.recurrent_status === 'EXPIRING' || ins.is_locked_out
  );

  // Utilization chart data for 7 days
  const weekDays = [
    { day: 'Mon', date: '2026-08-24', ffsHours: 14.5, ftdHours: 4.0, targetHours: 18.0 },
    { day: 'Tue (Today)', date: '2026-08-25', ffsHours: 14.0, ftdHours: 4.0, targetHours: 18.0 },
    { day: 'Wed', date: '2026-08-26', ffsHours: 16.0, ftdHours: 2.0, targetHours: 18.0 },
    { day: 'Thu', date: '2026-08-27', ffsHours: 12.0, ftdHours: 6.0, targetHours: 18.0 },
    { day: 'Fri', date: '2026-08-28', ffsHours: 15.0, ftdHours: 3.5, targetHours: 18.0 },
    { day: 'Sat', date: '2026-08-29', ffsHours: 10.0, ftdHours: 4.0, targetHours: 18.0 },
    { day: 'Sun', date: '2026-08-30', ffsHours: 8.0, ftdHours: 2.0, targetHours: 18.0 },
  ];

  // Pipeline summary
  const totalCadets = students.length;
  const groundCadets = students.filter((s) => !s.ground_tech_completed || !s.ground_perf_completed).length;
  const simCadets = students.filter((s) => s.ground_tech_completed && s.ground_perf_completed && !s.skill_test_cleared).length;
  const licensedCadets = students.filter((s) => s.skill_test_cleared).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Strip */}
      <div className="p-6 rounded-3xl bg-aviation-900/90 border border-aviation-800 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Live Operations Dispatch
            </span>
            <span className="text-xs text-slate-500 font-mono">• {organisation.ato_approval_number}</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white mt-1">
            Flight Training Operations Cockpit
          </h1>
          <p className="text-xs text-slate-400">
            Real-time simulator telemetry, instructor duty limitations, cadet syllabus progression & DGCA CAR regulatory compliance
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddInstructorModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aviation-950 hover:bg-aviation-800 border border-aviation-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-skyline-400" />
            <span>+ Instructor</span>
          </button>

          <button
            onClick={() => setIsCreateBatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aviation-950 hover:bg-aviation-800 border border-aviation-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ New Batch</span>
          </button>

          <button
            onClick={() => setIsExportPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aviation-950 hover:bg-aviation-800 border border-aviation-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export / Print</span>
          </button>

          <button
            onClick={() => {
              setSelectedCalendarDate(todayStr);
              setCalendarView('day');
              setActiveTab('calendar');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aviation-950 hover:bg-aviation-800 border border-aviation-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Master Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduler')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch Session</span>
          </button>
        </div>
      </div>

      {/* 2. Key Operational Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveTab('fleets')}
          className="p-5 rounded-2xl bg-aviation-900/60 border border-aviation-800/80 hover:border-aviation-700 cursor-pointer transition-all backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Simulator Fleet</span>
            <Cpu className="w-4 h-4 text-skyline-400" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-white">4 / 4 Available</div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>2 FFS Level D • 1 FTD</span>
            <span className="text-emerald-400 font-bold">100% Ready</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => {
            setSelectedCalendarDate(todayStr);
            setCalendarView('day');
            setActiveTab('calendar');
          }}
          className="p-5 rounded-2xl bg-aviation-900/60 border border-aviation-800/80 hover:border-aviation-700 cursor-pointer transition-all backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Today's Sessions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-white">{todaySchedules.length} Scheduled</div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{totalSimHoursToday}h Sim • {totalBriefingHoursToday}h Brief</span>
            <span className="text-skyline-400 font-bold">18.0h Total</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('instructors')}
          className="p-5 rounded-2xl bg-aviation-900/60 border border-aviation-800/80 hover:border-aviation-700 cursor-pointer transition-all backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Instructor Roster</span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-white">{instructors.length} Instructors</div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>5-Yr DGCA Authorized</span>
            <span className={instructorsInGraceWindow.length > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {instructorsInGraceWindow.length} In Window
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActiveTab('pipeline')}
          className="p-5 rounded-2xl bg-aviation-900/60 border border-aviation-800/80 hover:border-aviation-700 cursor-pointer transition-all backdrop-blur-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Cadet Pipeline</span>
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-white">{totalCadets} Cadets</div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{batches.length} Airline Batches</span>
            <span className="text-skyline-400 font-bold">{simCadets} In Simulator</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts & Fleet Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Chart: 7-Day Simulator Utilization Trend (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-skyline-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  7-Day Simulator Fleet Utilization
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full Flight Simulator (FFS Level D) and Flight Training Device (FTD) daily instructional hours
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-skyline-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-skyline-500"></span> FFS Hours
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> FTD Hours
              </span>
            </div>
          </div>

          {/* SVG Bar Graph */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-3 items-end h-44 border-b border-aviation-800 pb-2">
              {weekDays.map((item, idx) => {
                const total = item.ffsHours + item.ftdHours;
                const ffsHeightPct = (item.ffsHours / 20.0) * 100;
                const ftdHeightPct = (item.ftdHours / 20.0) * 100;
                const isToday = item.day.includes('Today');

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                      {total}h
                    </div>

                    <div className={`w-full max-w-[36px] rounded-lg overflow-hidden flex flex-col justify-end transition-all ${isToday ? 'ring-2 ring-skyline-500/50 shadow-glow-cyan' : 'opacity-80 group-hover:opacity-100'}`} style={{ height: `${(total / 20.0) * 100}%` }}>
                      {/* FTD bar portion */}
                      <div className="bg-indigo-500" style={{ height: `${(item.ftdHours / total) * 100}%` }}></div>
                      {/* FFS bar portion */}
                      <div className="bg-gradient-to-t from-skyline-600 to-skyline-400" style={{ height: `${(item.ffsHours / total) * 100}%` }}></div>
                    </div>

                    <div className={`text-[11px] font-mono text-center truncate ${isToday ? 'text-skyline-400 font-bold' : 'text-slate-400'}`}>
                      {item.day.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>Target Capacity: 18.0h / day per device</span>
            <span className="text-emerald-400 font-semibold">Weekly Average: 17.6h / day</span>
          </div>
        </div>

        {/* Cadet Pipeline Stage Distribution (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 space-y-4 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  Cadet Cohort Syllabus Funnel
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{totalCadets} Cadets</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active student progression across Ground, Simulator FFS, and CA-40 Check
            </p>
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-3">
            {/* Stage 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Phase 1: Ground Technical & Perf</span>
                <span className="text-amber-400 font-semibold">{groundCadets} Cadets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-aviation-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${(groundCadets / totalCadets) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Phase 2: FFS Level D Motion Sim</span>
                <span className="text-skyline-400 font-semibold">{simCadets} Cadets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-aviation-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-skyline-500"
                  style={{ width: `${(simCadets / totalCadets) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Phase 3: CA-40 Skill Test Passed</span>
                <span className="text-emerald-400 font-semibold">{licensedCadets} Cadets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-aviation-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${(licensedCadets / totalCadets) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action to view pipeline */}
          <button
            onClick={() => setActiveTab('pipeline')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-aviation-950 hover:bg-aviation-800 border border-aviation-800 text-xs font-semibold text-slate-200 transition-all group"
          >
            <span>View All Cohort Batches</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4. Instructor Standardization & Grace Window Alert Banner */}
      {instructorsInGraceWindow.length > 0 && (
        <div className="p-5 rounded-3xl bg-aviation-900/90 border border-amber-500/30 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading font-bold text-sm text-white">
                Instructor Standardization & Recurrent Renewal Radar ({instructorsInGraceWindow.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400">
              Preserves Base Month within 3-Month Window
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {instructorsInGraceWindow.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-2xl bg-aviation-950/80 border border-aviation-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-aviation-800 border border-aviation-700 flex items-center justify-center font-heading font-bold text-skyline-400 text-xs">
                    {ins.avatar_initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{ins.full_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Base: <strong className="text-skyline-400">{ins.base_month}</strong> • Due: {ins.recurrent_expiry}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setRenewModalInstructor(ins)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Log Check</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Today's Simulator Bay Telemetry & Operations Schedule */}
      <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-aviation-800 pb-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Today's Flight & Simulator Operations
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Tuesday, 25 August 2026 • {todaySchedules.length} Sessions Active
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCalendarDate(todayStr);
              setCalendarView('day');
              setActiveTab('calendar');
            }}
            className="text-xs font-mono text-skyline-400 hover:text-skyline-300 flex items-center gap-1 font-semibold"
          >
            <span>Open Timeline Grid</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-aviation-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">TIME</th>
                <th className="pb-3 font-semibold">SESSION / SYLLABUS</th>
                <th className="pb-3 font-semibold">FLEET / BAY</th>
                <th className="pb-3 font-semibold">INSTRUCTOR</th>
                <th className="pb-3 font-semibold">CADETS</th>
                <th className="pb-3 font-semibold">DUTY HOURS</th>
                <th className="pb-3 font-semibold text-right">INSPECTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-800/50 font-mono">
              {todaySchedules.map((s) => (
                <tr key={s.id} className="hover:bg-aviation-950/40 transition-colors">
                  <td className="py-3 text-skyline-400 font-bold">
                    {s.start_time} – {s.end_time}
                  </td>
                  <td className="py-3">
                    <div className="font-sans font-semibold text-white">{s.session_title}</div>
                    <div className="text-[10px] text-slate-400">{s.session_code} • {s.batch_code}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-aviation-950 border border-aviation-800 text-[10px] text-slate-200">
                      {s.resource_name}
                    </span>
                  </td>
                  <td className="py-3 font-sans text-slate-200">
                    {s.instructor_name}
                  </td>
                  <td className="py-3 font-sans text-slate-300">
                    {s.student_names.join(', ')}
                  </td>
                  <td className="py-3 text-slate-300">
                    {s.total_duty_hours}h ({s.sim_hours}h Sim + {s.briefing_hours}h Brief)
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenSessionInspector(s)}
                      className="px-2.5 py-1 rounded-lg bg-skyline-500/10 hover:bg-skyline-500/20 text-skyline-300 border border-skyline-500/30 text-[10px] font-semibold transition-all"
                    >
                      Clearance Check
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
