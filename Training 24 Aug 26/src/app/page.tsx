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
import { AddInstructorModal } from '@/components/AddInstructorModal';
import { CreateBatchModal } from '@/components/CreateBatchModal';
import { ExportPrintModal } from '@/components/ExportPrintModal';
import { RenewRecurrentModal } from '@/components/RenewRecurrentModal';

export default function Home() {
  const { activeTab } = useStore();

  return (
    <div className="flex min-h-screen bg-aviation-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'calendar' && <MasterCalendar />}
            {activeTab === 'scheduler' && <FlightScheduler />}
            {activeTab === 'instructors' && <InstructorLegalityMatrix />}
            {activeTab === 'pipeline' && <BatchPipeline />}
            {activeTab === 'fleets' && <FleetResources />}
            {activeTab === 'schema' && <SchemaExplorer />}
          </div>
        </main>
      </div>

      {/* Global Action Modals */}
      <AddInstructorModal />
      <CreateBatchModal />
      <ExportPrintModal />
      <RenewRecurrentModal />
    </div>
  );
}
