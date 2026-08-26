'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import {
  ShieldCheck,
  Users,
  PlusCircle,
  GraduationCap,
  Printer,
  Sun,
  Moon,
  BookOpen,
  Award,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    organisation,
    simulators,
    instructors,
    batches,
    students,
    theme,
    toggleTheme,
    setActiveTab,
    setIsExportPrintModalOpen,
    isMobileNavOpen,
    toggleMobileNav,
  } = useStore();

  const activeSims = simulators.filter((s) => s.resource_category === 'FFS' && s.status === 'AVAILABLE').length;
  const clearedCadetsCount = students.filter((s) => s.go_no_go_status === 'GO_CLEARED').length;

  return (
    <header className="h-16 sm:h-20 border-b border-slate-200 dark:border-aviation-800/80 bg-white/95 dark:bg-aviation-900/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150 shadow-sm dark:shadow-none">
      
      {/* Left: Mobile Hamburger + Brand Header */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-aviation-800 transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Title & DGCA Approval Meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-extrabold text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white tracking-wide truncate">
              ATO <span className="text-skyline-500 dark:text-skyline-400">Platform</span>
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-skyline-50 dark:bg-skyline-500/10 border border-skyline-200 dark:border-skyline-500/30 text-skyline-700 dark:text-skyline-300 shrink-0">
              DGCA CAR-FSTD LEVEL D
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{organisation.legal_name}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{organisation.ato_approval_number}</span>
          </div>
        </div>
      </div>

      {/* Right: Operational HUD Counters + Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Operational HUD Metric Counters */}
        <div className="hidden xl:flex items-center gap-4 lg:gap-5 border-r border-slate-200 dark:border-aviation-800 pr-4 lg:pr-5">
          {/* Enrolled Cadets */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-skyline-50 dark:bg-aviation-800 flex items-center justify-center text-skyline-500 dark:text-skyline-400 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Enrolled</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-white font-mono">{students.length} Cadets</div>
            </div>
          </div>

          {/* Cleared (Go Gate) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-aviation-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Stage Cleared</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{clearedCadetsCount} Cleared</div>
            </div>
          </div>

          {/* Active Batches */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-aviation-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Batches</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-white font-mono">{batches.length} Cohorts</div>
            </div>
          </div>

          {/* Level D Simulators */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-aviation-800 flex items-center justify-center text-teal-500 dark:text-teal-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Level-D FFS</div>
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 font-mono">{activeSims} Ready</div>
            </div>
          </div>

          {/* Instructors */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-aviation-800 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Instructors</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-white font-mono">{instructors.length} Active</div>
            </div>
          </div>
        </div>

        {/* Medium Screen Compact Badges */}
        <div className="hidden md:flex xl:hidden items-center gap-2 border-r border-slate-200 dark:border-aviation-800 pr-3 font-mono text-[11px]">
          <span className="px-2 py-1 rounded-lg bg-skyline-50 dark:bg-skyline-500/10 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/30">
            {students.length} Cadets
          </span>
          <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            {clearedCadetsCount} Cleared
          </span>
          <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            {activeSims} FFS Ready
          </span>
        </div>

        {/* Manual & Guide Button */}
        <button
          onClick={() => setActiveTab('manual')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-skyline-50 dark:bg-aviation-950 dark:hover:bg-skyline-500/15 border border-slate-200 dark:border-aviation-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm group"
          title="Open ATO Operations Manual & Abbreviations Guide"
        >
          <BookOpen className="w-4 h-4 text-skyline-500 group-hover:scale-110 transition-transform shrink-0" />
          <span className="hidden sm:inline">Manual</span>
        </button>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-950 dark:hover:bg-aviation-800 border border-slate-200 dark:border-aviation-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm group"
          title={`Switch to ${theme === 'dark' ? 'White (Light)' : 'Dark'} Mode`}
          aria-label={`Toggle theme, current is ${theme}`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
              <span className="hidden md:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300 shrink-0" />
              <span className="hidden md:inline">Dark</span>
            </>
          )}
        </button>

        {/* Export / Print Button */}
        <button
          onClick={() => setIsExportPrintModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-950 dark:hover:bg-aviation-800 border border-slate-200 dark:border-aviation-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
          title="Export CSV / Print PDF reports"
        >
          <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="hidden lg:inline">Export</span>
        </button>

        {/* Primary Dispatch Action Button */}
        <button
          onClick={() => setActiveTab('scheduler')}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-skyline-500/20 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Dispatch Session</span>
          <span className="sm:hidden">Dispatch</span>
        </button>
      </div>
    </header>
  );
};
