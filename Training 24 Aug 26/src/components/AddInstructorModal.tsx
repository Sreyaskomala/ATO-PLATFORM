'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  UserCheck,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  Mail,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { InstructorRole, QualificationStatus } from '@/types';

export const AddInstructorModal: React.FC = () => {
  const { isAddInstructorModalOpen, setIsAddInstructorModalOpen, addInstructor, fleets } = useStore();

  const [fullName, setFullName] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 ');
  const [selectedRoles, setSelectedRoles] = useState<InstructorRole[]>(['SFI']);
  const [selectedFleets, setSelectedFleets] = useState<string[]>(['A320']);
  const [approvalNumber, setApprovalNumber] = useState<string>('DGCA/SFI/A320/2026-');
  const [approvalType, setApprovalType] = useState<string>('SFI CAR Section 7 (Level D FFS)');
  
  // 5-Year DGCA Approval
  const [approvalIssueDate, setApprovalIssueDate] = useState<string>('2024-06-01');
  const [baseMonth, setBaseMonth] = useState<string>('November');
  const [recurrentStatus, setRecurrentStatus] = useState<QualificationStatus>('VALID');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'RESIGNED'>('ACTIVE');

  if (!isAddInstructorModalOpen) return null;

  // Compute 5-year expiry
  const issueYear = parseInt(approvalIssueDate.split('-')[0]) || 2024;
  const expiryYear = issueYear + 5;
  const approvalExpiryDate = `${expiryYear}-${approvalIssueDate.split('-')[1] || '06'}-${approvalIssueDate.split('-')[2] || '01'}`;

  // Month mapping
  const monthMap: { [key: string]: { num: string; startGrace: string } } = {
    January: { num: '01', startGrace: '11' },
    February: { num: '02', startGrace: '12' },
    March: { num: '03', startGrace: '01' },
    April: { num: '04', startGrace: '02' },
    May: { num: '05', startGrace: '03' },
    June: { num: '06', startGrace: '04' },
    July: { num: '07', startGrace: '05' },
    August: { num: '08', startGrace: '06' },
    September: { num: '09', startGrace: '07' },
    October: { num: '10', startGrace: '08' },
    November: { num: '11', startGrace: '09' },
    December: { num: '12', startGrace: '10' },
  };

  const recurrentExpiry = `2026-${monthMap[baseMonth]?.num || '11'}-30`;
  const recurrentWindowStart = `2026-${monthMap[baseMonth]?.startGrace || '09'}-01`;

  const handleRoleToggle = (role: InstructorRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleFleetToggle = (fleetCode: string) => {
    if (selectedFleets.includes(fleetCode)) {
      if (selectedFleets.length > 1) {
        setSelectedFleets(selectedFleets.filter((f) => f !== fleetCode));
      }
    } else {
      setSelectedFleets([...selectedFleets, fleetCode]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !staffId) return;

    addInstructor({
      full_name: fullName.startsWith('Capt.') ? fullName : `Capt. ${fullName}`,
      staff_id: staffId,
      email: email || `${staffId.toLowerCase()}@gata.aero`,
      phone: phone,
      roles: selectedRoles,
      assigned_fleets: selectedFleets,
      dgca_approval_number: approvalNumber,
      dgca_approval_type: approvalType,
      dgca_5yr_approval_issue: approvalIssueDate,
      dgca_5yr_approval_expiry: approvalExpiryDate,
      base_month: baseMonth,
      recurrent_expiry: recurrentExpiry,
      recurrent_window_start: recurrentWindowStart,
      recurrent_status: recurrentStatus,
      currency_status: 'VALID',
      employment_status: employmentStatus,
    });

    setIsAddInstructorModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-aviation-950 border border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-skyline-500/15 border border-skyline-500/30 flex items-center justify-center text-skyline-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white">
                Onboard Flight Instructor / Examiner
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                DGCA CAR Section 7 SFI / SFE / GI 5-Year Authorisation & Base Month Registration
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddInstructorModalOpen(false)}
            aria-label="Close add instructor modal"
            className="p-2 rounded-xl bg-aviation-900 border border-aviation-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Staff ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Instructor Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Capt. Rajesh Varma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-aviation-900 border border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-skyline-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Staff ID / Employee Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SFI-A320-205"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full bg-aviation-900 border border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-skyline-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="rajesh.varma@gata.aero"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-aviation-900 border border-aviation-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-skyline-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Mobile Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+91 98111 44556"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-aviation-900 border border-aviation-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-skyline-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Row 3: Role Privileges */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300">
              Instructional Roles & Privileges (DGCA Scope) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'SFI', label: 'SFI (Simulator Flight Inst)' },
                { id: 'SFE', label: 'SFE (Designated Examiner)' },
                { id: 'GI_TECH', label: 'GI (Technical Systems)' },
                { id: 'GI_PERF', label: 'GI (Perf / SME)' },
              ].map((role) => (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => handleRoleToggle(role.id as InstructorRole)}
                  className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                    selectedRoles.includes(role.id as InstructorRole)
                      ? 'bg-skyline-500/20 border-skyline-500/50 text-white font-bold shadow-sm'
                      : 'bg-aviation-900 border-aviation-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Fleet Type Endorsements */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300">
              Endorsed Aircraft Fleet Types *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['A320', 'B737', 'ATR 72-600', 'Q400'].map((fleetCode) => (
                <button
                  type="button"
                  key={fleetCode}
                  onClick={() => handleFleetToggle(fleetCode)}
                  className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${
                    selectedFleets.includes(fleetCode)
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white font-bold'
                      : 'bg-aviation-900 border-aviation-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {fleetCode}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: 5-Year DGCA Approval & Expiry */}
          <div className="p-4 rounded-2xl bg-aviation-900/60 border border-aviation-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-skyline-300">
              <Award className="w-4 h-4 text-skyline-400" />
              <span>DGCA CAR 5-Year Initial Approval & Recurrent Base Month</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">DGCA Approval No.</label>
                <input
                  type="text"
                  value={approvalNumber}
                  onChange={(e) => setApprovalNumber(e.target.value)}
                  className="w-full bg-aviation-950 border border-aviation-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">5-Yr Issue Date</label>
                <input
                  type="date"
                  value={approvalIssueDate}
                  onChange={(e) => setApprovalIssueDate(e.target.value)}
                  className="w-full bg-aviation-950 border border-aviation-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">5-Yr Expiry Date</label>
                <input
                  type="text"
                  readOnly
                  value={approvalExpiryDate}
                  className="w-full bg-aviation-950/60 border border-aviation-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-aviation-800/40">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Base Month</label>
                <select
                  value={baseMonth}
                  onChange={(e) => setBaseMonth(e.target.value)}
                  className="w-full bg-aviation-950 border border-aviation-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  {Object.keys(monthMap).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">3-Month Grace Window Opens</label>
                <div className="text-xs font-mono text-amber-300 py-2">
                  {recurrentWindowStart}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Annual Recurrent Due</label>
                <div className="text-xs font-mono text-emerald-400 py-2">
                  {recurrentExpiry}
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Employment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Employment Status
              </label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="w-full bg-aviation-900 border border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              >
                <option value="ACTIVE">ACTIVE (On Roster)</option>
                <option value="ON_LEAVE">ON LEAVE (Duty Paused)</option>
                <option value="RESIGNED">RESIGNED / ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Recurrent Check Status
              </label>
              <select
                value={recurrentStatus}
                onChange={(e) => setRecurrentStatus(e.target.value as any)}
                className="w-full bg-aviation-900 border border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              >
                <option value="VALID">VALID (Standard privileges)</option>
                <option value="EXPIRING">EXPIRING (Inside 3-Mo Window)</option>
                <option value="REFRESHER_REQUIRED">REFRESHER REQUIRED (Locked)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-aviation-800">
            <button
              type="button"
              onClick={() => setIsAddInstructorModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-aviation-900 hover:bg-aviation-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all"
            >
              Register & Authorise Instructor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
