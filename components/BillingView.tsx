import React, { useState, useMemo } from 'react';
import { TrainingSession, Invoice, RateCard, User, UserRole, SessionStatus } from '../types';
import { MOCK_RATE_CARDS, MOCK_INVOICES } from '../constants';
import { DollarSign, FileText, CheckCircle, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

interface BillingViewProps {
  sessions: TrainingSession[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({
  sessions,
  invoices,
  setInvoices,
  currentUser,
  onLogAudit
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'rates' | 'pipeline'>('invoices');

  // Compute live billing pipeline (unbilled completed sessions)
  const pipelineItems = useMemo(() => {
    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);
    
    // Map completed sessions to billing draft line items
    return completedSessions.map(session => {
      const rateCard = MOCK_RATE_CARDS.find(rc => rc.customerId === session.customer) || { ratePerSimHour: 450 };
      const hours = Math.round((session.metrics.utilizedTime / 60) * 10) / 10 || 4; // fallback to 4h
      const total = Math.round(hours * rateCard.ratePerSimHour);
      
      return {
        sessionId: session.id,
        logSerialNo: session.logSerialNo,
        customer: session.customer,
        date: new Date(parseInt(session.id.split('-')[1]) || Date.now()).toLocaleDateString(),
        hours,
        rate: rateCard.ratePerSimHour,
        total
      };
    });
  }, [sessions]);

  const handleFinalizeInvoice = (invId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invId) return inv;
      onLogAudit('BILLING_FINALIZE', `Finalized invoice ${inv.invoiceNumber}`);
      return { ...inv, status: 'FINALIZED' };
    }));
    alert("Invoice status set to FINALIZED. Exporting to client ERP interface...");
  };

  const handleResolveDispute = (invId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invId) return inv;
      onLogAudit('DISPUTE_RESOLVE', `Resolved dispute for invoice ${inv.invoiceNumber}`);
      return { ...inv, status: 'FINALIZED', disputeNotes: undefined };
    }));
    alert("Dispute cleared. Invoice re-archived to nominal pipeline.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Billing & Commercial Management</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">Usage-to-Invoice pipelines and rate card matrices</p>
        </div>
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1 shrink-0">
          <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Invoices</button>
          <button onClick={() => setActiveTab('rates')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'rates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Rate Cards</button>
          <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Unbilled ({pipelineItems.length})</button>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Invoice Number</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Customer Name</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Billing Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center font-bold text-slate-400">No invoices archived</td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{inv.customerName}</td>
                      <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                      <td className="px-6 py-4 font-black text-slate-900">${inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-black uppercase border ${
                          inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          inv.status === 'DISPUTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.disputeNotes && (
                          <p className="text-[9px] text-rose-600 font-bold mt-1 bg-rose-50 p-1 rounded">
                            Disputed: "{inv.disputeNotes}"
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => handleFinalizeInvoice(inv.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Finalize Invoice
                          </button>
                        )}
                        {inv.status === 'DISPUTED' && (
                          <button
                            onClick={() => handleResolveDispute(inv.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Resolve Dispute
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Customer / Client</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Sim Rental Rate / Hour</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Classroom Rate / Hour</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Flat Rating Option</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {MOCK_RATE_CARDS.map(rc => (
                  <tr key={rc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{rc.customerId}</td>
                    <td className="px-6 py-4 font-black text-slate-700">${rc.ratePerSimHour} / hr</td>
                    <td className="px-6 py-4 font-black text-slate-700">${rc.ratePerClassroomHour} / hr</td>
                    <td className="px-6 py-4 text-right font-black text-slate-500">${rc.ratePerCourseFlat} / course</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Log Sheet No</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Hand-off Date</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Utilized Hours</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Rate Applied</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Draft Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pipelineItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center font-bold text-slate-400">All completed sessions have been invoiced.</td>
                  </tr>
                ) : (
                  pipelineItems.map(item => (
                    <tr key={item.sessionId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-red-600">{item.logSerialNo}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.customer}</td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-slate-700 font-bold">{item.hours} hrs</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">${item.rate} / hr</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">${item.total.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
