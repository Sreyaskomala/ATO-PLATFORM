'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  BookOpen,
  Search,
  FileText,
  ShieldCheck,
  CalendarClock,
  UserCheck,
  GraduationCap,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plane,
  Award,
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  fullName: string;
  category: 'ROLES' | 'SIMULATOR' | 'REGULATORY' | 'TRAINING' | 'OPERATIONAL';
  definition: string;
  dgcaRule: string;
  usageContext: string;
}

const AVIATION_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'SFI',
    fullName: 'Synthetic Flight Instructor',
    category: 'ROLES',
    definition: 'An authorized flight instructor qualified and approved by DGCA to conduct instructional sessions exclusively in certified Flight Simulation Training Devices (FSTDs), specifically Level D Full Flight Simulators and Level 2 Flight Training Devices.',
    dgcaRule: 'DGCA CAR Section 7, Series I, Part II (Clause 4.2)',
    usageContext: 'Assigned for FFS and FTD flight maneuver profiles (FFS-01 to FFS-08). Holds a 5-year DGCA approval and requires an annual recurrent check within its base month.',
  },
  {
    term: 'SFE',
    fullName: 'Synthetic Flight Examiner',
    category: 'ROLES',
    definition: 'A designated senior check pilot authorized by the DGCA Director General to conduct official CA-40 Pilot Proficiency Checks (PPC), Instrument Rating renewal checks, and Type Rating Skill Tests on Level D simulators.',
    dgcaRule: 'DGCA CAR Section 7, Series I, Part II & Form CA-40',
    usageContext: 'Mandatory examiner for CA-40 Day/Night Skill Tests, Command Upgrade checks, and annual TRS recurrent validations.',
  },
  {
    term: 'TRI',
    fullName: 'Type Rating Instructor',
    category: 'ROLES',
    definition: 'A qualified instructor holding an active aircraft type rating who is certified to instruct both inside the actual aircraft flight deck (Base / Route Training) and in Full Flight Simulators.',
    dgcaRule: 'DGCA CAR Section 7, Series G / Series I',
    usageContext: 'Used for Zero Flight Time Training (ZFTT), Line Oriented Flight Training (LOFT), and Aircraft Base Training circuits.',
  },
  {
    term: 'TRE',
    fullName: 'Type Rating Examiner',
    category: 'ROLES',
    definition: 'A designated examiner authorized to conduct statutory license skill tests and route checks on both the aircraft and synthetic flight training devices.',
    dgcaRule: 'DGCA CAR Section 7, Series G',
    usageContext: 'Authorized for CA-40 skill tests, airline route checks, and line proficiency evaluations.',
  },
  {
    term: 'GI_TECH',
    fullName: 'Ground Instructor — Technical Systems',
    category: 'ROLES',
    definition: 'An approved specialist ground instructor qualified to teach aircraft technical systems, avionics, electrical architecture, powerplants (CFM56/LEAP/PW1100G), hydraulics, and non-normal system logic.',
    dgcaRule: 'DGCA CAR Section 7, Series I, Part II',
    usageContext: 'Conducts Phase 1A Technical Ground School modules (GND-TECH-01 to 08) and conducts written theory examinations.',
  },
  {
    term: 'GI_PERF',
    fullName: 'Ground Instructor — Performance & Flight Planning',
    category: 'ROLES',
    definition: 'A specialized ground instructor or Subject Matter Expert (SME) certified to teach aircraft performance, weight and balance, takeoff/landing performance charts, obstacle clearance, and flight dispatch planning.',
    dgcaRule: 'DGCA CAR Section 7, Series I, Part II',
    usageContext: 'Conducts Phase 1B Performance modules (GND-PERF-01 to 04) and computerized flight planning SOPs.',
  },
  {
    term: 'FSTD',
    fullName: 'Flight Simulation Training Device',
    category: 'SIMULATOR',
    definition: 'A collective term for full-mission and procedural synthetic flight devices certified by DGCA under CAR-FSTD (A) regulations, encompassing Full Flight Simulators (FFS) and Flight Training Devices (FTD).',
    dgcaRule: 'DGCA CAR-FSTD (A) & ICAO Doc 9625',
    usageContext: 'Must hold valid annual DGCA qualification certificate and QTG (Qualification Test Guide) validation.',
  },
  {
    term: 'FFS (Level D)',
    fullName: 'Full Flight Simulator — Level D (Full Motion)',
    category: 'SIMULATOR',
    definition: 'The highest tier of flight simulator featuring 6-degree-of-freedom electric/hydraulic motion, daylight/night collimated visual displays (180°x40° field of view), high-fidelity aerodynamic modeling, and full cockpit sound simulation.',
    dgcaRule: 'DGCA CAR-FSTD Level D & ICAO Doc 9625 Level VII',
    usageContext: 'Approved for Zero Flight Time Training (ZFTT) and official CA-40 Day & Night license skill test endorsement.',
  },
  {
    term: 'FTD (Level 2)',
    fullName: 'Flight Training Device — Level 2 (Fixed Base)',
    category: 'SIMULATOR',
    definition: 'A fixed-base replica of the aircraft flight deck used for procedural flows, MCDU/FMC programming, autoflight guidance training, and cockpit SOP standardization prior to full-motion simulator sessions.',
    dgcaRule: 'DGCA CAR-FSTD (A) Level 2',
    usageContext: 'Utilized for Phase 2A Cockpit Flow & MCDU familiarization (FTD-01 to FTD-04).',
  },
  {
    term: 'MCC',
    fullName: 'Multi-Crew Cooperation',
    category: 'TRAINING',
    definition: 'Training designed to teach commercial pilot license (CPL) holders the non-technical and technical skills required to operate safely in a multi-pilot airline flight deck environment (Pilot Flying vs Pilot Monitoring duties).',
    dgcaRule: 'DGCA CAR Section 7, Series I & ICAO Annex 1',
    usageContext: 'Mandatory 20.0-hour module for ab-initio freshers entering initial type ratings. Waived for existing commercial type rating holders.',
  },
  {
    term: 'JIT',
    fullName: 'Jet Induction Training',
    category: 'TRAINING',
    definition: 'Transition course bridging piston/turboprop flying to modern swept-wing commercial jet transports, covering high-altitude aerodynamics, jet upset dynamics, mach number effects, and energy management.',
    dgcaRule: 'DGCA CAR Section 7, Series I',
    usageContext: 'Delivered alongside MCC (MCC/JIT) during initial type rating induction.',
  },
  {
    term: 'FDTL',
    fullName: 'Flight and Duty Time Limitations',
    category: 'REGULATORY',
    definition: 'Statutory limits established by the DGCA to prevent flight crew and simulator instructor fatigue. For ATO simulator instructional staff: max 6.0 hours total duty within any consecutive 24 hours, and max 30.0 hours within 7 consecutive days.',
    dgcaRule: 'DGCA CAR Section 7, Series J & ATO Operations Manual',
    usageContext: 'Strictly enforced in real-time by the compliance engine during slot booking and dispatch.',
  },
  {
    term: 'CA-40',
    fullName: 'DGCA Form CA-40 (Pilot Proficiency & Skill Test)',
    category: 'REGULATORY',
    definition: 'The official statutory check report issued by a DGCA-designated Synthetic Flight Examiner (SFE) certifying that a candidate has successfully demonstrated proficiency across normal, abnormal, and emergency flight maneuvers.',
    dgcaRule: 'DGCA Flight Crew Licensing Rules (Rule 41B & Form CA-40)',
    usageContext: 'Submitted to DGCA for endorsement of the aircraft type rating onto the candidate\'s Commercial Pilot License (CPL/ATPL).',
  },
  {
    term: 'CBTA',
    fullName: 'Competency-Based Training and Assessment',
    category: 'TRAINING',
    definition: 'A structured instructional framework defined by ICAO that trains and assesses pilots against core behavioral competencies (Communication, Leadership, Problem Solving, Flight Path Management, Situational Awareness, Systems Knowledge).',
    dgcaRule: 'ICAO Doc 9868 (PANS-TRG) & DGCA CAR Section 7',
    usageContext: 'Enforced at every syllabus stage gate with Go / No-Go decision checkpoints.',
  },
  {
    term: 'ETR',
    fullName: 'Electronic Training Records',
    category: 'OPERATIONAL',
    definition: 'A digital, tamper-proof repository tracking each candidate\'s complete training history, ground school hours, simulator sorties, attendance logs, stage exam scores, remedial assignments, and Go/No-Go clearances.',
    dgcaRule: 'DGCA CAR Section 7 Series I (Digital Records Compliance)',
    usageContext: 'Available under the Cadet ETR & Progress tab for audit readiness and student dossiers.',
  },
  {
    term: 'UPRT',
    fullName: 'Upset Prevention and Recovery Training',
    category: 'TRAINING',
    definition: 'Specialized training designed to provide flight crew with the competencies to prevent, recognize, and recover from developing or developed aircraft upsets, spiral dives, and aerodynamic stalls.',
    dgcaRule: 'DGCA CAR Section 8, Series S, Part I & ICAO Doc 10011',
    usageContext: 'Integrated into Level D full-motion FFS sessions and offered as a standalone advanced special course.',
  },
  {
    term: 'Base Month',
    fullName: 'DGCA Approval Base Month',
    category: 'REGULATORY',
    definition: 'The calendar month in which an instructor\'s DGCA approval was initially issued. Annual recurrent checks are anchored to this base month with a 3-month grace window (2 months prior to end of base month).',
    dgcaRule: 'DGCA CAR Section 7, Series I, Part II (Clause 5.1)',
    usageContext: 'Auto-derived when onboarding an instructor from the approval date; governs the annual recurrent schedule.',
  },
  {
    term: 'TRS',
    fullName: 'Type Rating Syllabus',
    category: 'TRAINING',
    definition: 'The approved structured curriculum outlining all instructional stages, session codes, briefing durations, and flight simulator hours required for aircraft type rating qualification.',
    dgcaRule: 'DGCA CAR Section 7 Series I',
    usageContext: 'Defines course progression paths (e.g. TR-A320-INITIAL, TR-A320-TRANSITION, TR-B737-INITIAL).',
  },
  {
    term: 'CCQ',
    fullName: 'Cross Crew Qualification',
    category: 'TRAINING',
    definition: 'An accelerated transition type rating syllabus for flight crew holding a type rating on a related fly-by-wire aircraft family, focusing specifically on differences training.',
    dgcaRule: 'DGCA CAR Section 7 & EASA OEB CCQ',
    usageContext: 'Applied for transition courses where MCC/JIT is waived.',
  },
  {
    term: 'LOFT',
    fullName: 'Line-Oriented Flight Training',
    category: 'TRAINING',
    definition: 'Full-mission simulation of a real-time commercial airline flight from pre-flight dispatch to shutdown, designed to develop crew resource management (CRM) and tactical decision-making.',
    dgcaRule: 'DGCA CAR Section 7 & FAA AC 120-35',
    usageContext: 'Conducted in Phase 2B (FFS-07 & FFS-08) and Captain Command Upgrade training.',
  },
  {
    term: 'PPC',
    fullName: 'Pilot Proficiency Check',
    category: 'REGULATORY',
    definition: 'A mandatory periodic flight check required every 6 or 12 months to maintain aircraft type rating currency and instrument rating validity.',
    dgcaRule: 'DGCA CAR Section 7 & Schedule II',
    usageContext: 'Conducted by designated SFEs in Level D simulators.',
  },
  {
    term: 'PF / PM',
    fullName: 'Pilot Flying / Pilot Monitoring',
    category: 'OPERATIONAL',
    definition: 'The two standardized crew roles on commercial flight decks: Pilot Flying (PF) controls the aircraft trajectory, while Pilot Monitoring (PM) monitors flight instruments, radios, checklists, and system alerts.',
    dgcaRule: 'DGCA CAR Section 8 & Airline Flight Crew Operations Manual (FCOM)',
    usageContext: 'Every simulator slot pairs 2 cadets as PF and PM to train multi-crew coordination.',
  },
  {
    term: 'MEL / CDL',
    fullName: 'Minimum Equipment List / Configuration Deviation List',
    category: 'OPERATIONAL',
    definition: 'Regulatory documents defining which aircraft components or secondary airframe parts may be inoperative or missing at flight dispatch while maintaining safety compliance.',
    dgcaRule: 'DGCA CAR Section 2, Series B',
    usageContext: 'Taught in Ground School and simulated in FTD/FFS scenario dispatches.',
  },
];

export const OperationsManualView: React.FC = () => {
  const { setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeWorkflow, setActiveWorkflow] = useState<string>('scheduling');

  const filteredGlossary = AVIATION_GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dgcaRule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fadeIn transition-colors duration-150 pb-16">
      
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              AeroMatrix ATO Platform Manual & Regulatory Guide
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-3xl">
            Comprehensive Standard Operating Procedures (SOPs), DGCA CAR Section 7 Regulatory Framework, Aviation Abbreviations Dictionary, and Platform Workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-aviation-950 hover:bg-slate-200 dark:hover:bg-aviation-800 border border-slate-200 dark:border-aviation-800 text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono transition-all"
          >
            <span>Go to Operations Cockpit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive SOP Workflow Navigation Tabs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 space-y-6 shadow-sm dark:shadow-none">
        <div className="border-b border-slate-200 dark:border-aviation-800 pb-4">
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-skyline-500" />
            Platform Standard Operating Procedures (How-To Workflows)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a core operational workflow below for detailed instructions and compliance guidelines:
          </p>
        </div>

        {/* Workflow Tab Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'scheduling', label: '1. Slot Dispatch & FDTL', icon: <CalendarClock className="w-4 h-4" /> },
            { id: 'onboarding', label: '2. Instructor Onboard', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'courses', label: '3. Courses & MCC/JIT', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'cadets', label: '4. Cadet ETR & Blockers', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'cbta', label: '5. CBTA Stage Exams', icon: <Award className="w-4 h-4" /> },
            { id: 'recurrent', label: '6. Recurrent Checks', icon: <ShieldCheck className="w-4 h-4" /> },
          ].map((wf) => (
            <button
              key={wf.id}
              onClick={() => setActiveWorkflow(wf.id)}
              className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                activeWorkflow === wf.id
                  ? 'bg-skyline-50 dark:bg-skyline-500/15 border-skyline-400 dark:border-skyline-500/40 text-skyline-700 dark:text-skyline-300 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-aviation-950 border-slate-200 dark:border-aviation-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aviation-900'
              }`}
            >
              {wf.icon}
              <span className="leading-tight">{wf.label}</span>
            </button>
          ))}
        </div>

        {/* Workflow Detail Card */}
        <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-aviation-950/60 border border-slate-200 dark:border-aviation-800/80 space-y-4">
          
          {activeWorkflow === 'scheduling' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-skyline-500 text-white font-mono font-bold text-xs">SOP-01</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  How to Schedule & Dispatch Simulator / Ground Sessions with DGCA Compliance Verification
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The platform includes a real-time compliance engine verifying 7 strict DGCA CAR Section 7 & Section J rules before booking confirmation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-skyline-600 dark:text-skyline-400 font-mono">Step 1: Selection</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Open <strong>Master Calendar</strong> or <strong>Flight Dispatcher</strong>. Click <code>+ Add New Slot</code> or click on any timeline bay. Select Batch, Syllabus Session Code (e.g. FFS-04), and Date/Time.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-skyline-600 dark:text-skyline-400 font-mono">Step 2: Auto-Validation</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    The platform automatically checks instructor 5-year approval validity, FDTL daily duty (max 6.0h in 24h), 7-day cumulative duty (max 30.0h), simulator Level D qualification match, and cadet prerequisite clearance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-skyline-600 dark:text-skyline-400 font-mono">Step 3: Dispatch Release</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    If legal, click <code>Save Changes & Book Slot</code>. On the Operations Dashboard, click <code>Clearance Check</code> to inspect the 7-point checklist and print the official DGCA Dispatch Release sheet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflow === 'onboarding' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500 text-white font-mono font-bold text-xs">SOP-02</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Instructor Onboarding: Auto-Derived Base Months & Multi-Fleet Endorsements
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                DGCA mandates that instructor recurrent check cycles are strictly governed by their approval <strong>Base Month</strong>. The platform automatically derives base months and multi-type endorsements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 1: Date Entry</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    In <strong>Instructor Qualifications</strong>, click <code>+ Onboard New Instructor</code>. Enter the DGCA Approval Issue Date (e.g. <code>2025-04-15</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 2: Auto Derivation</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    The platform auto-locks Base Month to <strong>April</strong>, calculates 5-Year Expiry to <code>2030-04-14</code>, and sets the 3-month grace window (<code>01 Feb</code> to <code>30 Apr</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 3: Multi-Type Matrix</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Add distinct fleet endorsements (e.g. SFE on A320, SFI on B737, GI_TECH on ALL_FLEETS) with individual approval numbers and expiry dates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflow === 'courses' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-mono font-bold text-xs">SOP-03</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Courses & Syllabi Management: With vs Without MCC/JIT & Special Courses
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Different candidate streams require distinct regulatory tracks. Fresh CPL holders must undergo full MCC/JIT, while type-rated transitioning captains can fast-track directly into simulator handling.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Initial Type Rating (Fresher)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Includes 72h Ground Theory + 20h MCC/JIT Jet Induction + 16h FTD + 36h Level D FFS + CA-40 Skill Test. Badge: <code>MCC / JIT INCLUDED</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Transition Fast-Track</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    For pilots with prior multi-pilot type ratings (e.g. B737 $\rightarrow$ A320). MCC/JIT is waived. 40h Accelerated Ground + 12h FTD + 28h FFS. Badge: <code>WITHOUT MCC/JIT (Waived)</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Specialized Syllabi</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Advanced UPRT (Upset Prevention & Recovery) and Captain Command Upgrade courses. Click <code>+ Create New Course / Syllabus</code> to define custom stage gates and pass marks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflow === 'cadets' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-mono font-bold text-xs">SOP-04</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Cadet ETR Database & Missed Session Gatekeeper Blocker Resolution
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                DGCA mandates that no candidate may proceed to simulator or flight check stages if they have missed mandatory ground school modules or procedural drills.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">Automatic Blocker</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Marking an absence in a session immediately sets the cadet to <code>NO_GO_BLOCKED</code>. Attempting to schedule this cadet on a simulator raises a <strong>Prerequisite Violation</strong> alert.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">Cadet Dossier Inspection</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Under <strong>Cadet ETR & Progress</strong>, click on the blocked candidate (e.g. Tanya Sen) to view their attendance log, missing module, and red alert blocker box.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">1-Click Makeup Clearance</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Once the instructor conducts the makeup module, click <code>Clear Makeup Class & Unlock Cadet</code>. The candidate is cleared to <code>GO_CLEARED</code> instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflow === 'cbta' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-bold text-xs">SOP-05</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  CBTA Stage Gate Evaluations, Grading & Remedial Training Protocol
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                At each stage boundary (Ground Written Exam, MCC/JIT Check, FTD Progress Assessment, CA-40 Skill Test), candidate performance is graded to produce an authoritative Go / No-Go decision.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Pass Cutoff (&ge; 80%)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Scores at or above 80% automatically trigger <code>PASSED</code>, clearing the candidate for promotion to the subsequent flight/simulator phase (<code>GO DECISION: CLEARED</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Remedial Trigger (70% - 79%)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Scores between 70% and 79% mandate extra remedial hours (e.g. 2.0h simulator practice on engine-out go-arounds). Status sets to <code>REMEDIAL_ACTIVE</code> until re-tested.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Fail / Lockout (&lt; 70%)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Scores below 70% produce <code>FAILED (NO_GO_BLOCKED)</code>. Candidate must repeat the phase and cannot be scheduled for CA-40 check rides.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeWorkflow === 'recurrent' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500 text-white font-mono font-bold text-xs">SOP-06</span>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Instructor Annual Recurrent Checks & 3-Month Grace Window Monitoring
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                DGCA CAR mandates that instructors must undergo an annual standardization check conducted by an approved SFE/TRE within their 3-month grace window.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">Grace Window Alerts</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    When the date enters the 2 months preceding the Base Month anniversary, the instructor status switches to <code>EXPIRING</code> (Amber Banner).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">Automatic Lockout</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    If the check is missed past the last day of the base month, status switches to <code>REFRESHER_REQUIRED</code> and the instructor is automatically blocked from scheduling.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">1-Click Renewal</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Click <code>Renew Recurrent Check</code> on the instructor card, enter the examiner name and check date. The expiry automatically rolls forward 1 year while preserving the original Base Month.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Comprehensive Aviation & DGCA Abbreviations Glossary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 space-y-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-aviation-800 pb-5">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-skyline-500" />
              Aviation & DGCA Regulatory Abbreviations Glossary ({AVIATION_GLOSSARY.length} Terms)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authoritative dictionary of airline flight training terminology, instructor ratings, simulator levels, and DGCA mandates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search term, abbreviation, definition..."
                className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-skyline-500 w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-skyline-500 font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="ROLES">Instructor Roles (SFI, SFE, GI)</option>
              <option value="SIMULATOR">Simulator Hardware (FSTD, FFS, FTD)</option>
              <option value="REGULATORY">Regulations & FDTL (CAR, CA-40)</option>
              <option value="TRAINING">Curriculum & Syllabi (MCC, JIT, CBTA, UPRT)</option>
              <option value="OPERATIONAL">Flight Deck Operations (PF/PM, MEL, LOFT)</option>
            </select>
          </div>
        </div>

        {/* Glossary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-aviation-950/60 border border-slate-200 dark:border-aviation-800 hover:border-skyline-300 dark:hover:border-skyline-500/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-heading font-extrabold text-lg text-skyline-600 dark:text-skyline-400 tracking-wide">
                      {item.term}
                    </span>
                    <h3 className="font-sans font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {item.fullName}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-200/70 dark:bg-aviation-800 text-slate-700 dark:text-slate-300 uppercase shrink-0">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {item.definition}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-aviation-800/80 space-y-1 text-[11px] font-mono">
                <div className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Mandate:</strong> {item.dgcaRule}
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-tight">
                  <strong className="text-slate-700 dark:text-slate-300">Platform SOP:</strong> {item.usageContext}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGlossary.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            No glossary terms found matching "{searchQuery}". Try searching for SFI, SFE, FDTL, or MCC.
          </div>
        )}
      </div>

      {/* 4. Regulatory Reference & Statutory Authority Index */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 space-y-5 shadow-sm dark:shadow-none">
        <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Statutory Regulatory Authorities & Applicable Civil Aviation Requirements (CAR)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">DGCA CAR Section 7, Series I, Part II</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Approval and Administration of Airline Training Organizations (ATOs), Type Rating Courses, and Flight Simulation Training Devices.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">DGCA CAR Section 7, Series J</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Flight and Duty Time Limitations (FDTL) and Rest Requirements for Flight Crew and Synthetic Flight Instructors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">ICAO Doc 9868 (PANS-TRG)</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Procedures for Air Navigation Services — Competency-Based Training and Assessment (CBTA) Framework for Pilots.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">DGCA CAR Section 8, Series S</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Mandatory Advanced Jet Upset Prevention and Recovery Training (UPRT) in Level D Full Flight Simulators.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
