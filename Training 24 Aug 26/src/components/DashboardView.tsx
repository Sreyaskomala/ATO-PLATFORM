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
  Sparkles,
  BarChart3,
  Search,
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

  const handleGoToCalendarDay = () => {
    setSelectedCalendarDate(todayStr);
    setCalendarView('day');
    setActiveTab('calendar');
  };

  const handleQuickSchedule = () => {
    setActiveTab('scheduler');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Cockpit Overview */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-aviation-900 via-aviation-900/90 to-aviation-950 border border-aviation-800/80 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-skyline-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ATO Operational Dispatch Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {organisation.ato_approval_number}
              </span>
            </div>

            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">
              Flight Training Operations Cockpit
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time simulator bay telemetry, instructor duty legality, cadet CBTA syllabus tracking, and DGCA CAR Section 7 & 8 regulatory verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => useStore.getState().setIsAddInstructorModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-aviation-800 hover:bg-aviation-700 text-slate-200 text-xs font-semibold border border-aviation-700 transition-all shadow-sm hover:text-white"
            >
              <UserCheck className="w-4 h-4 text-skyline-400" />
              <span>+ Onboard Instructor</span>
            </button>

            <button
              onClick={() => useStore.getState().setIsCreateBatchModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-aviation-800 hover:bg-aviation-700 text-slate-200 text-xs font-semibold border border-aviation-700 transition-all shadow-sm hover:text-white"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>+ New Batch</span>
            </button>

            <button
              onClick={handleGoToCalendarDay}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-aviation-800 hover:bg-aviation-700 text-slate-200 text-xs font-semibold border border-aviation-700 transition-all shadow-sm hover:text-white"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Master Calendar</span>
            </button>

            <button
              onClick={handleQuickSchedule}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Dispatch Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: FSTD Fleet */}
        <div className="p-6 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-skyline-500/10 border border-skyline-500/30 flex items-center justify-center text-skyline-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              100% READY
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-heading font-extrabold text-white">4 / 4 Online</div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">Simulator Bays Operational</div>
          </div>
          <div className="mt-3 pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>2 FFS Level D • 1 FTD</span>
            <span className="text-emerald-400">0 AOG</span>
          </div>
        </div>

        {/* Card 2: Today's Operations */}
        <div className="p-6 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-skyline-500/10 text-skyline-300 border border-skyline-500/30">
              TODAY
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-heading font-extrabold text-white">
              {todaySchedules.length} Sessions
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">
              {totalSimHoursToday}h Simulator • {totalBriefingHoursToday}h Briefing
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>1 In Session • 4 Scheduled</span>
            <span className="text-skyline-400">All Cleared</span>
          </div>
        </div>

        {/* Card 3: Instructor FDTL Capacity */}
        <div className="p-6 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              FDTL OK
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-heading font-extrabold text-white">22.4 h Avg</div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">7-Day Rolling Duty Load</div>
          </div>
          <div className="mt-3 pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>4 Instructors Active</span>
            <span className="text-amber-400">1 Window Open</span>
          </div>
        </div>

        {/* Card 4: Cadet Progression */}
        <div className="p-6 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl group">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              4 BATCHES
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-heading font-extrabold text-white">6 Cadets</div>
            <div className="text-xs text-slate-400 mt-0.5 font-medium">Active Across Syllabus Phases</div>
          </div>
          <div className="mt-3 pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>2 Approaching Skill Test</span>
            <span className="text-emerald-400">On Track</span>
          </div>
        </div>
      </div>

      {/* Simulator Bay Status Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-skyline-400" />
            <h2 className="text-lg font-heading font-bold text-white">Live Simulator Bay Telemetry</h2>
          </div>
          <button
            onClick={() => setActiveTab('fleets')}
            className="text-xs text-skyline-400 hover:text-skyline-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View All Devices & MMI Logs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {simulators.map((sim) => {
            const activeSession = todaySchedules.find(
              (s) => s.resource_id === sim.id && s.status === 'IN_PROGRESS'
            );
            const nextSession = todaySchedules.find(
              (s) => s.resource_id === sim.id && s.status === 'CONFIRMED'
            );

            return (
              <div
                key={sim.id}
                className="p-5 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          activeSession
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      ></span>
                      <span className="font-heading font-bold text-sm text-white">
                        {sim.resource_name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-aviation-800 text-skyline-300 border border-aviation-700">
                      {sim.level}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-slate-200 font-semibold">{sim.bay_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authority:</span>
                      <span className="text-slate-200">{sim.approval_authority}</span>
                    </div>
                  </div>

                  {activeSession ? (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> IN SESSION ({activeSession.start_time} - {activeSession.end_time})
                      </div>
                      <div className="text-xs font-bold text-white mt-1 truncate">
                        {activeSession.session_title}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 truncate">
                        {activeSession.instructor_name}
                      </div>
                    </div>
                  ) : nextSession ? (
                    <div className="mt-4 p-3 rounded-xl bg-aviation-950/60 border border-aviation-800/80">
                      <div className="text-[10px] font-mono text-skyline-400 uppercase tracking-wider">
                        Next: {nextSession.start_time} - {nextSession.end_time}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                        {nextSession.session_title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {nextSession.instructor_name}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 rounded-xl bg-aviation-950/40 border border-aviation-800/50 text-center text-xs text-slate-500 font-mono">
                      Bay Standby • Ready for Dispatch
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Cert: {sim.approval_number}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Exp: {sim.approval_expiry}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Today's Dispatch & Go/No-Go Readiness */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="w-5 h-5 text-skyline-400" />
              <h2 className="text-lg font-heading font-bold text-white">
                Today's Flight & Simulator Operations ({todaySchedules.length})
              </h2>
            </div>
            <button
              onClick={handleGoToCalendarDay}
              className="text-xs text-skyline-400 hover:text-skyline-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Full Timeline Grid</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-skyline-500/15 text-skyline-300 border border-skyline-500/30">
                      {session.session_code}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                        session.phase === 'SKILL_TEST'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : session.phase === 'SIM_FFS'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : session.phase === 'SIM_FTD'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {session.phase.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {session.aircraft_type_name}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-white truncate">
                    {session.session_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-skyline-400" />
                      {session.start_time} - {session.end_time} ({session.total_duty_hours}h)
                    </span>
                    <span>•</span>
                    <span className="text-slate-200">
                      {session.instructor_name} ({session.instructor_role})
                    </span>
                    <span>•</span>
                    <span className="text-skyline-300 truncate">
                      {session.resource_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleOpenSessionInspector(session)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inspect Legality</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Instructor Legality & Recurrent Radar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-skyline-400" />
              <h2 className="text-lg font-heading font-bold text-white">Instructor Legality Radar</h2>
            </div>
            <button
              onClick={() => setActiveTab('instructors')}
              className="text-xs text-skyline-400 hover:text-skyline-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Full Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {instructors.map((ins) => (
              <div
                key={ins.id}
                className="p-5 rounded-2xl bg-aviation-900/70 border border-aviation-800/80 hover:border-aviation-700 transition-all backdrop-blur-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-skyline-600 flex items-center justify-center font-heading font-bold text-sm text-white shadow-md">
                      {ins.avatar_initials}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">
                        {ins.full_name}
                      </div>
                      <div className="text-[11px] font-mono text-skyline-300">
                        {ins.roles.join(' • ')} | {ins.assigned_fleets.join(', ')}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                      ins.recurrent_status === 'VALID'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : ins.recurrent_status === 'EXPIRING'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {ins.recurrent_status}
                  </span>
                </div>

                {/* Duty Load Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">DGCA 7-Day Duty Limit</span>
                    <span className="text-slate-200 font-semibold">
                      {ins.id === 'ins-sfi-high-fdtl' ? '28.0h / 30.0h (93%)' : '18.0h / 30.0h (60%)'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-aviation-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ins.id === 'ins-sfi-high-fdtl'
                          ? 'w-[93%] bg-amber-400'
                          : 'w-[60%] bg-emerald-400'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Recurrent Countdown */}
                <div className="pt-2 border-t border-aviation-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Base Month: {ins.base_month}</span>
                  <span className="text-slate-300">Valid to {ins.recurrent_expiry}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cadet Cohort Progression Funnel */}
      <div className="p-6 rounded-3xl bg-aviation-900/70 border border-aviation-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-skyline-400" />
            <h2 className="text-lg font-heading font-bold text-white">Active Cadet Cohort Pipeline</h2>
          </div>
          <button
            onClick={() => setActiveTab('pipeline')}
            className="text-xs text-skyline-400 hover:text-skyline-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Inspect CBTA Framework</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {batches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-aviation-950/60 border border-aviation-800/80 hover:border-aviation-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-skyline-300">{b.batch_code}</span>
                  <span className="text-[10px] font-mono text-slate-400">{b.airline_operator}</span>
                </div>
                <div className="text-sm font-heading font-bold text-white truncate">{b.batch_name}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">{b.aircraft_type_name}</div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Current: {b.current_phase.replace('_', ' ')}</span>
                  <span className="text-skyline-400 font-bold">{b.progress_percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-aviation-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-skyline-500 to-indigo-500 rounded-full"
                    style={{ width: `${b.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono text-right">
                  {b.students_count} Cadets Enrolled
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
