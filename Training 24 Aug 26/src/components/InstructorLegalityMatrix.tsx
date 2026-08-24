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
  } = useStore();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [fleetFilter, setFleetFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredInstructors = instructors.filter((ins) => {
    if (roleFilter !== 'ALL' && !ins.roles.includes(roleFilter as any)) return false;
    if (fleetFilter !== 'ALL' && !ins.assigned_fleets.some((f) => f.includes(fleetFilter))) return false;
    if (statusFilter !== 'ALL' && ins.employment_status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-skyline-400" />
            <h2 className="font-heading font-extrabold text-2xl text-white">
              Flight Instructor Qualifications & Roster
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            DGCA Civil Aviation Requirements: SFI / SFE / GI 5-Year Approvals, Annual Recurrent Base Month Grace Windows & Flight Duty Time Limitations
          </p>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-aviation-950 border border-aviation-750 text-xs font-semibold text-slate-200 focus:outline-none focus:border-skyline-500"
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
            className="px-3 py-2 rounded-xl bg-aviation-950 border border-aviation-750 text-xs font-semibold text-slate-200 focus:outline-none focus:border-skyline-500"
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
            className="px-3 py-2 rounded-xl bg-aviation-950 border border-aviation-750 text-xs font-semibold text-slate-200 focus:outline-none focus:border-skyline-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (On Roster)</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="RESIGNED">Resigned / Inactive</option>
          </select>

          <button
            onClick={() => setIsAddInstructorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Instructor</span>
          </button>
        </div>
      </div>

      {/* Roster & Qualifications Matrix */}
      <div className="p-6 rounded-3xl bg-aviation-900/80 border border-aviation-800 backdrop-blur-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-aviation-800 text-slate-400 font-mono text-[11px]">
              <th className="pb-3 font-semibold">INSTRUCTOR / STAFF ID</th>
              <th className="pb-3 font-semibold">FLEETS</th>
              <th className="pb-3 font-semibold">DGCA 5-YR APPROVAL</th>
              <th className="pb-3 font-semibold">BASE MONTH / RECURRENT</th>
              <th className="pb-3 font-semibold">3-MO GRACE WINDOW</th>
              <th className="pb-3 font-semibold">24H FDTL (≤6h)</th>
              <th className="pb-3 font-semibold">7D FDTL (≤30h)</th>
              <th className="pb-3 font-semibold">STATUS</th>
              <th className="pb-3 font-semibold text-right">ACTIONS & RENEWAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-800/60">
            {filteredInstructors.map((ins) => {
              const fdtl = calculateInstructorDutyFDTL(
                ins.id,
                instructors,
                '2026-08-25',
                0,
                schedules,
                dutyLogs
              );

              const isWindowOpen = ins.recurrent_status === 'EXPIRING' || ins.is_locked_out;

              return (
                <tr key={ins.id} className="hover:bg-aviation-950/40 transition-colors">
                  {/* Instructor Name & Role */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-aviation-800 border border-aviation-700 flex items-center justify-center font-heading font-bold text-skyline-400 text-xs">
                        {ins.avatar_initials}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{ins.full_name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {ins.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                                r === 'GI_TECH'
                                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                  : r === 'GI_PERF'
                                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                                  : r === 'SFI'
                                  ? 'bg-skyline-500/10 text-skyline-300 border border-skyline-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {r.replace('_', ' ')}
                            </span>
                          ))}
                          <span className="text-[10px] font-mono text-slate-500">{ins.staff_id}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Fleets */}
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {ins.assigned_fleets.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded bg-aviation-950 border border-aviation-800 text-[10px] font-mono text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* DGCA 5-Yr Approval */}
                  <td className="py-4 pr-4">
                    <div className="font-mono font-semibold text-emerald-400">
                      {ins.dgca_5yr_approval_issue ? `${ins.dgca_5yr_approval_issue.split('-')[0]} – ${ins.dgca_5yr_approval_expiry?.split('-')[0]} (5 Yr)` : '5-Yr DGCA Valid'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{ins.dgca_approval_number}</div>
                  </td>

                  {/* Recurrent TRS 1-Yr */}
                  <td className="py-4 pr-4">
                    <div className="text-slate-200 font-mono">
                      Base: <strong className="text-skyline-400">{ins.base_month}</strong>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Due: {ins.recurrent_expiry}
                    </div>
                  </td>

                  {/* 3-Month Renewal Window */}
                  <td className="py-4 pr-4">
                    <div className="font-mono text-slate-300 text-[11px]">
                      {ins.recurrent_window_start} – {ins.recurrent_expiry}
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono">3-Mo Window</div>
                  </td>

                  {/* Rolling 24h FDTL */}
                  <td className="py-4 pr-4">
                    <div className="font-mono font-bold text-slate-200">
                      {fdtl.hours_24h_total} / 6.0h
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-aviation-950 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          fdtl.percentage_24h > 85 ? 'bg-rose-500' : 'bg-skyline-400'
                        }`}
                        style={{ width: `${fdtl.percentage_24h}%` }}
                      ></div>
                    </div>
                  </td>

                  {/* Rolling 7d FDTL */}
                  <td className="py-4 pr-4">
                    <div className="font-mono font-bold text-slate-200">
                      {fdtl.hours_7d_total} / 30.0h
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-aviation-950 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          fdtl.percentage_7d > 85 ? 'bg-rose-500' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${fdtl.percentage_7d}%` }}
                      ></div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 pr-4">
                    {ins.employment_status === 'RESIGNED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono font-semibold text-[10px]">
                        RESIGNED / ARCHIVED
                      </span>
                    ) : ins.employment_status === 'ON_LEAVE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-semibold text-[10px]">
                        ON LEAVE
                      </span>
                    ) : ins.is_locked_out || ins.recurrent_status === 'REFRESHER_REQUIRED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-[10px]">
                        <AlertOctagon className="w-3 h-3" /> REFRESHER LOCKED
                      </span>
                    ) : ins.recurrent_status === 'EXPIRING' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> 3-MO WINDOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                        <ShieldCheck className="w-3 h-3" /> CURRENT & LEGAL
                      </span>
                    )}
                  </td>

                  {/* Actions: Renew Check + Status Toggle */}
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isWindowOpen && (
                        <button
                          onClick={() => setRenewModalInstructor(ins)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-semibold transition-all shadow-sm"
                          title="Log Completed Recurrent Check"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Renew Check</span>
                        </button>
                      )}

                      <select
                        value={ins.employment_status || 'ACTIVE'}
                        onChange={(e) => updateInstructorStatus(ins.id, e.target.value as any)}
                        className="bg-aviation-950 border border-aviation-800 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200 focus:border-skyline-500 focus:outline-none"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="RESIGNED">Resigned</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
