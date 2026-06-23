import React, { useMemo } from 'react';
import { Student, Simulator, User } from '../types';
import { ShieldCheck, ShieldAlert, Award, FileText, Check, AlertCircle } from 'lucide-react';

interface ComplianceViewProps {
  students: Student[];
  simulators: Simulator[];
  currentUser: User;
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ students, simulators, currentUser }) => {
  
  // Continuous scanning logic
  const findings = useMemo(() => {
    const list: { id: string; target: string; rule: string; citation: string; status: 'FAIL' | 'PASS'; details: string }[] = [];
    
    // Rule 1: Student Medical Expiry (DGCA CAR Section 7)
    students.forEach(s => {
      const medDoc = s.documents.find(d => d.type === 'MEDICAL');
      if (medDoc) {
        const isExpired = new Date(medDoc.expiryDate) < new Date('2026-06-21');
        list.push({
          id: `rule-med-${s.id}`,
          target: `Cadet: ${s.name} (${s.employeeNo})`,
          rule: `Valid Class 1 Medical Certificate Required`,
          citation: `DGCA CAR Section 7 Series C`,
          status: isExpired ? 'FAIL' : 'PASS',
          details: isExpired 
            ? `Medical certificate expired on ${medDoc.expiryDate}. Cadet placed on Training Hold.` 
            : `Valid. Expiry date: ${medDoc.expiryDate}`
        });
      }
    });

    // Rule 2: Simulator Qualification Validity (EASA Part-ORA.FSTD)
    simulators.forEach(sim => {
      const isLapsed = sim.status === 'AOG';
      list.push({
        id: `rule-sim-${sim.id}`,
        target: `FSTD: ${sim.name}`,
        rule: `Annual Device Calibration & Qualification Authority Validation`,
        citation: `EASA Part-ORA.FSTD.120`,
        status: isLapsed ? 'FAIL' : 'PASS',
        details: isLapsed 
          ? `Device status marked AOG/Unserviceable. hand-off checks are blocked.` 
          : `Device metrics verified. Current reliability rating ${sim.metrics.reliability}%.`
      });
    });

    return list;
  }, [students, simulators]);

  const failCount = findings.filter(f => f.status === 'FAIL').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Compliance Monitoring Engine</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">DGCA CAR / EASA Part-FCL continuous validation rules</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[9px] font-black uppercase text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" /> Live Scan Active
          </span>
          {failCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[9px] font-black uppercase text-rose-700">
              <ShieldAlert className="w-3.5 h-3.5" /> {failCount} Deviations
            </span>
          )}
        </div>
      </div>

      {/* Rules list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Continuous Audit Findings</h3>
        </div>
        
        <div className="divide-y divide-slate-100 text-xs">
          {findings.map(f => (
            <div key={f.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/40 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                    f.status === 'FAIL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {f.status}
                  </span>
                  <span className="font-bold text-slate-800">{f.rule}</span>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold">{f.target}</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{f.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider font-mono">
                  <FileText className="w-3 h-3 text-slate-400" /> {f.citation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceView;
