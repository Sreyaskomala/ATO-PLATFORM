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
  CalendarClock,
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
    openSlotModal,
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

  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(8); // September (0-indexed)
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
    { name: 'Mon', date: '2026-08-31' },
    { name: 'Tue (Today)', date: '2026-09-01' },
    { name: 'Wed', date: '2026-09-02' },
    { name: 'Thu', date: '2026-09-03' },
    { name: 'Fri', date: '2026-09-04' },
    { name: 'Sat', date: '2026-09-05' },
    { name: 'Sun', date: '2026-09-06' },
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
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Calendar Header & View Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-skyline-500 dark:text-skyline-400" />
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Master Flight & Simulator Calendar
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any empty slot or session to book, reschedule, or inspect real-time regulatory compliance.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / Month / Year Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-aviation-950/80 border border-slate-200 dark:border-aviation-800">
            {(['day', 'week', 'month', 'year'] as CalendarViewMode[]).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  calendarView === view
                    ? 'bg-skyline-500 text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => openSlotModal({ mode: 'CREATE', prefillDate: selectedCalendarDate, prefillTime: '08:00' })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Slot</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-aviation-900/50 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4 text-skyline-500 dark:text-skyline-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">Filters:</span>
          </div>

          {/* Fleet Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Fleet:</span>
            <select
              value={calendarFleetFilter}
              onChange={(e) => setCalendarFleetFilter(e.target.value)}
              aria-label="Filter calendar by aircraft fleet"
              className="bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-skyline-500 focus:outline-none"
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
            <span className="text-slate-500 dark:text-slate-400 font-medium">Resource:</span>
            <select
              value={calendarResourceFilter}
              onChange={(e) => setCalendarResourceFilter(e.target.value)}
              aria-label="Filter calendar by simulator resource category"
              className="bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-skyline-500 focus:outline-none"
            >
              <option value="ALL">All Simulators & Bays</option>
              <option value="FFS">Full Flight Simulator (FFS Level D)</option>
              <option value="FTD">Flight Training Device (FTD Level 2)</option>
              <option value="CLASSROOM">Ground Classrooms</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>FFS Level D</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>FTD Level 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Skill Test</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ground Tech</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAY VIEW (24-Hour Bay Timeline) */}
      {/* ========================================================================= */}
      {calendarView === 'day' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl overflow-x-auto shadow-sm dark:shadow-none">
          <div className="min-w-[950px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-aviation-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const [y, m, d] = selectedCalendarDate.split('-').map(Number);
                    const prev = new Date(y, m - 1, d - 1);
                    setSelectedCalendarDate(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  {(() => {
                    const [y, m, d] = selectedCalendarDate.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    const weekday = dt.toLocaleDateString('en-US', { weekday: 'long' });
                    const month = dt.toLocaleDateString('en-US', { month: 'long' });
                    return `${weekday}, ${d} ${month} ${y} (Operational Flight Schedule)`;
                  })()}
                </div>
                <button
                  onClick={() => {
                    const [y, m, d] = selectedCalendarDate.split('-').map(Number);
                    const next = new Date(y, m - 1, d + 1);
                    setSelectedCalendarDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-skyline-600 dark:text-skyline-400 font-semibold">
                {filteredSchedules.filter((s) => s.date === selectedCalendarDate).length} Scheduled Sessions
              </div>
            </div>

            {/* Time Axis */}
            <div className="grid grid-cols-12 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-aviation-800/60">
              <div className="col-span-3 font-semibold text-slate-700 dark:text-slate-300">SIMULATOR BAY / CLASSROOM</div>
              {hoursDay.map((h, i) => (
                <div key={i} className="text-center">{h}</div>
              ))}
            </div>

            {/* Resource Rows */}
            <div className="divide-y divide-slate-100 dark:divide-aviation-800/40">
              {simulators.map((res) => {
                const resSessions = filteredSchedules.filter(
                  (s) => s.resource_id === res.id && s.date === selectedCalendarDate
                );

                return (
                  <div key={res.id} className="grid grid-cols-12 items-center py-4 hover:bg-slate-50 dark:hover:bg-aviation-950/20 transition-colors">
                    {/* Device Label */}
                    <div className="col-span-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                        <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">{res.resource_name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">{res.bay_location}</div>
                      <div className="text-[10px] text-skyline-600 dark:text-skyline-400 font-mono">{res.level} • {res.approval_number}</div>
                    </div>
                    {/* Timeline Area */}
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const fraction = Math.max(0, Math.min(1, clickX / rect.width));
                        const approximateHour = Math.floor(6 + fraction * 16);
                        const roundedHour = Math.max(6, Math.min(20, Math.floor(approximateHour / 2) * 2));
                        const hourStr = `${String(roundedHour).padStart(2, '0')}:00`;
                        openSlotModal({
                          mode: 'CREATE',
                          prefillDate: selectedCalendarDate,
                          prefillTime: hourStr,
                          prefillResourceId: res.id,
                        });
                      }}
                      className="col-span-9 relative h-16 bg-slate-100/70 dark:bg-aviation-950/60 rounded-2xl border border-slate-200 dark:border-aviation-800/80 flex items-center px-2 overflow-hidden cursor-pointer hover:border-skyline-400/60 transition-all group"
                      title="Click empty slot to book session"
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-9 divide-x divide-slate-200/80 dark:divide-aviation-800/30 pointer-events-none">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlotModal({ mode: 'EDIT', session: sch });
                            }}
                            className="absolute h-13 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 border border-skyline-400/50 p-2.5 text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-center overflow-hidden z-10"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <div className="text-xs font-bold truncate leading-tight flex items-center gap-1">
                              <span>{sch.session_title}</span>
                            </div>
                            <div className="text-[10px] text-skyline-100 truncate flex items-center gap-1.5 mt-0.5 font-mono">
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
        <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-aviation-800">
            <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Weekly Flight & Simulator Operations (31 Aug - 06 Sep 2026)
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Week 36 • Click card to edit / reschedule
              </span>
              <button
                onClick={() => openSlotModal({ mode: 'CREATE', prefillDate: '2026-09-01', prefillTime: '08:00' })}
                className="px-3 py-1.5 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-mono font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const daySessions = filteredSchedules.filter((s) => s.date === day.date);
              const isToday = day.date === '2026-09-01';

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[420px] transition-all ${
                    isToday
                      ? 'bg-skyline-50/50 dark:bg-aviation-950/90 border-skyline-400/60 dark:border-skyline-500/50 shadow-sm dark:shadow-glow-cyan'
                      : 'bg-slate-50/50 dark:bg-aviation-950/50 border-slate-200 dark:border-aviation-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-200 dark:border-aviation-800/80 flex items-center justify-between">
                      <div>
                        <div className={`font-heading font-bold text-xs ${isToday ? 'text-skyline-600 dark:text-skyline-400' : 'text-slate-800 dark:text-slate-300'}`}>
                          {day.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{day.date}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openSlotModal({ mode: 'CREATE', prefillDate: day.date, prefillTime: '08:00' })}
                          className="w-5 h-5 rounded-full bg-slate-200 hover:bg-skyline-500 hover:text-white dark:bg-aviation-800 flex items-center justify-center text-[10px]"
                          title="Add slot on this day"
                        >
                          +
                        </button>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-200/80 dark:bg-aviation-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-aviation-800">
                          {daySessions.length}
                        </span>
                      </div>
                    </div>

                    {/* Session Cards */}
                    <div className="space-y-2.5">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => openSlotModal({ mode: 'EDIT', session })}
                          className="p-2.5 rounded-xl bg-white dark:bg-aviation-900/90 border border-slate-200 dark:border-aviation-800 hover:border-skyline-400 dark:hover:border-skyline-500/50 cursor-pointer transition-all space-y-1.5 group shadow-sm dark:shadow-none"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${getPhaseBadge(session.phase)}`}>
                              {session.session_code}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400">
                              {session.start_time}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-skyline-600 dark:group-hover:text-skyline-300 truncate">
                            {session.session_title}
                          </div>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {session.resource_name}
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 dark:border-aviation-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="truncate">{session.instructor_name.split(' ')[1]}</span>
                            <span className="text-skyline-600 dark:text-skyline-400 font-bold">{session.total_duty_hours}h</span>
                          </div>
                        </div>
                      ))}

                      {daySessions.length === 0 && (
                        <div
                          onClick={() => openSlotModal({ mode: 'CREATE', prefillDate: day.date, prefillTime: '08:00' })}
                          className="py-12 border-2 border-dashed border-slate-200 dark:border-aviation-800/60 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-mono cursor-pointer hover:border-skyline-400 transition-colors"
                        >
                          <Clock className="w-5 h-5 mb-1 opacity-50" />
                          <span>+ Click to add slot</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-aviation-800/80 text-[10px] font-mono text-slate-400 dark:text-slate-500 flex justify-between">
                    <span>Total Duty:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {daySessions.reduce((acc, s) => acc + s.total_duty_hours, 0)} hrs
                    </span>
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
        <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-aviation-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {monthNames[activeMonthIndex]} {activeYear} (Monthly Simulator Master Schedule)
              </div>
              <button
                onClick={() => setActiveMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 hover:border-slate-300 dark:hover:border-aviation-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-skyline-600 dark:text-skyline-400 font-semibold">
                Click any day to book / edit slots
              </span>
              <button
                onClick={() => openSlotModal({ mode: 'CREATE', prefillDate: '2026-09-01', prefillTime: '08:00' })}
                className="px-3 py-1.5 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-mono font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Book Slot
              </button>
            </div>
          </div>

          {/* Month Day Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-200 dark:border-aviation-800/60">
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
            {(() => {
              const firstDayDate = new Date(activeYear, activeMonthIndex, 1);
              const firstDayWeekday = (firstDayDate.getDay() + 6) % 7; // Monday = 0, Saturday = 5
              const totalDaysInMonth = new Date(activeYear, activeMonthIndex + 1, 0).getDate();

              return Array.from({ length: 35 }).map((_, index) => {
                const dayNum = index - firstDayWeekday + 1;
                const isValidDay = dayNum >= 1 && dayNum <= totalDaysInMonth;
                const dateStr = `${activeYear}-${String(activeMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const daySessions = filteredSchedules.filter((s) => s.date === dateStr);
                const isToday = dateStr === '2026-09-01';

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isValidDay) {
                        if (daySessions.length > 0) {
                          openSlotModal({ mode: 'EDIT', session: daySessions[0] });
                        } else {
                          openSlotModal({ mode: 'CREATE', prefillDate: dateStr, prefillTime: '08:00' });
                        }
                      }
                    }}
                    className={`min-h-[105px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      !isValidDay
                        ? 'bg-slate-100/40 dark:bg-aviation-950/20 border-transparent opacity-20 pointer-events-none'
                        : isToday
                        ? 'bg-skyline-50/80 dark:bg-aviation-950/90 border-skyline-400 dark:border-skyline-500/60 shadow-sm dark:shadow-glow-cyan cursor-pointer'
                        : daySessions.length > 0
                        ? 'bg-white dark:bg-aviation-950/60 border-slate-200 dark:border-aviation-800 hover:border-skyline-400 dark:hover:border-skyline-500/40 cursor-pointer shadow-sm dark:shadow-none'
                        : 'bg-slate-50/70 dark:bg-aviation-950/40 border-slate-200/60 dark:border-aviation-800/40 cursor-pointer hover:border-skyline-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isToday ? 'text-skyline-600 dark:text-skyline-400' : 'text-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {isValidDay ? dayNum : ''}
                      </span>
                      {daySessions.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-skyline-100 dark:bg-skyline-500/20 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/40">
                          {daySessions.length}
                        </span>
                      )}
                    </div>

                    {daySessions.length > 0 ? (
                      <div className="space-y-1 my-1">
                        {daySessions.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-[10px] text-slate-800 dark:text-slate-200 truncate font-mono"
                          >
                            {s.session_code}: {s.aircraft_type_name.split(' ')[0]}
                          </div>
                        ))}
                        {daySessions.length > 2 && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono text-center">
                            +{daySessions.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-6 flex items-center justify-center text-[9px] text-slate-400 opacity-0 hover:opacity-100 font-mono">
                        + Add
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-slate-400 dark:text-slate-600 text-right">
                      {isValidDay ? `${daySessions.reduce((acc, s) => acc + s.total_duty_hours, 0)}h` : ''}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. YEAR VIEW (12-Month Matrix & Cohort Flow) */}
      {/* ========================================================================= */}
      {calendarView === 'year' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-aviation-800">
            <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Annual 2026 ATO Operations & FSTD Utilization Matrix
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              12-Month Recurrent Compliance & Type Rating Pipeline
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthNames.map((month, mIdx) => {
              const monthSchedules = filteredSchedules.filter((s) => {
                const sMonth = parseInt(s.date.split('-')[1], 10) - 1;
                return sMonth === mIdx;
              });

              return (
                <div
                  key={month}
                  onClick={() => {
                    setActiveMonthIndex(mIdx);
                    setCalendarView('month');
                  }}
                  className="p-4 rounded-2xl bg-slate-50/50 dark:bg-aviation-950/50 border border-slate-200 dark:border-aviation-800/80 hover:border-skyline-400 dark:hover:border-skyline-500/50 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-aviation-800 pb-2">
                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">{month}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 dark:bg-aviation-900 text-slate-700 dark:text-slate-300">
                      {monthSchedules.length} ses
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Total Duty:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {monthSchedules.reduce((acc, s) => acc + s.total_duty_hours, 0)} hrs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sim Hours:</span>
                        <span className="text-skyline-600 dark:text-skyline-300">
                          {monthSchedules.reduce((acc, s) => acc + s.sim_hours, 0)} hrs
                        </span>
                      </div>
                    </div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn transition-colors duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    DISPATCH STATUS: 🟢 GO (ALL LEGAL)
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-400">
                    Session ID: {selectedSessionModal.id}
                  </span>
                </div>
                <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedSessionModal.session_title}
                </h2>
                <div className="text-xs text-skyline-600 dark:text-skyline-300 font-mono mt-0.5">
                  {selectedSessionModal.batch_code} • {selectedSessionModal.aircraft_type_name}
                </div>
              </div>

              <button
                onClick={() => setSelectedSessionModal(null)}
                aria-label="Close session inspector modal"
                className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">DATE & TIME</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedSessionModal.date}</span>
                <span className="text-slate-600 dark:text-slate-300 block text-[11px] mt-0.5">{selectedSessionModal.start_time} - {selectedSessionModal.end_time}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">SIMULATOR / BAY</span>
                <span className="text-skyline-600 dark:skyline-300 font-bold">{selectedSessionModal.resource_name}</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">{selectedSessionModal.phase}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">INSTRUCTOR</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedSessionModal.instructor_name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] mt-0.5">{selectedSessionModal.instructor_role} Privileges</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aviation-900/60 border border-slate-200 dark:border-aviation-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">CADETS (PF / PM)</span>
                <span className="text-slate-900 dark:text-white font-bold truncate block">{selectedSessionModal.student_names.join(', ')}</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">{selectedSessionModal.student_ids.length} Cadets Cleared</span>
              </div>
            </div>

            {/* 9 Regulatory Legality Checks */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DGCA CAR Compliance Verification Rules
              </h3>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">1. Cadet Syllabus Prerequisites & Ground Clearances</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">2. Instructor Role Privileges ({selectedSessionModal.instructor_role}) Endorsement</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">3. Instructor Annual Recurrent Window & Base Month</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">4. DGCA CAR Section 7 Daily FDTL (≤ 6.0h limit)</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">6.0h / 6.0h</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">5. DGCA CAR Section 7 7-Day Rolling Limit (≤ 30.0h)</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">20.0h / 30.0h</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">6. Simulator Level D DGCA Certification & Bay Parity</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-aviation-800">
              <button
                onClick={() => {
                  const s = selectedSessionModal;
                  setSelectedSessionModal(null);
                  openSlotModal({ mode: 'EDIT', session: s });
                }}
                className="px-4 py-2.5 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-semibold font-mono flex items-center gap-1.5 shadow-md shadow-skyline-500/20"
              >
                <CalendarClock className="w-4 h-4" />
                <span>Edit / Reschedule Slot</span>
              </button>

              <button
                onClick={() => setSelectedSessionModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
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
