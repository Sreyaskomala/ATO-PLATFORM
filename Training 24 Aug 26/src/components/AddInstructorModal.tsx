'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  Plane,
} from 'lucide-react';
import { InstructorRole, QualificationStatus, InstructorQualification } from '@/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_MAP: { [key: string]: { num: string; startGrace: string } } = {
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

export const AddInstructorModal: React.FC = () => {
  const { isAddInstructorModalOpen, setIsAddInstructorModalOpen, addInstructor, fleets } = useStore();

  const [fullName, setFullName] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 ');
  const [selectedRoles, setSelectedRoles] = useState<InstructorRole[]>(['SFI']);
  const [selectedFleets, setSelectedFleets] = useState<string[]>(['A320']);

  // Primary DGCA Approval Date (Base month is auto-derived from this date)
  const [approvalIssueDate, setApprovalIssueDate] = useState<string>('2024-06-15');
  const [baseMonth, setBaseMonth] = useState<string>('June');
  const [approvalNumber, setApprovalNumber] = useState<string>('DGCA/SFI/A320/2024-88');
  const [approvalType, setApprovalType] = useState<string>('SFI CAR Section 7 (Level D FFS)');
  const [recurrentStatus, setRecurrentStatus] = useState<QualificationStatus>('VALID');
  const [employmentStatus, setEmploymentStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'RESIGNED'>('ACTIVE');

  // Multi-Fleet Qualifications Builder
  const [qualificationsList, setQualificationsList] = useState<InstructorQualification[]>([
    {
      id: 'init-qual-1',
      fleet_code: 'A320',
      role: 'SFI',
      approval_number: 'DGCA/SFI/A320/2024-88',
      approval_type: 'SFI CAR Section 7 (Level D FFS)',
      approval_issue_date: '2024-06-15',
      approval_expiry_date: '2029-06-15',
      base_month: 'June',
      recurrent_expiry: '2027-06-30',
      recurrent_window_start: '2027-04-01',
      status: 'VALID',
    },
  ]);

  // Qualification form state for adding extra endorsement
  const [newQualFleet, setNewQualFleet] = useState<string>('B737');
  const [newQualRole, setNewQualRole] = useState<InstructorRole>('SFI');
  const [newQualApprovalNo, setNewQualApprovalNo] = useState<string>('DGCA/SFI/B737/2025-14');
  const [newQualIssueDate, setNewQualIssueDate] = useState<string>('2025-03-10');

  // Auto-derive Base Month whenever Approval Issue Date changes
  const handleApprovalDateChange = (dateVal: string) => {
    setApprovalIssueDate(dateVal);
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const monthIdx = parseInt(parts[1], 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          const autoMonth = MONTH_NAMES[monthIdx];
          setBaseMonth(autoMonth);
        }
      }
    }
  };

  if (!isAddInstructorModalOpen) return null;

  // Compute 5-year expiry
  const issueYear = parseInt(approvalIssueDate.split('-')[0]) || 2024;
  const expiryYear = issueYear + 5;
  const approvalExpiryDate = `${expiryYear}-${approvalIssueDate.split('-')[1] || '06'}-${approvalIssueDate.split('-')[2] || '15'}`;

  const recurrentExpiry = `2027-${MONTH_MAP[baseMonth]?.num || '06'}-30`;
  const recurrentWindowStart = `2027-${MONTH_MAP[baseMonth]?.startGrace || '04'}-01`;

  const handleAddQualification = () => {
    const parts = newQualIssueDate.split('-');
    const issueY = parseInt(parts[0]) || 2025;
    const mIdx = parseInt(parts[1] || '03', 10) - 1;
    const qualBaseMonth = (mIdx >= 0 && mIdx < 12) ? MONTH_NAMES[mIdx] : 'March';
    const qualExpDate = `${issueY + 5}-${parts[1] || '03'}-${parts[2] || '10'}`;
    const qualRecurrentExp = `2027-${MONTH_MAP[qualBaseMonth]?.num || '03'}-31`;
    const qualRecurrentWindow = `2027-${MONTH_MAP[qualBaseMonth]?.startGrace || '01'}-01`;

    const qualItem: InstructorQualification = {
      id: `qual-${Date.now()}`,
      fleet_code: newQualFleet,
      role: newQualRole,
      approval_number: newQualApprovalNo,
      approval_type: `${newQualRole} DGCA CAR Section 7 (${newQualFleet})`,
      approval_issue_date: newQualIssueDate,
      approval_expiry_date: qualExpDate,
      base_month: qualBaseMonth,
      recurrent_expiry: qualRecurrentExp,
      recurrent_window_start: qualRecurrentWindow,
      status: 'VALID',
    };

    setQualificationsList([...qualificationsList, qualItem]);
    setSelectedFleets(Array.from(new Set([...selectedFleets, newQualFleet])));
    setSelectedRoles(Array.from(new Set([...selectedRoles, newQualRole])));
  };

  const handleRemoveQualification = (id: string) => {
    if (qualificationsList.length <= 1) return;
    setQualificationsList(qualificationsList.filter((q) => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !staffId) return;

    // Ensure all fleet and roles in qualifications are included
    const allRoles = Array.from(new Set([...selectedRoles, ...qualificationsList.map((q) => q.role)]));
    const allFleets = Array.from(new Set([...selectedFleets, ...qualificationsList.map((q) => q.fleet_code)]));

    addInstructor({
      full_name: fullName.startsWith('Capt.') ? fullName : `Capt. ${fullName}`,
      staff_id: staffId,
      email: email || `${staffId.toLowerCase()}@gata.aero`,
      phone: phone,
      roles: allRoles,
      assigned_fleets: allFleets,
      qualifications: qualificationsList,
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn transition-colors duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-aviation-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-skyline-50 dark:bg-skyline-500/15 border border-skyline-200 dark:border-skyline-500/30 flex items-center justify-center text-skyline-600 dark:text-skyline-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                Onboard Flight Instructor / Examiner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                DGCA CAR Section 7 Multi-Fleet Authorisation & Automatic Base Month Calculation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddInstructorModalOpen(false)}
            aria-label="Close add instructor modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Staff ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Instructor Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Capt. Rajesh Varma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-skyline-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Staff ID / Employee Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SFI-A320-205"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:border-skyline-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="rajesh.varma@gata.aero"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-skyline-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Mobile Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+91 98111 44556"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:border-skyline-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Row 3: Primary Approval Date & Auto Base Month */}
          <div className="p-4 rounded-2xl bg-skyline-50/50 dark:bg-aviation-900/60 border border-skyline-200 dark:border-aviation-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-skyline-700 dark:text-skyline-300">
                <Award className="w-4 h-4 text-skyline-500 dark:text-skyline-400" />
                <span>Primary DGCA Approval Date & Auto Base Month</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40">
                Base Month Auto-Fetched
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">DGCA Approval Issue Date *</label>
                <input
                  type="date"
                  required
                  value={approvalIssueDate}
                  onChange={(e) => handleApprovalDateChange(e.target.value)}
                  className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-skyline-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">Base Month (Auto-Extracted)</label>
                <div className="w-full bg-slate-100 dark:bg-aviation-950/80 border border-skyline-300 dark:border-skyline-500/40 rounded-xl px-3 py-2 text-xs text-skyline-700 dark:text-skyline-300 font-mono font-bold flex items-center justify-between">
                  <span>{baseMonth}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Month {MONTH_MAP[baseMonth]?.num}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">5-Yr Expiry Date</label>
                <input
                  type="text"
                  readOnly
                  value={approvalExpiryDate}
                  className="w-full bg-slate-100 dark:bg-aviation-950/60 border border-slate-200 dark:border-aviation-800 rounded-xl px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-aviation-800/40 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">3-Month Grace Window Opens:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">{recurrentWindowStart}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Annual Recurrent Check Due:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{recurrentExpiry}</span>
              </div>
            </div>
          </div>

          {/* Row 4: Multi-Fleet Endorsements & Role Authorisations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-skyline-500 dark:text-skyline-400" />
                <label className="text-xs font-mono font-semibold text-slate-800 dark:text-white">
                  Multi-Fleet & Multi-Role Endorsements Table
                </label>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {qualificationsList.length} Endorsement(s) Configured
              </span>
            </div>

            {/* List of configured qualifications */}
            <div className="space-y-2">
              {qualificationsList.map((qual, idx) => (
                <div
                  key={qual.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-skyline-100 dark:bg-skyline-500/20 text-skyline-800 dark:text-skyline-300 font-bold border border-skyline-200 dark:border-skyline-500/30">
                      {qual.fleet_code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-bold">
                      {qual.role}
                    </span>
                    <div>
                      <div className="text-slate-900 dark:text-white font-semibold">{qual.approval_number}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Issued: {qual.approval_issue_date} • 5-Yr Exp: {qual.approval_expiry_date} • Base Month: {qual.base_month}
                      </div>
                    </div>
                  </div>

                  {qualificationsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(qual.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Extra Endorsement Sub-form */}
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-aviation-900/40 border border-dashed border-slate-300 dark:border-aviation-800 space-y-3">
              <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-skyline-500" />
                <span>Add Additional Fleet Endorsement (e.g. B737, ATR 72, GI Tech/Perf)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500">Fleet Type</label>
                  <select
                    value={newQualFleet}
                    onChange={(e) => setNewQualFleet(e.target.value)}
                    className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  >
                    <option value="A320">Airbus A320</option>
                    <option value="B737">Boeing 737</option>
                    <option value="ATR 72-600">ATR 72-600</option>
                    <option value="Q400">DHC-8 Q400</option>
                    <option value="ALL_FLEETS">All Fleets (GI)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500">Role / Scope</label>
                  <select
                    value={newQualRole}
                    onChange={(e) => setNewQualRole(e.target.value as InstructorRole)}
                    className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  >
                    <option value="SFI">SFI (Simulator)</option>
                    <option value="SFE">SFE (Examiner)</option>
                    <option value="GI_TECH">GI (Technical)</option>
                    <option value="GI_PERF">GI (Performance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500">Approval Number</label>
                  <input
                    type="text"
                    value={newQualApprovalNo}
                    onChange={(e) => setNewQualApprovalNo(e.target.value)}
                    className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500">Approval Date</label>
                  <input
                    type="date"
                    value={newQualIssueDate}
                    onChange={(e) => setNewQualIssueDate(e.target.value)}
                    className="w-full bg-white dark:bg-aviation-950 border border-slate-200 dark:border-aviation-800 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="px-3 py-1.5 rounded-xl bg-skyline-100 dark:bg-skyline-500/20 text-skyline-700 dark:text-skyline-300 hover:bg-skyline-200 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Endorsement to Profile
                </button>
              </div>
            </div>
          </div>

          {/* Row 5: Employment & Recurrent Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Employment Status
              </label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-skyline-500"
              >
                <option value="ACTIVE">ACTIVE (On Roster)</option>
                <option value="ON_LEAVE">ON LEAVE (Duty Paused)</option>
                <option value="RESIGNED">RESIGNED / ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Recurrent Check Status
              </label>
              <select
                value={recurrentStatus}
                onChange={(e) => setRecurrentStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-aviation-900 border border-slate-200 dark:border-aviation-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-skyline-500"
              >
                <option value="VALID">VALID (Standard privileges)</option>
                <option value="EXPIRING">EXPIRING (Inside 3-Mo Window)</option>
                <option value="REFRESHER_REQUIRED">REFRESHER REQUIRED (Locked)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-aviation-800">
            <button
              type="button"
              onClick={() => setIsAddInstructorModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-aviation-900 dark:hover:bg-aviation-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-skyline-500 to-indigo-600 hover:from-skyline-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
            >
              Register & Authorise Instructor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

