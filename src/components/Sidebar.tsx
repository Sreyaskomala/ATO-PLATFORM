'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { ATOTab } from '@/types';
import {
  GraduationCap,
  CalendarClock,
  UserCheck,
  CalendarDays,
  LayoutDashboard,
  Layers,
  Database,
  PlaneTakeoff,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, organisation, courses, students, isMobileNavOpen, setMobileNavOpen } = useStore();

  const handleNavClick = (id: ATOTab) => {
    setActiveTab(id);
    setMobileNavOpen(false);
  };

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
      badge: 'Interactive',
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
      id: 'courses',
      label: 'Courses & Syllabi',
      icon: <BookOpen className="w-5 h-5" />,
      badge: `${courses.length} Active`,
    },
    {
      id: 'cadets',
      label: 'Cadet ETR & Progress',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: `${students.length} Cadets`,
    },
    {
      id: 'instructors',
      label: 'Instructor Qualifications',
      icon: <UserCheck className="w-5 h-5" />,
      badge: '5-Yr & Recurrent',
    },
    {
      id: 'pipeline',
      label: 'Cadet Pipeline & CBTA',
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  const fleetAndDbNav: { id: ATOTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'fleets',
      label: 'FSTD Fleet & Bays',
      icon: <Layers className="w-5 h-5" />,
      badge: 'Level D',
    },
    {
      id: 'manual',
      label: 'ATO Manual & Glossary',
      icon: <BookOpen className="w-5 h-5" />,
      badge: 'DGCA CAR',
    },
  ];

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-aviation-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-skyline-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan shrink-0">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-base tracking-wider text-slate-900 dark:text-white">
              ATO<span className="text-skyline-500 dark:text-skyline-400">PLATFORM</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Aviation Operations Platform</div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-aviation-900 transition-colors"
          aria-label="Close navigation menu"
        >
          ✕
        </button>
      </div>

      {/* Tenant / Approval Card */}
      <div className="p-3.5 mx-4 my-3 rounded-2xl bg-slate-50 dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-skyline-50 dark:bg-skyline-500/10 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center font-heading font-bold text-skyline-600 dark:text-skyline-400 text-sm shrink-0">
          GA
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{organisation.trading_name}</div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{organisation.ato_approval_number}</div>
        </div>
        <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
        {/* Section 1: Operations */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            OPERATIONS
          </div>
          <div className="space-y-1">
            {operationsNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-skyline-50 dark:bg-gradient-to-r dark:from-skyline-500/20 dark:to-indigo-500/10 text-skyline-600 dark:text-skyline-400 border border-skyline-200 dark:border-skyline-500/30 font-semibold shadow-sm dark:shadow-glow-cyan'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-500 dark:text-skyline-400' : 'text-slate-400 dark:text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-skyline-100 dark:bg-skyline-500/20 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/40">
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
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            PEOPLE & TRAINING
          </div>
          <div className="space-y-1">
            {peopleAndTrainingNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-skyline-50 dark:bg-gradient-to-r dark:from-skyline-500/20 dark:to-indigo-500/10 text-skyline-600 dark:text-skyline-400 border border-skyline-200 dark:border-skyline-500/30 font-semibold shadow-sm dark:shadow-glow-cyan'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-500 dark:text-skyline-400' : 'text-slate-400 dark:text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-skyline-100 dark:bg-skyline-500/20 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/40">
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
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            FLEET & MANUAL
          </div>
          <div className="space-y-1">
            {fleetAndDbNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-skyline-50 dark:bg-gradient-to-r dark:from-skyline-500/20 dark:to-indigo-500/10 text-skyline-600 dark:text-skyline-400 border border-skyline-200 dark:border-skyline-500/30 font-semibold shadow-sm dark:shadow-glow-cyan'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-aviation-900/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-skyline-500 dark:text-skyline-400' : 'text-slate-400 dark:text-slate-400'}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-200 dark:border-aviation-800/50 bg-slate-50/50 dark:bg-aviation-900/40 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 font-semibold">DGCA Live Dispatch</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v2.4.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-slate-200 dark:border-aviation-800/80 bg-white dark:bg-aviation-950 flex-col shrink-0 h-screen sticky top-0 transition-colors duration-150 shadow-sm dark:shadow-none z-30">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
          />

          {/* Drawer Body */}
          <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-aviation-950 border-r border-slate-200 dark:border-aviation-800 h-full shadow-2xl z-10 animate-slideRight">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
