import React, { useMemo } from 'react';
import { Simulator, TrainingSession, Student, Batch, Invoice, User, UserRole, SimulatorStatus } from '../types';
import { 
  Users, Layers, Calendar, Zap, AlertTriangle, ShieldCheck, 
  Clock, DollarSign, TrendingUp, AlertCircle, Wrench, ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  simulators: Simulator[];
  sessions: TrainingSession[];
  students: Student[];
  batches: Batch[];
  invoices: Invoice[];
  currentUser: User;
  onNavigateToView: (viewName: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  simulators,
  sessions,
  students,
  batches,
  invoices,
  currentUser,
  onNavigateToView
}) => {
  // Compute numbers
  const counts = useMemo(() => {
    const activeStuds = students.filter(s => s.status === 'ACTIVE').length;
    const holdStuds = students.filter(s => s.status === 'HOLD').length;
    const activeBatches = batches.filter(b => b.status === 'ACTIVE').length;
    const serviceSims = simulators.filter(s => s.status === SimulatorStatus.SERVICEABLE).length;
    
    // Revenue from finalized/paid invoices
    const revenue = invoices
      .filter(inv => inv.status === 'FINALIZED' || inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Simulator utilization (mocked rolling 30-day target vs actual)
    const totalSimHours = simulators.reduce((sum, s) => sum + s.totalHours, 0);
    const avgReliability = simulators.length > 0 
      ? Math.round(simulators.reduce((sum, s) => sum + s.metrics.reliability, 0) / simulators.length * 10) / 10
      : 0;

    return { activeStuds, holdStuds, activeBatches, serviceSims, revenue, totalSimHours, avgReliability };
  }, [students, batches, simulators, invoices]);

  // Compute Alerts
  const alerts = useMemo(() => {
    const list: { id: string; type: 'warning' | 'danger' | 'info'; title: string; desc: string; link: string }[] = [];
    
    // 1. Check for students on HOLD
    students.forEach(s => {
      if (s.status === 'HOLD') {
        const expiredDoc = s.documents.find(d => new Date(d.expiryDate) < new Date('2026-06-21'));
        list.push({
          id: `alert-hold-${s.id}`,
          type: 'danger',
          title: `Training Hold: ${s.name}`,
          desc: expiredDoc 
            ? `${expiredDoc.type} (${expiredDoc.name}) expired on ${expiredDoc.expiryDate}.`
            : `Regulatory documents pending verification.`,
          link: 'students'
        });
      }
    });

    // 2. Check for AOG simulators
    simulators.forEach(sim => {
      if (sim.status === SimulatorStatus.AOG) {
        list.push({
          id: `alert-sim-${sim.id}`,
          type: 'danger',
          title: `AOG Alert: ${sim.name}`,
          desc: `Technical breakdown reported. Scheduled sessions are currently blocked.`,
          link: 'dashboard'
        });
      } else if (sim.status === SimulatorStatus.MAINTENANCE) {
        list.push({
          id: `alert-sim-maint-${sim.id}`,
          type: 'warning',
          title: `Maintenance Mode: ${sim.name}`,
          desc: `Undergoing scheduled preventative calibration checks.`,
          link: 'dashboard'
        });
      }
    });

    // 3. Check for pending invoice disputes
    invoices.forEach(inv => {
      if (inv.status === 'DISPUTED') {
        list.push({
          id: `alert-inv-${inv.id}`,
          type: 'warning',
          title: `Disputed Invoice: ${inv.invoiceNumber}`,
          desc: `Client disputed line items. Dispute notes: "${inv.disputeNotes || 'No notes'}"`,
          link: 'billing'
        });
      }
    });

    return list;
  }, [students, simulators, invoices]);

  // Roles access check for billing info
  const showBilling = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.OPERATIONS || currentUser.role === UserRole.QUALITY_MANAGER;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl">
        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-red-600/10 group-hover:scale-150 transition-all duration-700" />
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">System Command Center</span>
          <h2 className="text-3xl font-black tracking-tight">Welcome Back, {currentUser.name}</h2>
          <p className="text-slate-400 text-xs font-semibold max-w-xl">
            You are logged in under the <span className="text-white font-bold">{currentUser.role}</span> operational profile for <span className="text-white font-bold">{currentUser.facility}</span> facility. 
            Regulatory compliance checking is fully active.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Students */}
        <div onClick={() => onNavigateToView('students')} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-slate-50 group-hover:scale-150 transition-all duration-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Cadets</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{counts.activeStuds}</span>
            {counts.holdStuds > 0 && (
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {counts.holdStuds} Hold
              </span>
            )}
          </div>
          <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider flex items-center gap-1">
            Manage Trainees <ChevronRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* Active Batches */}
        <div onClick={() => onNavigateToView('batches')} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-slate-50 group-hover:scale-150 transition-all duration-500 flex items-center justify-center">
            <Layers className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Batches</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{counts.activeBatches}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider flex items-center gap-1">
            View Training Batches <ChevronRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* Sim Serviceability */}
        <div onClick={() => onNavigateToView('dashboard')} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-slate-50 group-hover:scale-150 transition-all duration-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Sim Serviceability</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{counts.serviceSims}/{simulators.length}</span>
            <span className="text-[9px] text-emerald-600 font-black uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {counts.avgReliability}% Rel.
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider flex items-center gap-1">
            FSTD Fleet Status <ChevronRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* Billing Revenue / Operational Hours */}
        <div onClick={() => onNavigateToView(showBilling ? 'billing' : 'dashboard')} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-slate-50 group-hover:scale-150 transition-all duration-500 flex items-center justify-center">
            {showBilling ? (
              <DollarSign className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
            ) : (
              <Clock className="w-6 h-6 text-slate-300 group-hover:text-red-500 transition-colors" />
            )}
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {showBilling ? 'Rolling Revenue' : 'Fleet Total Hours'}
          </p>
          <div className="flex items-baseline gap-2">
            {showBilling ? (
              <span className="text-3xl font-black text-slate-900 tracking-tight">${counts.revenue.toLocaleString()}</span>
            ) : (
              <span className="text-3xl font-black text-slate-900 tracking-tight">{counts.totalSimHours.toLocaleString()}h</span>
            )}
            <span className="text-[9px] text-indigo-600 font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {showBilling ? 'Billed' : 'Logged'}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-wider flex items-center gap-1">
            {showBilling ? 'Open Invoices' : 'Operational Status'} <ChevronRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>
      </div>

      {/* Main dashboard content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Alerts & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Regulatory Alerts & Notifications</h3>
              </div>
              <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                {alerts.length} Pending
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 text-emerald-500">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Compliance Clear</p>
                  <p className="text-slate-300 text-[11px]">All devices and cadet documents are within valid date margins.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="mt-0.5">
                      {alert.type === 'danger' ? (
                        <span className="flex w-3.5 h-3.5 rounded-full bg-red-100 border border-red-400 items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        </span>
                      ) : (
                        <span className="flex w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-400 items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-black text-slate-800 text-xs leading-none">{alert.title}</p>
                      <p className="text-[11px] text-slate-400 font-bold">{alert.desc}</p>
                    </div>
                    <button 
                      onClick={() => onNavigateToView(alert.link)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button onClick={() => onNavigateToView('dashboard')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <Wrench className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">FSTD Releases</span>
              </button>
              <button onClick={() => onNavigateToView('students')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <Users className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">Trainee Docs</span>
              </button>
              <button onClick={() => onNavigateToView('exams')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <Calendar className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">Exams Engine</span>
              </button>
              <button onClick={() => onNavigateToView('compliance')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <ShieldCheck className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">Rule Engine</span>
              </button>
              <button onClick={() => onNavigateToView('ai-assistant')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <Zap className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">AI Query Desk</span>
              </button>
              <button onClick={() => onNavigateToView('admin')} className="flex flex-col p-4 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-2xl items-center text-center transition-all group">
                <Clock className="w-5 h-5 text-slate-500 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-wide">Audit Trail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Reliability Status / Recent Sessions */}
        <div className="space-y-6">
          {/* Simulator Fleet Health */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Simulator Health</h3>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="space-y-3.5">
              {simulators.map(sim => (
                <div key={sim.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate max-w-[150px]">{sim.name}</span>
                    <span className={sim.status === SimulatorStatus.SERVICEABLE ? 'text-emerald-600' : sim.status === SimulatorStatus.AOG ? 'text-red-600' : 'text-amber-500'}>
                      {sim.metrics.reliability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        sim.status === SimulatorStatus.SERVICEABLE 
                          ? 'bg-emerald-500' 
                          : sim.status === SimulatorStatus.AOG 
                          ? 'bg-rose-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${sim.metrics.reliability}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 text-white space-y-5 shadow-lg">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Operation Ratios</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Sim Utilization</span>
                <span className="text-xl font-black italic text-emerald-400">89.2%</span>
                <span className="block text-[8px] text-slate-600 font-bold uppercase">Target: &gt;85%</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Instructor Usage</span>
                <span className="text-xl font-black italic text-emerald-400">82.4%</span>
                <span className="block text-[8px] text-slate-600 font-bold uppercase">Target: &gt;80%</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Exams Pass Rate</span>
                <span className="text-xl font-black italic text-red-500">94.8%</span>
                <span className="block text-[8px] text-slate-600 font-bold uppercase">Target: &gt;90%</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Schedule adherence</span>
                <span className="text-xl font-black italic text-emerald-400">99.1%</span>
                <span className="block text-[8px] text-slate-600 font-bold uppercase">Target: &gt;99%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
