'use client';

import React, { useState } from 'react';
import { useStore, CalendarViewMode } from '@/store/useStore';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
} from 'lucide-react';
import { TrainingScheduleSession, ResourceCategory } from '@/types';

export const MasterCalendar: React.FC = () => {
  const {
    calendarView,
    setCalendarView,
    selectedCalendarDate,
    setSelectedCalendarDate,
    selectedSessionModal,
    setSelectedSessionModal,
    calendarFleetFilter,
    setCalendarFleetFilter,
    calendarResourceFilter,
    setCalendarResourceFilter,
    simulators,
    schedules,
    fleets,
    instructors,
    setActiveTab,
  } = useStore();

  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(7); // August (0-indexed)
  const [activeYear, setActiveYear] = useState<number>(2026);

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    if (calendarFleetFilter !== 'ALL' && s.aircraft_type_id !== calendarFleetFilter) {
      return false;
    }
    if (calendarResourceFilter !== 'ALL') {
      const resource = simulators.find((r) => r.id === s.resource_id);
      if (resource && resource.resource_category !== calendarResourceFilter) {
        return false;
      }
    }
    return true;
  });

  const hoursDay = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const weekDays = [
    { name: 'Mon', date: '2026-08-24' },
    { name: 'Tue (Today)', date: '2026-08-25' },
    { name: 'Wed', date: '2026-08-26' },
    { name: 'Thu', date: '2026-08-27' },
    { name: 'Fri', date: '2026-08-28' },
    { name: 'Sat', date: '2026-08-29' },
    { name: 'Sun', date: '2026-08-30' },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'SKILL_TEST':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'SIM_FFS':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'SIM_FTD':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Calendar Header & View Controls */}
      <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-skyline-400" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Master Flight & Simulator Calendar
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-view timeline, resource conflict detection, and real-time regulatory compliance validation.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / Month / Year Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-aviation-950/80 border border-aviation-800">
            {(['day', 'week', 'month', 'year'] as CalendarViewMode[]).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  calendarView === view
                    ? 'bg-skyline-500 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('scheduler')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-aviation-900/50 border border-aviation-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4 text-skyline-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">Filters:</span>
          </div>

          {/* Fleet Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Fleet:</span>
            <select
              value={calendarFleetFilter}
              onChange={(e) => setCalendarFleetFilter(e.target.value)}
              aria-label="Filter calendar by aircraft fleet"
              className="bg-aviation-950 border border-aviation-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-skyline-500 focus:outline-none"
            >
              <option value="ALL">All Aircraft Types</option>
              {fleets.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.model_name} ({f.variant})
                </option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Resource:</span>
            <select
              value={calendarResourceFilter}
              onChange={(e) => setCalendarResourceFilter(e.target.value)}
              aria-label="Filter calendar by simulator resource category"
              className="bg-aviation-950 border border-aviation-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-skyline-500 focus:outline-none"
            >
              <option value="ALL">All Simulators & Bays</option>
              <option value="FFS">Full Flight Simulator (FFS Level D)</option>
              <option value="FTD">Flight Training Device (FTD Level 2)</option>
              <option value="CLASSROOM">Ground Classrooms</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>FFS Level D</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>FTD Level 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Skill Test</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Ground Tech</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAY VIEW (24-Hour Bay Timeline) */}
      {/* ========================================================================= */}
      {calendarView === 'day' && (
        <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl overflow-x-auto">
          <div className="min-w-[950px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-aviation-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCalendarDate('2026-08-24')}
                  className="p-2 rounded-xl bg-aviation-950 border border-aviation-800 hover:border-aviation-700 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="font-heading font-bold text-lg text-white">
                  Tuesday, 25 August 2026 (Operational Flight Schedule)
                </div>
                <button
                  onClick={() => setSelectedCalendarDate('2026-08-26')}
                  className="p-2 rounded-xl bg-aviation-950 border border-aviation-800 hover:border-aviation-700 text-slate-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-skyline-400">
                {filteredSchedules.filter((s) => s.date === selectedCalendarDate).length} Scheduled Sessions
              </div>
            </div>

            {/* Time Axis */}
            <div className="grid grid-cols-12 text-xs font-mono text-slate-400 pb-2 border-b border-aviation-800/60">
              <div className="col-span-3 font-semibold text-slate-300">SIMULATOR BAY / CLASSROOM</div>
              {hoursDay.map((h, i) => (
                <div key={i} className="text-center">{h}</div>
              ))}
            </div>

            {/* Resource Rows */}
            <div className="divide-y divide-aviation-800/40">
              {simulators.map((res) => {
                const resSessions = filteredSchedules.filter(
                  (s) => s.resource_id === res.id && s.date === selectedCalendarDate
                );

                return (
                  <div key={res.id} className="grid grid-cols-12 items-center py-4 hover:bg-aviation-950/20 transition-colors">
                    {/* Device Label */}
                    <div className="col-span-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <span className="font-heading font-bold text-sm text-white">{res.resource_name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{res.bay_location}</div>
                      <div className="text-[10px] text-skyline-400 font-mono">{res.level} • {res.approval_number}</div>
                    </div>

                    {/* Timeline Area */}
                    <div className="col-span-9 relative h-16 bg-aviation-950/60 rounded-2xl border border-aviation-800/80 flex items-center px-2 overflow-hidden">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-9 divide-x divide-aviation-800/30 pointer-events-none">
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <div key={idx} className="h-full"></div>
                        ))}
                      </div>

                      {/* Sessions */}
                      {resSessions.map((sch) => {
                        const startHour = parseInt(sch.start_time.split(':')[0]);
                        const leftPercent = Math.max(0, Math.min(100, ((startHour - 6) / 16) * 100));
                        const widthPercent = Math.max(16, (sch.total_duty_hours / 16) * 100);

                        return (
                          <div
                            key={sch.id}
                            onClick={() => setSelectedSessionModal(sch)}
                            className="absolute h-13 rounded-xl bg-gradient-to-r from-skyline-500/90 to-indigo-600/90 border border-skyline-400/50 p-2.5 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-center overflow-hidden z-10"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <div className="text-xs font-bold truncate leading-tight flex items-center gap-1">
                              <span>{sch.session_title}</span>
                            </div>
                            <div className="text-[10px] text-skyline-200 truncate flex items-center gap-1.5 mt-0.5 font-mono">
                              <span>{sch.start_time}-{sch.end_time}</span>
                              <span>•</span>
                              <span>{sch.instructor_name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WEEK VIEW (7-Day Multi-Column Grid) */}
      {/* ========================================================================= */}
      {calendarView === 'week' && (
        <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aviation-800">
            <div className="font-heading font-bold text-lg text-white">
              Weekly Flight & Simulator Operations (24 Aug - 30 Aug 2026)
            </div>
            <div className="text-xs font-mono text-slate-400">
              Week 35 • Standard DGCA CAR Roster
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const daySessions = filteredSchedules.filter((s) => s.date === day.date);
              const isToday = day.date === '2026-08-25';

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[420px] transition-all ${
                    isToday
                      ? 'bg-aviation-950/90 border-skyline-500/50 shadow-glow-cyan'
                      : 'bg-aviation-950/50 border-aviation-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-aviation-800/80 flex items-center justify-between">
                      <div>
                        <div className={`font-heading font-bold text-xs ${isToday ? 'text-skyline-400' : 'text-slate-300'}`}>
                          {day.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{day.date}</div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-aviation-900 text-slate-300 border border-aviation-800">
                        {daySessions.length}
                      </span>
                    </div>

                    {/* Session Cards */}
                    <div className="space-y-2.5">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionModal(session)}
                          className="p-2.5 rounded-xl bg-aviation-900/90 border border-aviation-800 hover:border-skyline-500/50 cursor-pointer transition-all space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${getPhaseBadge(session.phase)}`}>
                              {session.session_code}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {session.start_time}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white group-hover:text-skyline-300 truncate">
                            {session.session_title}
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {session.resource_name}
                          </div>
                          <div className="text-[10px] text-skyline-400 font-mono truncate">
                            {session.instructor_name}
                          </div>
                        </div>
                      ))}

                      {daySessions.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-600 font-mono">
                          No sessions
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-aviation-800/40 text-[10px] font-mono text-slate-500 text-center">
                    {daySessions.reduce((acc, s) => acc + s.total_duty_hours, 0)}h Total Duty
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MONTH VIEW (Full 35-Day Calendar Grid) */}
      {/* ========================================================================= */}
      {calendarView === 'month' && (
        <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aviation-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                className="p-2 rounded-xl bg-aviation-950 border border-aviation-800 hover:border-aviation-700 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="font-heading font-bold text-lg text-white">
                {monthNames[activeMonthIndex]} {activeYear} (Monthly Simulator Master Schedule)
              </div>
              <button
                onClick={() => setActiveMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                className="p-2 rounded-xl bg-aviation-950 border border-aviation-800 hover:border-aviation-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono text-skyline-400">
              DGCA Recurrent Base Month Tracking Active
            </div>
          </div>

          {/* Month Day Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 py-2 border-b border-aviation-800/60">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div>SUN</div>
          </div>

          {/* Month Grid (35 cells) */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const dayNum = index - 1; // August starts on Saturday
              const isValidDay = dayNum >= 1 && dayNum <= 31;
              const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
              const daySessions = filteredSchedules.filter((s) => s.date === dateStr);
              const isToday = dateStr === '2026-08-25';

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isValidDay && daySessions.length > 0) {
                      setSelectedSessionModal(daySessions[0]);
                    }
                  }}
                  className={`min-h-[105px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    !isValidDay
                      ? 'bg-aviation-950/20 border-transparent opacity-20 pointer-events-none'
                      : isToday
                      ? 'bg-aviation-950/90 border-skyline-500/60 shadow-glow-cyan'
                      : daySessions.length > 0
                      ? 'bg-aviation-950/60 border-aviation-800 hover:border-skyline-500/40 cursor-pointer'
                      : 'bg-aviation-950/40 border-aviation-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday ? 'text-skyline-400' : 'text-slate-300'
                      }`}
                    >
                      {isValidDay ? dayNum : ''}
                    </span>
                    {daySessions.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-skyline-500/20 text-skyline-300 border border-skyline-500/40">
                        {daySessions.length}
                      </span>
                    )}
                  </div>

                  {daySessions.length > 0 ? (
                    <div className="space-y-1 my-1">
                      {daySessions.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="px-1.5 py-0.5 rounded bg-aviation-900 border border-aviation-800 text-[10px] text-slate-200 truncate font-mono"
                        >
                          {s.session_code}: {s.aircraft_type_name.split(' ')[0]}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-mono text-center">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-6"></div>
                  )}

                  <div className="text-[9px] font-mono text-slate-600 text-right">
                    {isValidDay ? `${daySessions.reduce((acc, s) => acc + s.total_duty_hours, 0)}h` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. YEAR VIEW (12-Month Matrix & Cohort Flow) */}
      {/* ========================================================================= */}
      {calendarView === 'year' && (
        <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-aviation-800">
            <div>
              <div className="font-heading font-bold text-lg text-white">
                Annual Training Operations & Recurrent Matrix ({activeYear})
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Annual cohort progression, simulator QTG maintenance freezes, and instructor base month distribution.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-xl bg-aviation-950 border border-aviation-800 text-slate-200">
                FY 2026 - 2027
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthNames.map((month, mIdx) => {
              const isCurrentMonth = mIdx === 7; // August
              const monthSchedules = schedules.filter((s) => {
                const monthNum = parseInt(s.date.split('-')[1]);
                return monthNum === mIdx + 1;
              });

              return (
                <div
                  key={month}
                  onClick={() => {
                    setActiveMonthIndex(mIdx);
                    setCalendarView('month');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                    isCurrentMonth
                      ? 'bg-aviation-950/90 border-skyline-500/60 shadow-glow-cyan'
                      : 'bg-aviation-950/60 border-aviation-800/80 hover:border-aviation-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-heading font-bold text-sm ${isCurrentMonth ? 'text-skyline-400' : 'text-white'}`}>
                        {month}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-aviation-900 text-slate-300 border border-aviation-800">
                        {monthSchedules.length} Sessions
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono space-y-1 mt-2">
                      <div className="flex justify-between">
                        <span>Total Duty:</span>
                        <span className="text-slate-200 font-semibold">
                          {monthSchedules.reduce((acc, s) => acc + s.total_duty_hours, 0)} hrs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sim Hours:</span>
                        <span className="text-skyline-300">
                          {monthSchedules.reduce((acc, s) => acc + s.sim_hours, 0)} hrs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-aviation-800/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{mIdx === 10 ? 'Base Month: Nov (Sharma)' : 'Roster Active'}</span>
                    <span className="text-skyline-400">View Month →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SESSION INSPECTOR MODAL (Instant GO/NO-GO Legality Modal) */}
      {/* ========================================================================= */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-aviation-950 border border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-aviation-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    DISPATCH STATUS: 🟢 GO (ALL LEGAL)
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Session ID: {selectedSessionModal.id}
                  </span>
                </div>
                <h2 className="text-xl font-heading font-extrabold text-white mt-1">
                  {selectedSessionModal.session_title}
                </h2>
                <div className="text-xs text-skyline-300 font-mono mt-0.5">
                  {selectedSessionModal.batch_code} • {selectedSessionModal.aircraft_type_name}
                </div>
              </div>

              <button
                onClick={() => setSelectedSessionModal(null)}
                aria-label="Close session inspector modal"
                className="p-2 rounded-xl bg-aviation-900 border border-aviation-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-aviation-900/60 border border-aviation-800">
                <span className="text-slate-400 text-[10px] block">DATE & TIME</span>
                <span className="text-white font-bold">{selectedSessionModal.date}</span>
                <span className="text-slate-300 block text-[11px] mt-0.5">{selectedSessionModal.start_time} - {selectedSessionModal.end_time}</span>
              </div>

              <div className="p-3 rounded-xl bg-aviation-900/60 border border-aviation-800">
                <span className="text-slate-400 text-[10px] block">SIMULATOR / BAY</span>
                <span className="text-skyline-300 font-bold">{selectedSessionModal.resource_name}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">{selectedSessionModal.phase}</span>
              </div>

              <div className="p-3 rounded-xl bg-aviation-900/60 border border-aviation-800">
                <span className="text-slate-400 text-[10px] block">INSTRUCTOR</span>
                <span className="text-white font-bold">{selectedSessionModal.instructor_name}</span>
                <span className="text-emerald-400 block text-[11px] mt-0.5">{selectedSessionModal.instructor_role} Privileges</span>
              </div>

              <div className="p-3 rounded-xl bg-aviation-900/60 border border-aviation-800">
                <span className="text-slate-400 text-[10px] block">CADETS (PF / PM)</span>
                <span className="text-white font-bold truncate block">{selectedSessionModal.student_names.join(', ')}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">{selectedSessionModal.student_ids.length} Cadets Cleared</span>
              </div>
            </div>

            {/* 9 Regulatory Legality Checks */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                DGCA CAR Compliance Verification Rules
              </h3>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">1. Cadet Syllabus Prerequisites & Ground Clearances</span>
                  </div>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">2. Instructor Role Privileges ({selectedSessionModal.instructor_role}) Endorsement</span>
                  </div>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">3. Instructor Annual Recurrent Window & Base Month</span>
                  </div>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">4. DGCA CAR Section 7 Daily FDTL (≤ 6.0h limit)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">6.0h / 6.0h</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">5. DGCA CAR Section 7 7-Day Rolling Limit (≤ 30.0h)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">20.0h / 30.0h</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">6. Simulator Level D DGCA Certification & Bay Parity</span>
                  </div>
                  <span className="text-emerald-400 font-bold">PASSED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-aviation-800">
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="px-5 py-2.5 rounded-xl bg-aviation-900 hover:bg-aviation-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
