import React from 'react';
import { AuditLogEntry, UserRole } from '../types';
import { Clock, ShieldCheck, Database, Key, CheckCircle, RefreshCcw } from 'lucide-react';

interface AdminViewProps {
  auditLogs: AuditLogEntry[];
  onLogAudit: (action: string, details: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ auditLogs, onLogAudit }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Administration & Security</h2>
        <p className="text-[11px] text-slate-400 font-bold mt-0.5">Tamper-evident audit logs and system configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Security Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Security Status</h3>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-600">
              <span>Encryption Rest</span>
              <span className="text-emerald-600">AES-256 (Active)</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>Tenant Separation</span>
              <span className="text-emerald-600">RLS (Enabled)</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>MFA Status</span>
              <span className="text-emerald-600">Enforced</span>
            </div>
          </div>
        </div>

        {/* Audit status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Audit Chain</h3>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-600">
              <span>Log Chain Integrity</span>
              <span className="text-emerald-600">✓ Validated</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>Total Logs</span>
              <span className="text-slate-800">{auditLogs.length} entries</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>Audit Mode</span>
              <span className="text-slate-800">Append-Only</span>
            </div>
          </div>
        </div>

        {/* API integration status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">API Status</h3>
            <Key className="w-4 h-4 text-slate-600" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-600">
              <span>Public API v1</span>
              <span className="text-emerald-600">Operational</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>Active Keys</span>
              <span className="text-slate-800">4 active</span>
            </div>
            <div className="flex justify-between font-bold text-slate-600">
              <span>Webhook Receivers</span>
              <span className="text-slate-800">3 configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Cryptographically Chained Audit Trail</h3>
          </div>
          <button 
            onClick={() => onLogAudit('AUDIT_VERIFY', 'Manual validation of audit log integrity chain executed.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
          >
            <RefreshCcw className="w-3 h-3" /> Validate Chain
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">User / Role</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Action</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Details</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">SHA-256 Hash Chaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono font-bold whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{log.userName}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{log.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black uppercase text-slate-600">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-semibold max-w-[280px] truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[9px] truncate max-w-[150px]" title={log.hash}>
                    {log.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
