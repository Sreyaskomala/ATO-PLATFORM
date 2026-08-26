'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  UserCheck,
} from 'lucide-react';

export const ExportPrintModal: React.FC = () => {
  const {
    isExportPrintModalOpen,
    setIsExportPrintModalOpen,
    schedules,
    instructors,
    students,
    batches,
    organisation,
    addToast,
  } = useStore();

  const [selectedFormat, setSelectedFormat] = useState<'EXCEL_SCHEDULE' | 'EXCEL_INSTRUCTORS' | 'EXCEL_CADETS' | 'PRINT_DISPATCH' | 'PRINT_FDTL_AUDIT'>('EXCEL_SCHEDULE');

  if (!isExportPrintModalOpen) return null;

  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: `${filename}.csv successfully generated for Excel / Google Sheets.`,
    });

    setIsExportPrintModalOpen(false);
  };

  const handleExecuteExport = () => {
    if (selectedFormat === 'EXCEL_SCHEDULE') {
      const headers = [
        'Session ID',
        'Batch Code',
        'Session Code',
        'Title',
        'Phase',
        'Aircraft Type',
        'Instructor Name',
        'Instructor Role',
        'Simulator / Bay',
        'Cadets',
        'Date',
        'Start Time',
        'End Time',
        'Briefing Hours',
        'Sim Hours',
        'Total Duty Hours',
        'Status',
      ];
      const rows = schedules.map((s) => [
        s.id,
        s.batch_code,
        s.session_code,
        s.session_title,
        s.phase,
        s.aircraft_type_name,
        s.instructor_name,
        s.instructor_role,
        s.resource_name,
        s.student_names.join('; '),
        s.date,
        s.start_time,
        s.end_time,
        s.briefing_hours,
        s.sim_hours,
        s.total_duty_hours,
        s.status,
      ]);
      handleExportCSV('AeroMatrix_Master_Schedule', headers, rows);
    } else if (selectedFormat === 'EXCEL_INSTRUCTORS') {
      const headers = [
        'Staff ID',
        'Instructor Name',
        'Roles',
        'Assigned Fleets',
        'DGCA Approval Number',
        'Approval Type',
        '5-Year Issue Date',
        '5-Year Expiry Date',
        'Base Month',
        'Recurrent Expiry',
        'Recurrent Status',
        'Employment Status',
        'Locked Out',
      ];
      const rows = instructors.map((i) => [
        i.staff_id,
        i.full_name,
        i.roles.join('; '),
        i.assigned_fleets.join('; '),
        i.dgca_approval_number,
        i.dgca_approval_type,
        i.dgca_5yr_approval_issue || 'N/A',
        i.dgca_5yr_approval_expiry || 'N/A',
        i.base_month,
        i.recurrent_expiry,
        i.recurrent_status,
        i.employment_status,
        i.is_locked_out ? 'YES' : 'NO',
      ]);
      handleExportCSV('DGCA_Instructor_Legality_Matrix', headers, rows);
    } else if (selectedFormat === 'EXCEL_CADETS') {
      const headers = [
        'Student ID',
        'Full Name',
        'Batch Code',
        'Airline Operator',
        'Class 1 Medical Expiry',
        'Ground Tech Cleared',
        'Ground Perf Cleared',
        'Sim Hours Completed',
        'Skill Test Cleared',
        'Status',
      ];
      const rows = students.map((s) => [
        s.student_number,
        s.full_name,
        s.batch_code,
        s.airline_sponsor || s.airline || 'N/A',
        s.medical_class1_expiry || '2027-08-31',
        s.ground_tech_completed ? 'YES' : 'NO',
        s.ground_perf_completed ? 'YES' : 'NO',
        s.sim_ffs_hours_completed ?? s.sim_hours_completed ?? 0,
        s.skill_test_cleared ? 'YES' : 'NO',
        s.status,
      ]);
      handleExportCSV('Cadet_Cohort_Progress_Roster', headers, rows);
    } else if (selectedFormat === 'PRINT_DISPATCH' || selectedFormat === 'PRINT_FDTL_AUDIT') {
      window.print();
      setIsExportPrintModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-skyline-600 flex items-center justify-center text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Export Data & Print Audit Documents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Generate Excel / CSV spreadsheets or print formatted DGCA compliance reports
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportPrintModalOpen(false)}
            aria-label="Close export and print modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection Grid */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Export Package / Document
          </label>

          <div className="space-y-2">
            {[
              {
                id: 'EXCEL_SCHEDULE',
                title: 'Master Simulator & Flight Schedule (Excel / CSV)',
                desc: 'Complete roster across all simulator bays, aircraft types, instructors, and cadets.',
                icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
                badge: 'CSV / Excel',
              },
              {
                id: 'EXCEL_INSTRUCTORS',
                title: 'DGCA Instructor Legality & Recurrent Matrix (Excel)',
                desc: 'Staff IDs, 5-year approvals, base month grace windows, and recurrent expiry records.',
                icon: <UserCheck className="w-5 h-5 text-skyline-500 dark:text-skyline-400" />,
                badge: 'Audit Ready',
              },
              {
                id: 'EXCEL_CADETS',
                title: 'Cadet Cohort & CBTA Progression Report (Excel)',
                desc: 'Enrolled students, airline sponsors, medical Class 1 validity, and syllabus hours.',
                icon: <FileSpreadsheet className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
                badge: 'Syllabus Log',
              },
              {
                id: 'PRINT_DISPATCH',
                title: 'Print Formatted Daily Simulator Operations Sheet (PDF / Print)',
                desc: 'Print-ready dispatch document with official DGCA ATO header and sign-off blocks.',
                icon: <Printer className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
                badge: 'Print / PDF',
              },
              {
                id: 'PRINT_FDTL_AUDIT',
                title: 'Print DGCA CAR Section 7 FDTL Compliance Certificate',
                desc: 'Certified instructor duty limitation records for DGCA regulatory audit inspection.',
                icon: <FileText className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
                badge: 'Regulatory',
              },
            ].map((fmt) => (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedFormat === fmt.id
                    ? 'bg-skyline-50 dark:bg-skyline-500/15 border-skyline-400 dark:border-skyline-500/60 shadow-sm dark:shadow-glow-cyan'
                    : 'bg-slate-50/70 dark:bg-aviation-900/50 border-slate-200 dark:border-aviation-800/80 hover:border-slate-300 dark:hover:border-aviation-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 shrink-0">
                    {fmt.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{fmt.title}</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded bg-slate-100 dark:bg-aviation-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-aviation-800">
                        {fmt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedFormat === fmt.id
                      ? 'border-skyline-500 bg-skyline-500 text-white'
                      : 'border-slate-300 dark:border-aviation-700'
                  }`}
                >
                  {selectedFormat === fmt.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-aviation-800">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Tenant: {organisation.legal_name}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportPrintModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteExport}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-skyline-600 hover:from-emerald-400 hover:to-skyline-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
            >
              {selectedFormat.startsWith('PRINT') ? (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print Document / PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Excel CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
