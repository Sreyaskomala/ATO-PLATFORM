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
  Sparkles,
  ChevronRight,
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
    definition: 'A person individually approved or accepted for the stated aircraft type and scope to conduct instruction in an FSTD. The privileges are limited to the scope, device category and conditions shown in the approval and the ATO\'s approved manuals.',
    dgcaRule: 'Individual DGCA approval; CAR Section 7, Series D, Part IV; approved ATO manuals and applicable DGCA instructions',
    usageContext: 'Before assignment, verify the approval number, aircraft type, FSTD scope, validity and any standardization or recency condition from the source documents. Do not infer a five-year validity or a device level.',
  },
  {
    term: 'SFE',
    fullName: 'Synthetic Flight Examiner',
    category: 'ROLES',
    definition: 'A DGCA-appointed or approved examiner authorized to conduct only the tests or checks, on the aircraft type and FSTD, included in the examiner\'s current authorization.',
    dgcaRule: 'CAR Section 7, Series I, Part I; CAP 7200; Operations Circular 09 of 2013; individual authorization',
    usageContext: 'Match the examiner\'s authorization and recency to the exact test or check. Use the current DGCA report form applicable to that licensing or operator check.',
  },
  {
    term: 'TRI',
    fullName: 'Type Rating Instructor',
    category: 'ROLES',
    definition: 'An instructor approved for a specified aircraft type and defined instructional privileges. Aircraft, FSTD, base-training and line-training privileges must not be assumed to be interchangeable.',
    dgcaRule: 'Individual DGCA approval; CAR Section 7, Series D, Part IV; approved ATO or operator training manual',
    usageContext: 'Assign only within the recorded type, role, device or aircraft privilege, validity, recency and standardization status.',
  },
  {
    term: 'DE',
    fullName: 'Designated Examiner',
    category: 'ROLES',
    definition: 'An examiner designated by DGCA with privileges limited to the licence, rating, aircraft type, test or check and operating environment stated in the current appointment.',
    dgcaRule: 'CAR Section 7, Series I, Part I; CAP 7200; Operations Circular 09 of 2013',
    usageContext: 'Use the DGCA title and scope recorded in the appointment. Do not substitute the non-DGCA label “TRE” unless it appears in the controlling approval.',
  },
  {
    term: 'GI_TECH',
    fullName: 'Ground Instructor — Technical Systems',
    category: 'ROLES',
    definition: 'A ground instructor or subject matter expert approved for specified technical subjects and, where applicable, aircraft types under the organization\'s approved training system.',
    dgcaRule: 'CAR Section 7, Series I, Part VII; CAR Section 7, Series D, Part IV; approved ATO manual',
    usageContext: 'Record the approved subjects, fleet scope and assessment privileges separately; teaching approval does not automatically confer examination authority.',
  },
  {
    term: 'GI_PERF',
    fullName: 'Ground Instructor — Performance & Flight Planning',
    category: 'ROLES',
    definition: 'A ground instructor or subject matter expert approved for the stated performance, mass and balance, flight-planning or related subjects.',
    dgcaRule: 'CAR Section 7, Series I, Part VII; CAR Section 7, Series D, Part IV; approved ATO manual',
    usageContext: 'Schedule only subjects and assessments included in the person\'s documented scope and the current approved syllabus.',
  },
  {
    term: 'FSTD',
    fullName: 'Flight Simulation Training Device',
    category: 'SIMULATOR',
    definition: 'The collective term used for qualified synthetic training devices, including Full Flight Simulators (FFS) and Flight Training Devices (FTD). Training or checking credit is limited to the current DGCA qualification and approved use.',
    dgcaRule: 'CAR Section 7, Series D, Part VI; Operations Circular 15 of 2014 (Issue 2), as amended; ICAO Doc 9625',
    usageContext: 'Verify the current qualification, Statement of Qualification (SOQ), configuration, Master Qualification Test Guide (MQTG) status and approved training or checking credits before dispatch.',
  },
  {
    term: 'FFS (Level D)',
    fullName: 'Full Flight Simulator — Level D',
    category: 'SIMULATOR',
    definition: 'The highest FFS qualification level in the applicable aeroplane FSTD framework. Its technical configuration and permitted training or checking credits are those demonstrated in the qualified device\'s MQTG and recorded in its SOQ.',
    dgcaRule: 'CAR Section 7, Series D, Part VI; Operations Circular 15 of 2014 (Issue 2), as amended; ICAO Doc 9625',
    usageContext: 'Do not treat Level D alone as approval for ZFTT, a skill test or any particular manoeuvre. Confirm the SOQ, approved course and any operational authorization.',
  },
  {
    term: 'FTD',
    fullName: 'Flight Training Device (FTD)',
    category: 'SIMULATOR',
    definition: 'An FSTD qualified at the FTD level stated in its DGCA qualification record. It may support systems, procedural and other approved training without necessarily providing the full motion and visual capability of an FFS.',
    dgcaRule: 'CAR Section 7, Series D, Part VI; Operations Circular 15 of 2014 (Issue 2), as amended',
    usageContext: 'Use only within the level, aircraft configuration, qualification status and training credits recorded in the SOQ and approved syllabus; do not infer capability from the label alone.',
  },
  {
    term: 'MCC',
    fullName: 'Multi-Crew Cooperation',
    category: 'TRAINING',
    definition: 'Training in the coordinated operation of a multi-pilot flight crew, including communication, leadership and teamwork, workload management, problem solving and flight-path management.',
    dgcaRule: 'CAR Section 7, Series B, Part XIX; approved type-rating syllabus; ICAO Annex 1 and PANS-TRG, as applicable',
    usageContext: 'Load the exact MCC requirement, duration, device and credit or waiver from the current DGCA-approved syllabus. Do not apply a universal 20-hour rule or automatic waiver.',
  },
  {
    term: 'JIT',
    fullName: 'Jet Induction Training',
    category: 'TRAINING',
    definition: 'A course used by some approved training systems to prepare pilots for jet-aircraft handling, high-altitude aerodynamics, energy management and related operational concepts.',
    dgcaRule: 'Current DGCA-approved course or ATO syllabus; CAR Section 7, Series D, Part IV',
    usageContext: 'Treat JIT as a syllabus item only where it appears in the applicable approval; do not assume that it is always combined with MCC.',
  },
  {
    term: 'FDTL',
    fullName: 'Flight and Duty Time Limitations',
    category: 'REGULATORY',
    definition: 'The flight-time, duty-period, rest and fatigue-management requirements applicable to flight crew under the relevant operation category. They are not a single blanket set of limits for all ATO ground or simulator staff.',
    dgcaRule: 'CAR Section 7, Series J, applicable Part; approved operator scheme or manual; ATO staff limits from the approved ATO manual and employment rules',
    usageContext: 'Configure limits by role and operation from the controlling approved document. The removed 6-hours-in-24 and 30-hours-in-7 values were not established as universal DGCA limits.',
  },
  {
    term: 'CA-40 & related forms',
    fullName: 'DGCA Flight-Test and Check Report Forms',
    category: 'REGULATORY',
    definition: 'DGCA report forms used, as applicable, to record specified licensing skill tests or instrument-rating tests. The examiner completes the current form; the form does not itself create or extend examiner privileges.',
    dgcaRule: 'Current DGCA flight-crew licensing forms; Aircraft Rules, 1937, Schedule II; applicable CAR and eGCA procedure',
    usageContext: 'Select the current form for the exact licence, rating, aircraft and test. Do not call every proficiency check or simulator assessment a “CA-40 check”.',
  },
  {
    term: 'CBTA',
    fullName: 'Competency-Based Training and Assessment',
    category: 'TRAINING',
    definition: 'Training and assessment based on defined competencies, observable behaviours, performance criteria and evidence collected in representative conditions.',
    dgcaRule: 'CAR Section 7, Series B, Part XX; ICAO Doc 9868 (PANS-TRG); approved training and assessment system',
    usageContext: 'Use the competency model, grading scale, performance standards, instructor calibration and remedial process in the approved manual; CBTA does not prescribe a universal percentage pass mark.',
  },
  {
    term: 'ETR',
    fullName: 'Electronic Training Records',
    category: 'OPERATIONAL',
    definition: 'Electronic records used to evidence a trainee\'s enrolment, attendance, training, assessments, remedial action, instructor authorization and completion status. Integrity depends on access control, audit history, retention and approved procedures.',
    dgcaRule: 'CAR Section 7, Series D, Part IV; CAP 7100; approved ATO training and records procedures',
    usageContext: 'Preserve source evidence, approvals, corrections, timestamps and audit history for the retention period in the controlling requirement or approved manual.',
  },
  {
    term: 'UPRT',
    fullName: 'Upset Prevention and Recovery Training',
    category: 'TRAINING',
    definition: 'Training that develops the competencies to prevent, recognize and recover from aeroplane upsets. Academic, on-aeroplane and FSTD elements depend on the applicable training path and approval.',
    dgcaRule: 'DGCA Operations Circular 06 of 2018; ICAO Doc 10011; approved operator or ATO syllabus',
    usageContext: 'Use an FSTD only for exercises and training credits supported by its qualified envelope and the approved UPRT programme; avoid negative training outside the validated model.',
  },
  {
    term: 'Validity Window',
    fullName: 'Approval, Recency or Check Validity Window',
    category: 'REGULATORY',
    definition: 'The period during which an approval, appointment, qualification, check or recency item remains effective under its own controlling requirement. Different records can have different calculation rules.',
    dgcaRule: 'Applicable CAR, Operations Circular, approval or appointment letter, SOQ and approved manual',
    usageContext: 'Store the actual issue date, expiry date, due rule and permitted window from the source record. Do not derive a universal base month, five-year term or three-month grace period.',
  },
  {
    term: 'TRS',
    fullName: 'Type Rating Syllabus',
    category: 'TRAINING',
    definition: 'The controlled, DGCA-approved curriculum for a specific type-rating course, including entry requirements, theoretical and practical training, devices, assessments, completion standards and any approved credits.',
    dgcaRule: 'CAR Section 7, Series B, Part XIX; CAR Section 7, Series D, Part IV; current DGCA-approved syllabus revision',
    usageContext: 'Version every course against the approval reference and effective revision. Hours and stage gates must come from that version, not a generic platform template.',
  },
  {
    term: 'DIFF / TRANS',
    fullName: 'Differences or Transition Training',
    category: 'TRAINING',
    definition: 'Training addressing differences between aircraft types or variants, or an approved transition path for pilots with relevant previous qualifications and experience.',
    dgcaRule: 'CAR Section 7, Series B, Part XIX; applicable operational CAR; approved syllabus and manufacturer operational-suitability data, where accepted by DGCA',
    usageContext: 'Apply only the credit or reduced course expressly approved for the candidate category. EASA CCQ or OSD material is not automatically a DGCA authorization or waiver.',
  },
  {
    term: 'LOFT',
    fullName: 'Line-Oriented Flight Training',
    category: 'TRAINING',
    definition: 'Scenario-based, full-mission training representative of line operations and intended to integrate technical and non-technical competencies in a crew environment.',
    dgcaRule: 'Applicable DGCA operational CAR; approved operator or ATO training manual and syllabus',
    usageContext: 'Use approved scenarios, facilitator guidance, competency standards and debriefing methods; a foreign advisory circular is guidance only if adopted in the approved programme.',
  },
  {
    term: 'PPC',
    fullName: 'Pilot Proficiency Check',
    category: 'REGULATORY',
    definition: 'A periodic check used to demonstrate continuing proficiency for the applicable operator, aircraft type and operation. It is distinct from a licensing skill test unless the controlling requirements expressly combine or credit them.',
    dgcaRule: 'Aircraft Rules, 1937, Schedule II; applicable CAR Section 8 operational Part; approved operator training and checking programme',
    usageContext: 'Calculate validity and required checking events from the applicable operation and programme. Verify examiner or check-pilot authority and FSTD approval for the specific check.',
  },
  {
    term: 'PF / PM',
    fullName: 'Pilot Flying / Pilot Monitoring',
    category: 'OPERATIONAL',
    definition: 'Crew task roles in which the PF manages the flight path and the PM supports, monitors and cross-checks in accordance with the operator\'s procedures. Exact duties vary by phase of flight and SOP.',
    dgcaRule: 'Approved operator Operations Manual, SOPs and training programme; applicable CAR Section 8 operational Part',
    usageContext: 'Pair and rotate roles as required by the approved lesson plan; do not assume every session requires exactly two cadets.',
  },
  {
    term: 'MEL / CDL',
    fullName: 'Minimum Equipment List / Configuration Deviation List',
    category: 'OPERATIONAL',
    definition: 'The MEL is the operator-specific, DGCA-approved document controlling dispatch with specified inoperative equipment. The CDL is approved aircraft configuration data for permitted external-part deviations and associated limitations or performance effects.',
    dgcaRule: 'CAR Section 2, Series B, Part I (MEL); approved AFM or manufacturer CDL and operator procedures',
    usageContext: 'Training scenarios must use the operator\'s current MEL revision and the applicable rectification interval, procedures and conditions; MEL and CDL are not interchangeable.',
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
              ATO Platform Operations Manual & Regulatory Guide
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-3xl">
            Audited operational guidance mapped to the applicable DGCA CARs, Operations Circulars, approval records, FSTD qualification records and approved manuals or syllabi.
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
            { id: 'scheduling', label: '1. Slot & Compliance', icon: <CalendarClock className="w-4 h-4" /> },
            { id: 'onboarding', label: '2. Instructor Onboard', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'courses', label: '3. Courses & MCC/JIT', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'cadets', label: '4. Cadet ETR & Blockers', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'cbta', label: '5. CBTA Stage Exams', icon: <Award className="w-4 h-4" /> },
            { id: 'recurrent', label: '6. Recurrent Checks', icon: <ShieldCheck className="w-4 h-4" /> },
          ].map((wf) => (
            <button
              key={wf.id}
              onClick={() => setActiveWorkflow(wf.id)}
              className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${activeWorkflow === wf.id
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
                The pre-booking check must use configurable rules drawn from the organization&apos;s current approvals and manuals. A platform checklist supports compliance but does not replace operational authorization.
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
                    Check the instructor or examiner&apos;s role, type, scope, validity and recency; the FSTD&apos;s current qualification, SOQ and configuration; approved syllabus prerequisites; actual role-based duty/rest limits; trainee eligibility; and device availability.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-skyline-600 dark:text-skyline-400 font-mono">Step 3: Dispatch Release</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Resolve every failed control, retain the evidence and authorized override, if any, then book the slot. Generate an <strong>internal session release record</strong>; do not label it an official DGCA form unless DGCA or an approved manual defines it as such.
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
                  Instructor and Examiner Onboarding: Source-Verified Authorities
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Create one controlled record for each approval, appointment, type, role and privilege. Validity, recency and standardization rules must be transcribed from the controlling documents, not inferred from the issue date.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 1: Source Capture</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    In <strong>Instructor Qualifications</strong>, capture the person&apos;s DGCA approval or appointment number, exact role title, aircraft type, instructional or examining scope, issue date, expiry date and document copy.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 2: Validity Rules</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enter the stated expiry and each recency or standardization requirement from its source. Configure alerts from those stored rules. Never auto-create a five-year validity, base month or three-month grace window unless the controlling document expressly requires it.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">Step 3: Multi-Type Matrix</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Add separate type and role records, including device or aircraft privileges and limitations. A broad internal label such as <code>ALL_FLEETS</code> is allowed only when supported by the person&apos;s approval and the approved manual.
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
                Build every course from the current DGCA-approved syllabus revision and its entry requirements. Previous experience, MCC credit, differences training and reduced-course eligibility require documented assessment and an approved basis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Initial Type Rating (Fresher)</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Load the approved ground, MCC/JIT where applicable, FTD/FFS, aircraft and assessment content exactly as specified. Display hours, devices and completion standards from that controlled revision rather than fixed platform defaults.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Transition / Differences Course</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Verify the candidate&apos;s licence, ratings, experience and prerequisite evidence. Apply only the course reduction, differences syllabus or MCC credit expressly included in the DGCA approval; never grant an automatic waiver.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">Specialized Syllabi</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    For UPRT, command upgrade and other special courses, link the course to the specific approval, manual and syllabus. Stage gates and standards must come from those documents and remain revision controlled.
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
                The ATO must follow the sequence, prerequisites and completion standards in its approved syllabus. A scheduling blocker is an internal control used to enforce those approved requirements.
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
                  <div className="font-bold text-xs text-amber-600 dark:text-amber-400 font-mono">Verified Makeup Clearance</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Unlock only after the makeup or remedial activity is completed, assessed where required, supported by attendance and training records, and signed off by an authorized person. Retain who cleared it, why and when.
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
                Under CAR Section 7, Series B, Part XX, assessment must use the approved competency model, observable behaviours, performance standards and evidence. A platform result supports—but does not replace—the authorized training decision.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Approved Standard</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Configure the grading scale, tolerances and completion standard from the approved manual or syllabus. Do not use 80% as a universal DGCA CBTA pass mark.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Remedial Action</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    When evidence does not meet the approved standard, record the competency gap and assign individualized remedial training under the approved process. The duration and reassessment method are not fixed percentage bands.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">Release Decision</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    An authorized instructor, examiner or training manager records the outcome and next action in accordance with the syllabus. Progression remains blocked until the applicable completion criteria are evidenced and approved.
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
                  Instructor and Examiner Validity, Recency & Standardization Monitoring
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Monitor every approval expiry, recency event and standardization check against its own current CAR, Operations Circular, approval or appointment, and approved manual. Do not impose one annual cycle or grace window on all roles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">Rule-Based Alerts</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Calculate due and warning dates only from the stored controlling rule. Display the source, last completed event and exact deadline so the alert is auditable.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">Automatic Lockout</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    At expiry or loss of recency, block assignments outside any expressly permitted validity window. Show the reason and source; restoration requirements must be determined by an authorized compliance user.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 space-y-2">
                  <div className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">Evidence-Based Update</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Update status only after verifying the check report, examiner authority, approval or DGCA record and the applicable validity calculation. Preserve the prior record and audit trail; never roll expiry forward by one click alone.
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
              Audited working glossary. Each entry identifies the primary applicable reference and the operational evidence the platform should verify.
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
                  <strong className="text-slate-700 dark:text-slate-300">Applicable reference:</strong> {item.dgcaRule}
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-tight">
                  <strong className="text-slate-700 dark:text-slate-300">Implementation note:</strong> {item.usageContext}
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

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Primary index for this module. Always use the latest revision shown on the DGCA portal and the organization&apos;s current approved documents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series D, Part IV + CAP 7100</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Approval and administration of ATOs for type rating of flight crew: organization, personnel, facilities, manuals, syllabi, records and quality controls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series D, Part VI + OC 15/2014</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              FSTD initial and continuing qualification, MQTG/SOQ controls, FFS/FTD standards and operational authorization for training or checking use.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series I, Part I + CAP 7200 + OC 09/2013</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Appointment, approval and standardization controls for designated examiners, SFEs and other covered examining/checking roles, subject to individual authority.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series I, Part VII</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Approval of ground instructors and subject matter experts, including the subjects and scope recorded in the approval.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series B, Parts XIX and XX</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Type-rating training controls (Part XIX) and the DGCA framework for Competency-Based Training and Assessment and Evidence-Based Training (Part XX).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 7, Series J — Applicable Part</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              FDTL and fatigue-management requirements for flight crew by operation category. It is not a universal simulator-instructor duty-limit table.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">Applicable CAR 8 Operational Part</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Operator flight-crew training, qualification, checking, differences/conversion training and approved training-programme controls for the applicable operation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">Operations Circular 06 of 2018 + ICAO Doc 10011</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Upset Prevention and Recovery Training, applied through the approved operator or ATO programme and appropriate qualified training media.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">CAR 2, Series B, Part I + Approved AFM/CDL</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Minimum Equipment List approval and use, together with the separate approved Configuration Deviation List and operator procedures.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
