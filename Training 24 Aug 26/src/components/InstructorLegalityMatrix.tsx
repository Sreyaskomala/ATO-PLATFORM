'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { calculateInstructorDutyFDTL } from '@/lib/compliance';
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Calendar,
  RotateCw,
  Award,
  Layers,
  Search,
  Plus,
} from 'lucide-react';

export const InstructorLegalityMatrix: React.FC = () => {
  const {
    instructors,
    schedules,
    dutyLogs,
    setSelectedInstructorId,
    setActiveTab,
    setIsAddInstructorModalOpen,
    updateInstructorStatus,
    setRenewModalInstructor,
    addInstructorQualification,
  } = useStore();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [fleetFilter, setFleetFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedInstructorId, setExpandedInstructorId] = useState<string | null>(null);

  // Quick qualification adding modal state
  const [addingQualForInsId, setAddingQualForInsId] = useState<string | null>(null);
  const [newQualFleet, setNewQualFleet] = useState<string>('B737');
  const [newQualRole, setNewQualRole] = useState<string>('SFI');
  const [newQualApprovalNo, setNewQualApprovalNo] = useState<string>('DGCA/SFI/B737/2026-');
  const [newQualIssueDate, setNewQualIssueDate] = useState<string>('2025-04-10');

  const filteredInstructors = instructors.filter((ins) => {
    if (roleFilter !== 'ALL' && !ins.roles.includes(roleFilter as any)) return false;
    if (fleetFilter !== 'ALL' && !ins.assigned_fleets.some((f) => f.includes(fleetFilter))) return false;
    if (statusFilter !== 'ALL' && ins.employment_status !== statusFilter) return false;
    return true;
  });

  const handleSaveQuickQual = (insId: string) => {
    const parts = newQualIssueDate.split('-');
    const issueY = parseInt(parts[0], 10) || 2025;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mIdx = parseInt(parts[1] || '04', 10) - 1;
    const qualBaseMonth = (mIdx >= 0 && mIdx < 12) ? monthNames[mIdx] : 'April';
    const qualExpDate = `${issueY + 5}-${parts[1] || '04'}-${parts[2] || '10'}`;

    addInstructorQualification(insId, {
      id: `qual-${Date.now()}`,
      fleet_code: newQualFleet,
      role: newQualRole as any,
      approval_number: newQualApprovalNo,
      approval_type: `${newQualRole} DGCA CAR Section 7 (${newQualFleet})`,
      approval_issue_date: newQualIssueDate,
      approval_expiry_date: qualExpDate,
      base_month: qualBaseMonth,
      recurrent_expiry: `2027-${parts[1] || '04'}-30`,
      recurrent_window_start: `2027-02-01`,
      status: 'VALID',
    });

    setAddingQualForInsId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-skyline-500 dark:text-skyline-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Flight Instructor Qualifications & Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            DGCA Civil Aviation Requirements: Multi-Fleet Endorsements, SFI / SFE / GI 5-Year Approvals & Annual Recurrent Base Month Grace Windows
          </p>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500"
          >
            <option value="ALL">All Roles (GI / SFI / SFE)</option>
            <option value="GI_TECH">Tech GI (Systems/Avionics)</option>
            <option value="GI_PERF">Perf GI / SME (Performance/W&B)</option>
            <option value="SFI">SFI (Simulators)</option>
            <option value="SFE">SFE (Examiners)</option>
          </select>

          <select
            value={fleetFilter}
            onChange={(e) => setFleetFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500"
          >
            <option value="ALL">All Fleets</option>
            <option value="A320">Airbus A320</option>
            <option value="B737">Boeing B737</option>
            <option value="ATR">ATR 72-600</option>
            <option value="Q400">DHC-8 Q400</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-750 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-skyline-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (On Roster)</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="RESIGNED">Resigned / Inactive</option>
          </select>

          <button
            onClick={() => setIsAddInstructorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Instructor</span>
          </button>
        </div>
      </div>

      {/* Roster & Qualifications Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl overflow-x-auto shadow-sm dark:shadow-none">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <th className="pb-3 font-semibold">INSTRUCTOR / STAFF ID</th>
              <th className="pb-3 font-semibold">FLEETS & SCOPE</th>
              <th className="pb-3 font-semibold">PRIMARY DGCA 5-YR</th>
              <th className="pb-3 font-semibold">BASE MONTH / RECURRENT</th>
              <th className="pb-3 font-semibold">24H FDTL (≤6h)</th>
              <th className="pb-3 font-semibold">7D FDTL (≤30h)</th>
              <th className="pb-3 font-semibold">STATUS</th>
              <th className="pb-3 font-semibold text-right">ENDORSEMENTS & ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-aviation-800/60">
            {filteredInstructors.map((ins) => {
              const fdtl = calculateInstructorDutyFDTL(
                ins.id,
                instructors,
                '2026-09-01',
                0,
                schedules,
                dutyLogs
              );

              const isWindowOpen = ins.recurrent_status === 'EXPIRING' || ins.is_locked_out;
              const isExpanded = expandedInstructorId === ins.id;
              const qualCount = ins.qualifications?.length || 0;

              return (
                <React.Fragment key={ins.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-aviation-950/40 transition-colors">
                    {/* Instructor Name & Role */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-aviation-800 border border-slate-200 dark:border-aviation-700 flex items-center justify-center font-heading font-bold text-skyline-600 dark:text-skyline-400 text-xs">
                          {ins.avatar_initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{ins.full_name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {ins.roles.map((r) => (
                              <span
                                key={r}
                                className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                                  r === 'GI_TECH'
                                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
                                    : r === 'GI_PERF'
                                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                                    : r === 'SFI'
                                    ? 'bg-skyline-50 dark:bg-skyline-500/10 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/30'
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                }`}
                              >
                                {r.replace('_', ' ')}
                              </span>
                            ))}
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{ins.staff_id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Fleets */}
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {ins.assigned_fleets.map((f) => (
                          <span key={f} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* DGCA 5-Yr Approval */}
                    <td className="py-4 pr-4">
                      <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {ins.dgca_5yr_approval_issue ? `${ins.dgca_5yr_approval_issue} (5-Yr Valid)` : '5-Yr DGCA Valid'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{ins.dgca_approval_number}</div>
                    </td>

                    {/* Recurrent TRS 1-Yr */}
                    <td className="py-4 pr-4">
                      <div className="text-slate-800 dark:text-slate-200 font-mono">
                        Base: <strong className="text-skyline-600 dark:text-skyline-400">{ins.base_month}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        Due: {ins.recurrent_expiry}
                      </div>
                    </td>

                    {/* Rolling 24h FDTL */}
                    <td className="py-4 pr-4">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {fdtl.hours_24h_total} / 6.0h
                      </div>
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-aviation-950 overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            fdtl.percentage_24h > 85 ? 'bg-rose-500' : 'bg-skyline-500'
                          }`}
                          style={{ width: `${fdtl.percentage_24h}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Rolling 7d FDTL */}
                    <td className="py-4 pr-4">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {fdtl.hours_7d_total} / 30.0h
                      </div>
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-aviation-950 overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            fdtl.percentage_7d > 85 ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${fdtl.percentage_7d}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 pr-4">
                      {ins.employment_status === 'RESIGNED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono font-semibold text-[10px]">
                          RESIGNED / ARCHIVED
                        </span>
                      ) : ins.employment_status === 'ON_LEAVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono font-semibold text-[10px]">
                          ON LEAVE
                        </span>
                      ) : ins.is_locked_out || ins.recurrent_status === 'REFRESHER_REQUIRED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 font-mono font-bold text-[10px]">
                          <AlertOctagon className="w-3 h-3" /> REFRESHER LOCKED
                        </span>
                      ) : ins.recurrent_status === 'EXPIRING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono font-bold text-[10px] animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> 3-MO WINDOW
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3" /> CURRENT & LEGAL
                        </span>
                      )}
                    </td>

                    {/* Actions: Expand Endorsements + Renew */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedInstructorId(isExpanded ? null : ins.id)}
                          className="px-2.5 py-1 rounded-lg bg-skyline-50 hover:bg-skyline-100 dark:bg-skyline-500/15 dark:hover:bg-skyline-500/25 text-skyline-700 dark:text-skyline-300 border border-skyline-200 dark:border-skyline-500/30 text-[11px] font-mono font-semibold transition-all"
                        >
                          {isExpanded ? 'Hide Endorsements' : `Qualifications (${qualCount || ins.roles.length})`}
                        </button>

                        {isWindowOpen && (
                          <button
                            onClick={() => setRenewModalInstructor(ins)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[11px] font-mono font-semibold transition-all shadow-sm"
                            title="Log Completed Recurrent Check"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Renew Check</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Multi-Fleet Endorsements Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="p-4 bg-slate-50/80 dark:bg-aviation-950/60 border-b border-slate-200 dark:border-aviation-800">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <Award className="w-4 h-4 text-skyline-500" />
                              <span>Granular Fleet & Role Endorsements for {ins.full_name}</span>
                            </div>

                            <button
                              onClick={() => setAddingQualForInsId(addingQualForInsId === ins.id ? null : ins.id)}
                              className="px-2.5 py-1 rounded-lg bg-skyline-500 hover:bg-skyline-400 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              Add New Endorsement
                            </button>
                          </div>

                          {/* Add endorsement inline form */}
                          {addingQualForInsId === ins.id && (
                            <div className="p-3 rounded-2xl bg-white dark:bg-aviation-900 border border-skyline-300 dark:border-skyline-500/40 space-y-2 text-xs font-mono">
                              <div className="font-bold text-skyline-700 dark:text-skyline-300 text-[11px]">
                                Add Endorsement on Fleet Type
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500">Fleet</label>
                                  <select
                                    value={newQualFleet}
                                    onChange={(e) => setNewQualFleet(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1.5 text-xs"
                                  >
                                    <option value="A320">Airbus A320</option>
                                    <option value="B737">Boeing B737</option>
                                    <option value="ATR 72-600">ATR 72-600</option>
                                    <option value="Q400">DHC-8 Q400</option>
                                    <option value="ALL_FLEETS">All Fleets (GI)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] text-slate-500">Role / Scope</label>
                                  <select
                                    value={newQualRole}
                                    onChange={(e) => setNewQualRole(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1.5 text-xs"
                                  >
                                    <option value="SFI">SFI (Simulator)</option>
                                    <option value="SFE">SFE (Examiner)</option>
                                    <option value="GI_TECH">GI Technical</option>
                                    <option value="GI_PERF">GI Performance</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] text-slate-500">Approval Number</label>
                                  <input
                                    type="text"
                                    value={newQualApprovalNo}
                                    onChange={(e) => setNewQualApprovalNo(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1.5 text-xs"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-slate-500">Issue Date</label>
                                  <input
                                    type="date"
                                    value={newQualIssueDate}
                                    onChange={(e) => setNewQualIssueDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-lg p-1.5 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setAddingQualForInsId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-aviation-800 text-[10px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveQuickQual(ins.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                                >
                                  Save Endorsement
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Qualifications Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {(ins.qualifications || []).map((q) => (
                              <div
                                key={q.id}
                                className="p-3 rounded-xl bg-white dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-xs font-mono space-y-1.5 shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded bg-skyline-100 dark:bg-skyline-500/20 text-skyline-800 dark:text-skyline-300 font-bold">
                                    {q.fleet_code} • {q.role}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                    {q.status}
                                  </span>
                                </div>

                                <div className="text-slate-900 dark:text-white font-semibold text-[11px]">
                                  {q.approval_number}
                                </div>

                                <div className="text-[10px] text-slate-500 space-y-0.5">
                                  <div>5-Yr Validity: {q.approval_issue_date} → {q.approval_expiry_date}</div>
                                  <div>Base Month: <strong className="text-skyline-600 dark:text-skyline-400">{q.base_month}</strong> (Due {q.recurrent_expiry})</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
