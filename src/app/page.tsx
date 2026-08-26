'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { MasterCalendar } from '@/components/MasterCalendar';
import { BatchPipeline } from '@/components/BatchPipeline';
import { FlightScheduler } from '@/components/FlightScheduler';
import { InstructorLegalityMatrix } from '@/components/InstructorLegalityMatrix';
import { FleetResources } from '@/components/FleetResources';
import { SchemaExplorer } from '@/components/SchemaExplorer';
import { CoursesView } from '@/components/CoursesView';
import { CadetDossierView } from '@/components/CadetDossierView';
import { OperationsManualView } from '@/components/OperationsManualView';
import { AddInstructorModal } from '@/components/AddInstructorModal';
import { CreateBatchModal } from '@/components/CreateBatchModal';
import { ExportPrintModal } from '@/components/ExportPrintModal';
import { RenewRecurrentModal } from '@/components/RenewRecurrentModal';
import { CalendarSlotModal } from '@/components/CalendarSlotModal';
import { CreateCourseModal } from '@/components/CreateCourseModal';
import { RecordEvaluationModal } from '@/components/RecordEvaluationModal';
import { SessionClearanceModal } from '@/components/SessionClearanceModal';

export default function Home() {
  const { activeTab, setTheme } = useStore();

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('aeromatrix_theme') as 'light' | 'dark' | null;
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      } else {
        setTheme('light');
      }
    } catch (e) {
      setTheme('light');
    }
  }, [setTheme]);

  return (
    <div className="flex min-h-screen bg-slate-100/80 dark:bg-aviation-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'calendar' && <MasterCalendar />}
            {activeTab === 'scheduler' && <FlightScheduler />}
            {activeTab === 'courses' && <CoursesView />}
            {activeTab === 'cadets' && <CadetDossierView />}
            {activeTab === 'instructors' && <InstructorLegalityMatrix />}
            {activeTab === 'pipeline' && <BatchPipeline />}
            {activeTab === 'fleets' && <FleetResources />}
            {activeTab === 'manual' && <OperationsManualView />}
            {activeTab === 'schema' && <OperationsManualView />}
          </div>
        </main>
      </div>

      {/* Global Action Modals */}
      <AddInstructorModal />
      <CreateBatchModal />
      <ExportPrintModal />
      <RenewRecurrentModal />
      <CalendarSlotModal />
      <CreateCourseModal />
      <RecordEvaluationModal />
      <SessionClearanceModal />
    </div>
  );
}

