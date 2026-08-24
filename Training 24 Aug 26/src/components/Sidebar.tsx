'use client';

import React from 'react';
import { useStore, ATOTab } from '@/store/useStore';
import {
  GraduationCap,
  CalendarClock,
  UserCheck,
  CalendarRange,
  CalendarDays,
  LayoutDashboard,
  Layers,
  Database,
  PlaneTakeoff,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, organisation } = useStore();

  const operationsNav: { id: ATOTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Operations Cockpit',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: 'Live',
    },
    {
      id: 'calendar',
      label: 'Master Calendar',
      icon: <CalendarDays className="w-5 h-5" />,
      badge: 'Day/Wk/Mo/Yr',
    },
    {
      id: 'scheduler',
      label: 'Flight & Sim Dispatcher',
      icon: <CalendarClock className="w-5 h-5" />,
      badge: 'DGCA CAR',
    },
  ];

  const peopleAndTrainingNav: { id: ATOTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'instructors',
      label: 'Instructor Qualifications',
      icon: <UserCheck className="w-5 h-5" />,
      badge: '5-Yr & Recurrent',
    },
    {
      id: 'pipeline',
      label: 'Cadet Pipeline & CBTA',
      icon: <GraduationCap className="w-5 h-5" />,
    },
  ];

  const fleetAndDbNav: { id: ATOTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'fleets',
      label: 'FSTD Fleet & Bays',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'schema',
      label: 'Database Schema & DDL',
      icon: <Database className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-72 border-r border-aviation-800/80 bg-aviation-950 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-aviation-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-skyline-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-base tracking-wider text-white">
              AEROMATRIX<span className="text-skyline-400">ATO</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">Aviation Operations Platform</div>
          </div>
        </div>
      </div>

      {/* Tenant / Approval Card */}
      <div className="p-4 mx-4 my-3 rounded-2xl bg-aviation-900/80 border border-aviation-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-skyline-500/10 border border-skyline-500/30 flex items-center justify-center font-heading font-bold text-skyline-400 text-sm">
          GA
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">{organisation.trading_name}</div>
          <div className="text-[10px] font-mono text-slate-400 truncate">{organisation.ato_approval_number}</div>
        </div>
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
        {/* Section 1: Operations */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            OPERATIONS
          </div>
          <div className="space-y-1">
            {operationsNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-skyline-500/20 to-indigo-500/10 text-skyline-400 border border-skyline-500/30 font-semibold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-400' : 'text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-skyline-500/20 text-skyline-300 border border-skyline-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Training & People */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            PEOPLE & TRAINING
          </div>
          <div className="space-y-1">
            {peopleAndTrainingNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-skyline-500/20 to-indigo-500/10 text-skyline-400 border border-skyline-500/30 font-semibold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-400' : 'text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-skyline-500/20 text-skyline-300 border border-skyline-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Fleet & Database */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            FLEET & DATABASE
          </div>
          <div className="space-y-1">
            {fleetAndDbNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-skyline-500/20 to-indigo-500/10 text-skyline-400 border border-skyline-500/30 font-semibold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-400' : 'text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Status */}
      <div className="p-4 m-4 border border-aviation-800/80 rounded-xl bg-aviation-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-200">DGCA FDTL Rules Active</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          1-Day 6h / 7-Day 30h Limits • 1-Yr TRS Recurrent Window Enforced
        </div>
      </div>
    </aside>
  );
};
