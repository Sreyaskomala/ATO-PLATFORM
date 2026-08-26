'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { CalendarClock, Cpu, Clock, User, Plus, GraduationCap } from 'lucide-react';

export const DailyFlightOpsRoster: React.FC = () => {
  const { simulators, schedules, setActiveTab } = useStore();

  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-skyline-500 dark:text-skyline-400" />
            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">Daily Flight Operations & Simulator Timetable</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time device slot utilization across Full Flight Simulators (A320, B737, ATR 72-600, Q400 Level D) and Ground Classrooms
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scheduler')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Roster Timetable */}
      <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl overflow-x-auto shadow-sm dark:shadow-none">
        <div className="min-w-[850px]">
          
          {/* Time Header Grid */}
          <div className="grid grid-cols-10 border-b border-slate-200 dark:border-aviation-800 pb-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div className="col-span-2 font-semibold text-slate-700 dark:text-slate-300">DEVICE / CLASSROOM</div>
            {hours.map((h, i) => (
              <div key={i} className="text-center">{h}</div>
            ))}
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-slate-100 dark:divide-aviation-800/50">
            {simulators.map((res) => {
              const resSchedules = schedules.filter((s) => s.resource_id === res.id);

              return (
                <div key={res.id} className="grid grid-cols-10 items-center py-4 group hover:bg-slate-50 dark:hover:bg-aviation-950/30 transition-colors">
                  
                  {/* Left: Device Meta */}
                  <div className="col-span-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{res.resource_name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {res.bay_location}
                    </div>
                    <div className="text-[10px] text-skyline-600 dark:text-skyline-400 font-mono">
                      {res.level}
                    </div>
                  </div>

                  {/* Right: Slot Timeline */}
                  <div className="col-span-8 relative h-16 bg-slate-100/70 dark:bg-aviation-950/60 rounded-xl border border-slate-200 dark:border-aviation-800/80 flex items-center px-2">
                    
                    {/* Time Grid Guideline Dividers */}
                    <div className="absolute inset-0 grid grid-cols-8 divide-x divide-slate-200/80 dark:divide-aviation-800/30 pointer-events-none">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="h-full"></div>
                      ))}
                    </div>

                    {/* Booked Sessions */}
                    {resSchedules.map((sch) => {
                      const startHour = parseInt(sch.start_time.split(':')[0]);
                      const leftPercent = Math.max(0, Math.min(100, ((startHour - 6) / 16) * 100));
                      const widthPercent = Math.max(12, (sch.total_duty_hours / 16) * 100);

                      return (
                        <div
                          key={sch.id}
                          className="absolute h-12 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 border border-skyline-400/50 p-2 text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-center overflow-hidden z-10"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                        >
                          <div className="text-xs font-bold truncate leading-tight flex items-center gap-1">
                            <span>{sch.session_title}</span>
                          </div>
                          <div className="text-[10px] text-skyline-100 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{sch.instructor_name}</span>
                            <span>•</span>
                            <span>{sch.student_names.join(', ')}</span>
                          </div>
                        </div>
                      );
                    })}

                    {resSchedules.length === 0 && (
                      <div className="w-full text-center text-xs text-slate-400 dark:text-slate-500 italic">
                        Available for flight / ground bookings
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
