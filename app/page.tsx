"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, UserRole, Simulator, SimulatorStatus, TrainingSession, 
  SessionStatus, Severity, Snag, Course, Subject, Classroom, Batch, Invoice, AuditLogEntry, Student
} from '../types';
import { 
  LayoutDashboard, Users, AlertTriangle, ChevronRight,
  ShieldCheck, Wrench, Menu, X, FileText, MapPin, CheckCircle2,
  Activity, Settings, RotateCcw, HelpCircle, Download, Printer, 
  TrendingUp, Zap, Clock, AlertCircle, Layers, Award, DollarSign, Cpu
} from 'lucide-react';

import SignaturePad from '../components/SignaturePad';
import SimulatorCard from '../components/SimulatorCard';

// New Views
import DashboardView from '../components/DashboardView';
import MastersView from '../components/MastersView';
import StudentsView from '../components/StudentsView';
import BatchesView from '../components/BatchesView';
import LmsView from '../components/LmsView';
import ExamsView from '../components/ExamsView';
import ComplianceView from '../components/ComplianceView';
import BillingView from '../components/BillingView';
import AiAssistantView from '../components/AiAssistantView';
import AdminView from '../components/AdminView';
import FutureHubView from '../components/FutureHubView';

// Constants
import { 
  TRAINING_TYPES, MOCK_COURSES, MOCK_SUBJECTS, MOCK_CLASSROOMS, 
  MOCK_STUDENTS, MOCK_BATCHES, MOCK_INVOICES, MOCK_AUDIT_TRAIL,
  MOCK_LMS_CONTENTS, MOCK_RATE_CARDS
} from '../constants';

const FACILITIES = ['Sector Alpha', 'Sector Beta', 'Sector Gamma', 'Sector Delta'];

const MOCK_SIMULATORS: Simulator[] = [
  { id: 'sim-1', facility: 'Sector Alpha', name: 'FFS-B737-MAX-01', model: 'B737-MAX', serialNumber: 'AVI-737-01', engineType: 'LEAP-1B', status: SimulatorStatus.SERVICEABLE, totalHours: 14200, metrics: { reliability: 98.9 } },
  { id: 'sim-2', facility: 'Sector Alpha', name: 'FFS-A320-NEO-02', model: 'A320-NEO', serialNumber: 'AVI-320-02', engineType: 'PW1100G', status: SimulatorStatus.SERVICEABLE, totalHours: 9150, metrics: { reliability: 97.4 } },
  { id: 'sim-3', facility: 'Sector Beta', name: 'FFS-ATR72-03', model: 'ATR 72-600', serialNumber: 'AVI-72-09', engineType: 'PW127M', status: SimulatorStatus.MAINTENANCE, totalHours: 5400, metrics: { reliability: 99.1 } },
  { id: 'sim-4', facility: 'Sector Alpha', name: 'FFS-B737-800-04', model: 'B737-800', serialNumber: 'AVI-737-08', engineType: 'CFM56', status: SimulatorStatus.AOG, totalHours: 2100, metrics: { reliability: 94.2 } },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5 px-1">
    {children}
  </label>
);

const Field = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`space-y-1 ${className}`}>{children}</div>
);

const SeverityBadge = ({ severity }: { severity: Severity | string }) => {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${map[severity] || map.LOW}`}>
      {severity}
    </span>
  );
};

const inputCls = "w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all placeholder:text-slate-300";
const selectCls = "w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";
const textareaCls = "w-full px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-28 resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all text-[13px] font-semibold text-slate-800 placeholder:text-slate-300";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeFacility, setActiveFacility] = useState('Sector Alpha');
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Platform Datastore
  const [simulators, setSimulators] = useState<Simulator[]>(MOCK_SIMULATORS);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [breakdownHistory, setBreakdownHistory] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(MOCK_CLASSROOMS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_TRAIL);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Logs filters
  const [logFilterFromDate, setLogFilterFromDate] = useState('');
  const [logFilterToDate, setLogFilterToDate] = useState('');
  const [logFilterFacility, setLogFilterFacility] = useState('All Facilities');
  
  // Workflow State
  const [workflow, setWorkflow] = useState<{ 
    type: 'offer' | 'customer-in' | 'customer-out' | 'log' | 'breakdown' | 'recovery' | 'snag-entry' | null, 
    data: any 
  }>({ type: null, data: null });

  // Controlled form state
  const [formData, setFormData] = useState<{
    logSheetNo: string;
    trainingType: string;
    typeOfCheck: string;
    sessionType: 'Standard' | 'Demo' | 'Billable' | 'Split';
    fromTime: string;
    toTime: string;
    customer: string;
    instructor: string;
    engineerSignature: string;
    simStatus: string;
    crewStatus: string;
    startTime: string;
    crewMembers: string[];
    customerInSignature: string;
    endTime: string;
    utilizedTime: number;
    downTime: number;
    breakTime: number;
    effectiveness: string;
    customerOutSignature: string;
    raisedSnagDescription: string;
    raisedSnagSeverity: string;
    raisedSnagsList: any[];
    breakdownReason: string;
    drNumber: string;
    recoveryResolution: string;
    snagResolutionNotes: string;
    selectedSnagId: string;
  }>({
    logSheetNo: '',
    trainingType: 'FSTD',
    typeOfCheck: 'Line Training',
    sessionType: 'Standard',
    fromTime: '09:00',
    toTime: '13:00',
    customer: 'Air India Express Limited',
    instructor: 'Capt. Robert Vance',
    engineerSignature: '',
    simStatus: 'Serviceable',
    crewStatus: 'Present',
    startTime: '09:00',
    crewMembers: [],
    customerInSignature: '',
    endTime: '13:00',
    utilizedTime: 240,
    downTime: 0,
    breakTime: 0,
    effectiveness: '4-Good',
    customerOutSignature: '',
    raisedSnagDescription: '',
    raisedSnagSeverity: 'LOW',
    raisedSnagsList: [],
    breakdownReason: '',
    drNumber: '',
    recoveryResolution: '',
    snagResolutionNotes: '',
    selectedSnagId: ''
  });

  // ── LocalStorage Persistence ───────────────────────────────────────────
  useEffect(() => {
    const cachedSims = localStorage.getItem('atms_simulators_v3');
    const cachedSessions = localStorage.getItem('atms_sessions_v3');
    const cachedBreakdown = localStorage.getItem('atms_breakdown_history_v3');
    const cachedStudents = localStorage.getItem('atms_students_v3');
    const cachedBatches = localStorage.getItem('atms_batches_v3');
    const cachedInvoices = localStorage.getItem('atms_invoices_v3');
    const cachedAudit = localStorage.getItem('atms_audit_logs_v3');

    if (cachedSims) setSimulators(JSON.parse(cachedSims));
    if (cachedSessions) setSessions(JSON.parse(cachedSessions));
    if (cachedBreakdown) setBreakdownHistory(JSON.parse(cachedBreakdown));
    if (cachedStudents) setStudents(JSON.parse(cachedStudents));
    if (cachedBatches) setBatches(JSON.parse(cachedBatches));
    if (cachedInvoices) setInvoices(JSON.parse(cachedInvoices));
    if (cachedAudit) setAuditLogs(JSON.parse(cachedAudit));
  }, []);

  useEffect(() => { localStorage.setItem('atms_simulators_v3', JSON.stringify(simulators)); }, [simulators]);
  useEffect(() => { localStorage.setItem('atms_sessions_v3', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('atms_breakdown_history_v3', JSON.stringify(breakdownHistory)); }, [breakdownHistory]);
  useEffect(() => { localStorage.setItem('atms_students_v3', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('atms_batches_v3', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('atms_invoices_v3', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('atms_audit_logs_v3', JSON.stringify(auditLogs)); }, [auditLogs]);

  // ── Audit Logging Helper ───────────────────────────────────────────────
  const handleLogAudit = (action: string, details: string) => {
    const mockHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser?.id || 'sys-0',
      userName: currentUser?.name || 'System Engine',
      role: currentUser?.role || UserRole.ADMIN,
      action,
      details,
      hash: mockHash
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ── Workflow Helpers ───────────────────────────────────────────────────
  const startWorkflow = (type: typeof workflow.type, data: any) => {
    const initialData = { ...formData };
    if (type === 'offer') {
      initialData.logSheetNo = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
      initialData.trainingType = 'FSTD';
      initialData.typeOfCheck = 'Line Training';
      initialData.sessionType = 'Standard';
      initialData.fromTime = '09:00';
      initialData.toTime = '13:00';
      initialData.customer = 'Air India Express Limited';
      initialData.instructor = 'Capt. Robert Vance';
      initialData.engineerSignature = '';
      initialData.simStatus = 'Serviceable';
    } else if (type === 'customer-in') {
      initialData.crewStatus = 'Present';
      initialData.startTime = data.scheduledFrom || '09:00';
      initialData.trainingType = data.trainingType || 'FSTD';
      initialData.sessionType = data.sessionType || 'Standard';
      initialData.crewMembers = data.crew?.members?.length > 0 ? data.crew.members : [];
      initialData.customerInSignature = '';
    } else if (type === 'customer-out') {
      initialData.endTime = data.scheduledTo || '13:00';
      initialData.utilizedTime = 240;
      initialData.downTime = 0;
      initialData.breakTime = 0;
      initialData.effectiveness = '4-Good';
      initialData.customerOutSignature = '';
      initialData.raisedSnagDescription = '';
      initialData.raisedSnagSeverity = 'LOW';
      initialData.raisedSnagsList = [];
    } else if (type === 'breakdown') {
      initialData.breakdownReason = '';
    } else if (type === 'recovery') {
      initialData.drNumber = `DR-${Math.floor(100 + Math.random() * 900)}`;
      initialData.recoveryResolution = '';
    } else if (type === 'snag-entry') {
      initialData.snagResolutionNotes = '';
      initialData.selectedSnagId = data.id;
    }
    setFormData(initialData);
    setWorkflow({ type, data });
  };

  const closeWorkflow = () => setWorkflow({ type: null, data: null });

  // ── Computed ───────────────────────────────────────────────────────────
  const filteredSims = useMemo(() => simulators.filter(s => s.facility === activeFacility), [simulators, activeFacility]);
  
  const allSnags = useMemo(() => sessions.flatMap(session =>
    session.snags.map(snag => ({
      ...snag,
      sessionId: session.id,
      customer: session.customer,
      simulatorName: simulators.find(sim => sim.id === session.simulatorId)?.name
    }))
  ), [sessions, simulators]);

  const filteredCompletedSessions = useMemo(() => {
    return sessions.filter(s => {
      if (s.status !== SessionStatus.COMPLETED) return false;
      const sim = simulators.find(sim => sim.id === s.simulatorId);
      if (!sim) return false;
      if (logFilterFacility !== 'All Facilities' && sim.facility !== logFilterFacility) return false;
      const parts = s.id.split('-');
      const timestamp = parseInt(parts[1]);
      const sessionDate = new Date(isNaN(timestamp) ? Date.now() : timestamp);
      if (logFilterFromDate) { const from = new Date(logFilterFromDate); from.setHours(0,0,0,0); if (sessionDate < from) return false; }
      if (logFilterToDate) { const to = new Date(logFilterToDate); to.setHours(23,59,59,999); if (sessionDate > to) return false; }
      return true;
    });
  }, [sessions, simulators, logFilterFromDate, logFilterToDate, logFilterFacility]);

  const metrics = useMemo(() => ({
    serviceability: simulators.length > 0 ? Math.round((simulators.filter(s => s.status === SimulatorStatus.SERVICEABLE).length / simulators.length) * 100) : 0,
    activeSnags: allSnags.filter(s => !s.isResolved).length,
    totalSessions: sessions.length,
    totalHours: simulators.reduce((acc, s) => acc + s.totalHours, 0),
  }), [simulators, allSnags, sessions]);

  // ── Action Handlers ───────────────────────────────────────────────────
  const handleOfferConfirm = () => {
    const sim = workflow.data as Simulator;
    if (!formData.engineerSignature) { alert("Please draw the Engineer's Digital Signature to release this simulator."); return; }
    if (!formData.logSheetNo) { alert("Log Sheet No is required."); return; }
    const newSession: TrainingSession = {
      id: `SESS-${Date.now()}`,
      bookingId: `BK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      logSerialNo: formData.logSheetNo,
      simulatorId: sim.id,
      customer: formData.customer || 'Air India Limited',
      trainingType: formData.typeOfCheck || formData.trainingType || 'FSTD',
      sessionType: formData.sessionType || 'Standard',
      scheduledFrom: formData.fromTime || '09:00',
      scheduledTo: formData.toTime || '13:00',
      status: SessionStatus.OFFERED,
      instructor: formData.instructor || 'RAINISH BHALLA',
      crew: { reporting: 'Present', members: [] },
      metrics: { breakTime: 0, utilizedTime: 0, downTime: 0 },
      effectiveness: '',
      snags: [],
      signatures: { engineer: formData.engineerSignature },
      engineerName: currentUser?.name || 'Duty Engineer'
    };
    setSessions(prev => [newSession, ...prev]);
    handleLogAudit('SIM_RELEASE', `Simulator hand-off released for simulator: ${sim.name}. Log Sheet: ${newSession.logSerialNo}`);
    if (formData.simStatus === 'Sim in Planned Maintenance') {
      setSimulators(prev => prev.map(s => s.id === sim.id ? { ...s, status: SimulatorStatus.MAINTENANCE } : s));
    } else if (formData.simStatus === 'Unserviceable') {
      setSimulators(prev => prev.map(s => s.id === sim.id ? { ...s, status: SimulatorStatus.UNSERVICEABLE } : s));
    }
    closeWorkflow();
  };

  const handleCustomerInConfirm = () => {
    const session = workflow.data as TrainingSession;
    if (!formData.customerInSignature) { alert("Please capture the Customer's Digital Signature."); return; }
    setSessions(prev => prev.map(s => s.id === session.id ? {
      ...s,
      status: SessionStatus.ACCEPTED,
      actualStart: formData.startTime,
      trainingType: formData.trainingType,
      sessionType: formData.sessionType as 'Standard' | 'Demo' | 'Billable' | 'Split',
      crew: { reporting: formData.crewStatus as 'Present' | 'Absent', members: formData.crewMembers },
      signatures: { ...s.signatures, customerIn: formData.customerInSignature }
    } : s));
    handleLogAudit('SESSION_ACCEPT', `Customer signed check-in verification for Log Sheet: ${session.logSerialNo}`);
    closeWorkflow();
  };

  const handleCustomerOutConfirm = () => {
    const session = workflow.data as TrainingSession;
    if (!formData.customerOutSignature) { alert("Please capture the Customer's Digital Signature to close the session."); return; }
    const newSnags: Snag[] = formData.raisedSnagsList.map((snag: any, idx: number) => ({
      id: `SNAG-${Date.now()}-${idx}`,
      title: `Snag reported during checkout`,
      description: snag.description,
      severity: snag.severity,
      reportedAt: new Date().toLocaleString(),
      isResolved: false
    }));
    setSessions(prev => prev.map(s => s.id === session.id ? {
      ...s,
      status: SessionStatus.COMPLETED,
      actualFinish: formData.endTime,
      metrics: { utilizedTime: Number(formData.utilizedTime) || 0, breakTime: Number(formData.breakTime) || 0, downTime: Number(formData.downTime) || 0 },
      effectiveness: formData.effectiveness,
      snags: newSnags,
      signatures: { ...s.signatures, customerOut: formData.customerOutSignature }
    } : s));
    
    // Auto-create Billing Line Item on session complete!
    const rateCard = MOCK_RATE_CARDS.find(rc => rc.customerId === session.customer) || { ratePerSimHour: 450 };
    const billableHours = Math.round((Number(formData.utilizedTime) / 60) * 10) / 10 || 4;
    const itemTotal = Math.round(billableHours * rateCard.ratePerSimHour);
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      customerId: 'cust-1',
      customerName: session.customer,
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      amount: itemTotal,
      status: 'DRAFT',
      items: [
        { id: `li-${Date.now()}`, description: `FSTD Sim Hand-off Rental - Log sheet ${session.logSerialNo}`, hours: billableHours, rate: rateCard.ratePerSimHour, total: itemTotal }
      ]
    };
    setInvoices(prev => [newInvoice, ...prev]);

    handleLogAudit('SESSION_COMPLETE', `Customer checked out session. Invoice draft generated: ${newInvoice.invoiceNumber}`);

    const hasSevereSnag = newSnags.some(snag => snag.severity === Severity.CRITICAL || snag.severity === Severity.HIGH);
    if (hasSevereSnag) {
      setSimulators(prev => prev.map(s => s.id === session.simulatorId ? { ...s, status: SimulatorStatus.AOG } : s));
      setBreakdownHistory(prev => [{
        id: `BD-${Date.now()}`, aogNo: `BD-${Math.floor(100 + Math.random() * 900)}`,
        simulatorId: session.simulatorId,
        simulatorName: simulators.find(sim => sim.id === session.simulatorId)?.name || 'FSTD',
        reason: `Critical Snag: ${newSnags.find(s => s.severity === Severity.CRITICAL || s.severity === Severity.HIGH)?.description}`,
        startTime: new Date().toLocaleString(), status: 'BREAKDOWN'
      }, ...prev]);
    }
    closeWorkflow();
  };

  const toggleBreakdown = (sim: Simulator) => {
    if (sim.status === SimulatorStatus.SERVICEABLE) startWorkflow('breakdown', sim);
    else if (sim.status === SimulatorStatus.AOG) startWorkflow('recovery', sim);
  };

  const handleBreakdownReport = () => {
    const sim = workflow.data as Simulator;
    if (!formData.breakdownReason.trim()) { alert("Breakdown reason is required."); return; }
    setBreakdownHistory(prev => [{
      id: `BD-${Date.now()}`, aogNo: `BD-${Math.floor(100 + Math.random() * 900)}`,
      simulatorId: sim.id, simulatorName: sim.name,
      reason: formData.breakdownReason, startTime: new Date().toLocaleString(), status: 'BREAKDOWN'
    }, ...prev]);
    setSimulators(prev => prev.map(s => s.id === sim.id ? { ...s, status: SimulatorStatus.AOG } : s));
    handleLogAudit('SIM_BREAKDOWN', `Technical Breakdown logged for simulator: ${sim.name}`);
    closeWorkflow();
  };

  const handleRecoveryReport = () => {
    const sim = workflow.data as Simulator;
    if (!formData.drNumber.trim()) { alert("DR Number is required."); return; }
    if (!formData.recoveryResolution.trim()) { alert("Resolution is required."); return; }
    setBreakdownHistory(prev => prev.map(entry =>
      (entry.simulatorId === sim.id && entry.status === 'BREAKDOWN')
        ? { ...entry, status: 'RECOVERED', recoveryTime: new Date().toLocaleString(), drNumber: formData.drNumber, resolution: formData.recoveryResolution }
        : entry
    ));
    setSimulators(prev => prev.map(s => s.id === sim.id ? { ...s, status: SimulatorStatus.SERVICEABLE } : s));
    handleLogAudit('SIM_RECOVERY', `FSTD Technical recovery completed for simulator: ${sim.name}. DR: ${formData.drNumber}`);
    closeWorkflow();
  };

  const handleResolveSnag = () => {
    if (!formData.snagResolutionNotes.trim()) { alert("Please input resolution notes."); return; }
    setSessions(prev => prev.map(session => {
      const snagIdx = session.snags.findIndex(s => s.id === formData.selectedSnagId);
      if (snagIdx === -1) return session;
      const updated = [...session.snags];
      updated[snagIdx] = { ...updated[snagIdx], isResolved: true, resolvedAt: new Date().toLocaleString(), resolvedBy: currentUser?.name || 'Duty Engineer', resolution: formData.snagResolutionNotes };
      return { ...session, snags: updated };
    }));
    handleLogAudit('SNAG_RESOLVE', `Snag resolved for ID ${formData.selectedSnagId}`);
    closeWorkflow();
    alert("Snag resolved successfully.");
  };

  const downloadHistoryCsv = () => {
    if (breakdownHistory.length === 0) { alert("No breakdown history to export."); return; }
    const headers = ["AOG Number", "Simulator", "Start Time", "Recovery Time", "Status", "Resolution", "DR Number"];
    const rows = breakdownHistory.map(entry => [entry.aogNo, entry.simulatorName, entry.startTime, entry.recoveryTime || 'N/A', entry.status, entry.resolution || 'N/A', entry.drNumber || 'N/A']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `breakdown_${activeFacility.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl shadow-2xl mb-4 rotate-3 hover:rotate-0 transition-all duration-500">
              <span className="text-white font-black text-3xl italic">A</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1.5">AVI ATMS PLATFORM</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Training Operations &amp; Compliance</p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 space-y-2.5 shadow-2xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-4 text-center">System Access Profile</p>
            
            <button
              onClick={() => setCurrentUser({ id: 'adm-0', name: 'System Admin', role: UserRole.ADMIN, facility: 'Sector Alpha' })}
              className="w-full group p-4 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 rounded-2xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-red-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xs">System Administrator</p>
                  <p className="text-[9px] text-slate-500 group-hover:text-red-200">Full Structural Control</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
            </button>

            <button
              onClick={() => setCurrentUser({ id: 'e1', name: 'Alex Mercer', role: UserRole.ENGINEER, facility: 'Sector Alpha' })}
              className="w-full group p-4 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 rounded-2xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-red-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xs">Simulator Engineer</p>
                  <p className="text-[9px] text-slate-500 group-hover:text-red-200">Hand-off Releases &amp; Snags</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
            </button>

            <button
              onClick={() => setCurrentUser({ id: 'c1', name: 'Chief Examiner', role: UserRole.INSTRUCTOR, facility: 'Sector Alpha' })}
              className="w-full group p-4 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 rounded-2xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 text-red-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xs">Customer Rep / Cadet</p>
                  <p className="text-[9px] text-slate-500 group-hover:text-red-200">Hand-off Handover Signatures</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DYNAMIC SIDEBAR FILTERING BASED ON RBAC ──
  const navItems = [
    { view: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.INSTRUCTOR, UserRole.OPERATIONS, UserRole.QUALITY_MANAGER] },
    { view: 'fstd-ops', label: 'FSTD Releases', icon: <Wrench className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATIONS] },
    { view: 'snags', label: 'Snag Log', icon: <AlertTriangle className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATIONS], badge: metrics.activeSnags },
    { view: 'breakdown-history', label: 'Breakdown Logs', icon: <RotateCcw className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATIONS] },
    { view: 'customer-verification', label: 'Customer Handover', icon: <ShieldCheck className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.OPERATIONS] },
    { view: 'masters', label: 'Master Data', icon: <Layers className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.OPERATIONS] },
    { view: 'students', label: 'Cadet Profiles', icon: <Users className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.QUALITY_MANAGER, UserRole.INSTRUCTOR] },
    { view: 'batches', label: 'Batches', icon: <Layers className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.OPERATIONS] },
    { view: 'learning', label: 'LMS Learning', icon: <Award className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT] },
    { view: 'exams', label: 'Exam Engine', icon: <HelpCircle className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.INSTRUCTOR] },
    { view: 'compliance', label: 'Rule Engine', icon: <ShieldCheck className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.QUALITY_MANAGER] },
    { view: 'billing', label: 'Invoices & Rates', icon: <DollarSign className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.OPERATIONS] },
    { view: 'ai-assistant', label: 'AI Assistant', icon: <Zap className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.QUALITY_MANAGER, UserRole.INSTRUCTOR] },
    { view: 'future-hub', label: 'Future Hub', icon: <Cpu className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.INSTRUCTOR, UserRole.OPERATIONS, UserRole.QUALITY_MANAGER] },
    { view: 'admin', label: 'Security & Audit', icon: <Clock className="w-4 h-4" />, roles: [UserRole.ADMIN] },
    { view: 'output', label: 'Output (Archive)', icon: <FileText className="w-4 h-4" />, roles: [UserRole.ADMIN, UserRole.ENGINEER, UserRole.INSTRUCTOR, UserRole.OPERATIONS] },
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* ── SIDEBAR ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative z-50 w-[272px] bg-slate-950 h-full flex flex-col transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-7 py-6 flex items-center gap-3.5 border-b border-white/[0.06]">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">A</div>
          <div className="min-w-0">
            <span className="text-white font-black tracking-tighter text-[15px] block leading-tight">AVI ATMS</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Operations Control</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 text-slate-600 hover:text-slate-300 lg:hidden transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => (
            <button
              key={item.view}
              onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all group ${
                activeView === item.view
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className={activeView === item.view ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${activeView === item.view ? 'bg-white/20 text-white' : 'bg-red-600 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User card */}
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 flex items-center justify-center text-red-400 text-xs font-black">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="w-full py-2 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-[68px] bg-white border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <select
                className="bg-transparent border-none text-[11px] font-black text-slate-700 outline-none uppercase tracking-widest cursor-pointer"
                value={activeFacility}
                onChange={e => setActiveFacility(e.target.value)}
              >
                {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                {simulators.filter(s => s.status === SimulatorStatus.SERVICEABLE).length} Active
              </span>
            </div>
            {metrics.activeSnags > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{metrics.activeSnags} Snag{metrics.activeSnags !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

            {/* ── NEW VIEWS ROUTER ── */}
            {activeView === 'dashboard' && (
              <DashboardView
                simulators={simulators}
                sessions={sessions}
                students={students}
                batches={batches}
                invoices={invoices}
                currentUser={currentUser}
                onNavigateToView={setActiveView}
              />
            )}

            {activeView === 'masters' && (
              <MastersView
                simulators={simulators}
                setSimulators={setSimulators}
                courses={courses}
                setCourses={setCourses}
                subjects={subjects}
                setSubjects={setSubjects}
                classrooms={classrooms}
                setClassrooms={setClassrooms}
                instructors={instructors}
                setInstructors={setInstructors}
                customers={customers}
                setCustomers={setCustomers}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'students' && (
              <StudentsView
                students={students}
                setStudents={setStudents}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'batches' && (
              <BatchesView
                batches={batches}
                setBatches={setBatches}
                courses={courses}
                students={students}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'learning' && (
              <LmsView
                students={students}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'exams' && (
              <ExamsView
                students={students}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'compliance' && (
              <ComplianceView
                students={students}
                simulators={simulators}
                currentUser={currentUser}
              />
            )}

            {activeView === 'future-hub' && (
              <FutureHubView
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'billing' && (
              <BillingView
                sessions={sessions}
                invoices={invoices}
                setInvoices={setInvoices}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'ai-assistant' && (
              <AiAssistantView
                students={students}
                simulators={simulators}
                invoices={invoices}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeView === 'admin' && (
              <AdminView
                auditLogs={auditLogs}
                onLogAudit={handleLogAudit}
              />
            )}

            {/* ── OLD VIEWS PRESERVED ── */}
            {activeView === 'fstd-ops' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">FSTD Hand-off Releases</h2>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{activeFacility} Operations Roster</p>
                  </div>
                </div>

                {filteredSims.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active devices</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredSims.map(sim => (
                      <div key={sim.id} className="relative group">
                        <SimulatorCard
                          simulator={sim}
                          onClick={() => sim.status === SimulatorStatus.SERVICEABLE && startWorkflow('offer', sim)}
                        />
                        <div className="absolute top-4 right-4 z-20">
                          <button
                            onClick={e => { e.stopPropagation(); toggleBreakdown(sim); }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm ${
                              sim.status === SimulatorStatus.SERVICEABLE
                                ? 'bg-white text-emerald-600 hover:bg-rose-600 hover:text-white border border-emerald-100'
                                : sim.status === SimulatorStatus.AOG
                                ? 'bg-rose-600 text-white hover:bg-emerald-600'
                                : 'bg-amber-100 text-amber-700 cursor-default'
                            }`}
                          >
                            {sim.status === SimulatorStatus.SERVICEABLE ? 'Running' :
                             sim.status === SimulatorStatus.AOG ? 'AOG' : 'Maint.'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'snags' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Snag Log Report</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">{allSnags.length} total • {metrics.activeSnags} open</p>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Simulator</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Reported At</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Severity</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {allSnags.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-20 text-center font-bold text-slate-400">No reported snags.</td>
                          </tr>
                        ) : allSnags.map(snag => (
                          <tr key={snag.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800">{snag.simulatorName}</td>
                            <td className="px-6 py-4 text-slate-600 max-w-[280px]" title={snag.description}>{snag.description}</td>
                            <td className="px-6 py-4 text-slate-500">{snag.reportedAt}</td>
                            <td className="px-6 py-4"><SeverityBadge severity={snag.severity} /></td>
                            <td className="px-6 py-4 text-right">
                              {!snag.isResolved && (
                                <button
                                  onClick={() => currentUser.role === UserRole.ENGINEER ? startWorkflow('snag-entry', snag) : alert("Only SIM Engineers can resolve snags.")}
                                  className="px-4 py-2 bg-slate-900 hover:bg-red-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'breakdown-history' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Breakdown History</h2>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{breakdownHistory.length} records</p>
                  </div>
                  <button
                    onClick={downloadHistoryCsv}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">AOG Number</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Simulator</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Breakdown Start</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Recovered At</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Resolution</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {breakdownHistory.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-20 text-center font-bold text-slate-400">No breakdown history.</td>
                          </tr>
                        ) : breakdownHistory.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-black text-red-600">{entry.aogNo}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{entry.simulatorName}</td>
                            <td className="px-6 py-4 text-slate-500">{entry.startTime}</td>
                            <td className="px-6 py-4 text-slate-500">{entry.recoveryTime || '—'}</td>
                            <td className="px-6 py-4">
                              {entry.resolution ? (
                                <div>
                                  <p className="font-bold text-slate-800">{entry.resolution}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">DR: {entry.drNumber}</p>
                                </div>
                              ) : (
                                <span className="text-slate-300">Pending recovery</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${entry.status === 'BREAKDOWN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'customer-verification' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Verification Handover</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Manage session handovers and completions</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Offered Hands-on Releases (Customer-In)</p>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{sessions.filter(s => s.status === SessionStatus.OFFERED).length} pending</span>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {sessions.filter(s => s.status === SessionStatus.OFFERED).length === 0 ? (
                      <div className="py-12 text-center text-slate-400">No sessions currently offered.</div>
                    ) : sessions.filter(s => s.status === SessionStatus.OFFERED).map(s => (
                      <div key={s.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{s.customer}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Log Sheet No: {s.logSerialNo} · Instructor: {s.instructor}</p>
                        </div>
                        <button
                          onClick={() => startWorkflow('customer-in', s)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Accept Handover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Active Sessions (Customer-Out)</p>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{sessions.filter(s => s.status === SessionStatus.ACCEPTED).length} in progress</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {sessions.filter(s => s.status === SessionStatus.ACCEPTED).length === 0 ? (
                      <div className="py-12 text-center text-slate-400">No active simulator sessions in progress.</div>
                    ) : sessions.filter(s => s.status === SessionStatus.ACCEPTED).map(s => (
                      <div key={s.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{s.customer}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Log Sheet: {s.logSerialNo} · Started at: {s.actualStart}</p>
                        </div>
                        <button
                          onClick={() => startWorkflow('customer-out', s)}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Checkout Session
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'output' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Operational Archives</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">Training Log Sheets &amp; Signatures History</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  {filteredCompletedSessions.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">No completed sessions matching criteria.</div>
                  ) : filteredCompletedSessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => startWorkflow('log', s)}
                      className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors cursor-pointer border-b last:border-none border-slate-100"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{s.customer}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Log Sheet: {s.logSerialNo} · {s.trainingType} · {s.effectiveness}</p>
                      </div>
                      <Printer className="w-4 h-4 text-slate-400 hover:text-red-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════
           WORKFLOW MODALS
      ════════════════════════════════════════════════════════════ */}

      {/* ── MODAL BACKDROP ── */}
      {workflow.type && workflow.type !== 'log' && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          
          {/* ── OFFER MODAL ── */}
          {workflow.type === 'offer' && (
            <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">Simulator Release Details</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{(workflow.data as Simulator).name}</p>
                </div>
                <button onClick={closeWorkflow} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <Label>Booking Date</Label>
                    <input type="text" readOnly value={new Date().toLocaleDateString()} className={inputCls + ' cursor-default'} />
                  </Field>
                  <Field>
                    <Label>Simulator Status *</Label>
                    <select value={formData.simStatus} onChange={e => setFormData(p => ({ ...p, simStatus: e.target.value }))} className={selectCls}>
                      <option value="Serviceable">Serviceable</option>
                      <option value="Unserviceable">Unserviceable</option>
                      <option value="Sim in Planned Maintenance">Sim in Planned Maintenance</option>
                    </select>
                  </Field>
                  <Field>
                    <Label>Log Sheet No *</Label>
                    <input type="text" placeholder="e.g. LOG-4277" value={formData.logSheetNo} onChange={e => setFormData(p => ({ ...p, logSheetNo: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field>
                    <Label>Type of Check *</Label>
                    <select value={formData.typeOfCheck} onChange={e => setFormData(p => ({ ...p, typeOfCheck: e.target.value }))} className={selectCls}>
                      {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field>
                    <Label>Offer From</Label>
                    <input type="time" value={formData.fromTime} onChange={e => setFormData(p => ({ ...p, fromTime: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field>
                    <Label>Offer To</Label>
                    <input type="time" value={formData.toTime} onChange={e => setFormData(p => ({ ...p, toTime: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field>
                    <Label>Customer</Label>
                    <input type="text" value={formData.customer} onChange={e => setFormData(p => ({ ...p, customer: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field>
                    <Label>Instructor</Label>
                    <input type="text" value={formData.instructor} onChange={e => setFormData(p => ({ ...p, instructor: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <SignaturePad onSave={dataUrl => setFormData(p => ({ ...p, engineerSignature: dataUrl }))} label="Engineer's Digital Signature" />
                </div>
                <button onClick={handleOfferConfirm} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-200 uppercase tracking-widest text-sm active:scale-[0.98] transition-all">
                  Confirm Release →
                </button>
              </div>
            </div>
          )}

          {/* ── CUSTOMER-IN MODAL ── */}
          {workflow.type === 'customer-in' && (
            <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">Customer Verification (IN)</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Session: {(workflow.data as TrainingSession).logSerialNo} · {(workflow.data as TrainingSession).customer}</p>
                </div>
                <button onClick={closeWorkflow} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <Label>Crew Status *</Label>
                    <select value={formData.crewStatus} onChange={e => setFormData(p => ({ ...p, crewStatus: e.target.value }))} className={selectCls}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </Field>
                  <Field>
                    <Label>Actual Start Time *</Label>
                    <input type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field>
                    <Label>Training Type *</Label>
                    <select value={formData.trainingType} onChange={e => setFormData(p => ({ ...p, trainingType: e.target.value }))} className={selectCls}>
                      <option value="FSTD">FSTD</option>
                      <option value="Dry TRG">Dry TRG</option>
                    </select>
                  </Field>
                  <Field>
                    <Label>Session Type *</Label>
                    <select value={formData.sessionType} onChange={e => setFormData(p => ({ ...p, sessionType: e.target.value as any }))} className={selectCls}>
                      <option value="Standard">Standard Session</option>
                      <option value="Split">Split Session</option>
                      <option value="Demo">Demo Session</option>
                      <option value="Billable">Billable</option>
                    </select>
                  </Field>
                </div>

                {/* Crew Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Crew Members</Label>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, crewMembers: [...p.crewMembers, ''] }))}
                      className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition-all"
                    >
                      + Add
                    </button>
                  </div>
                  {formData.crewMembers.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                      <p className="text-[10px] text-slate-400 font-bold">No crew added. Click "+ Add" to add crew members.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {formData.crewMembers.map((name, i) => (
                        <div key={i} className="flex gap-2 items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                          <input
                            type="text" value={name} placeholder={`Crew member ${i + 1}`}
                            onChange={e => { const u = [...formData.crewMembers]; u[i] = e.target.value; setFormData(p => ({ ...p, crewMembers: u })); }}
                            className="flex-1 bg-transparent border-none text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, crewMembers: p.crewMembers.filter((_, idx) => idx !== i) }))}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center text-xs transition-all"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <SignaturePad onSave={dataUrl => setFormData(p => ({ ...p, customerInSignature: dataUrl }))} label="Customer's Digital Signature" />
                </div>
                <button onClick={handleCustomerInConfirm} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-200 uppercase tracking-widest text-sm active:scale-[0.98] transition-all">
                  Confirm Acceptance →
                </button>
              </div>
            </div>
          )}

          {/* ── CUSTOMER-OUT MODAL ── */}
          {workflow.type === 'customer-out' && (
            <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">Customer Verification (OUT)</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Session: {(workflow.data as TrainingSession).logSerialNo} · {(workflow.data as TrainingSession).customer}</p>
                </div>
                <button onClick={closeWorkflow} className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-4 gap-3">
                  <Field className="col-span-1">
                    <Label>End Time *</Label>
                    <input type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field className="col-span-1">
                    <Label>Utilized (min)</Label>
                    <input type="number" value={formData.utilizedTime} onChange={e => setFormData(p => ({ ...p, utilizedTime: parseInt(e.target.value) || 0 }))} className={inputCls + ' text-center'} />
                  </Field>
                  <Field className="col-span-1">
                    <Label>Down (min)</Label>
                    <input type="number" value={formData.downTime} onChange={e => setFormData(p => ({ ...p, downTime: parseInt(e.target.value) || 0 }))} className={inputCls + ' text-center'} />
                  </Field>
                  <Field className="col-span-1">
                    <Label>Break (min)</Label>
                    <input type="number" value={formData.breakTime} onChange={e => setFormData(p => ({ ...p, breakTime: parseInt(e.target.value) || 0 }))} className={inputCls + ' text-center'} />
                  </Field>
                </div>

                <Field>
                  <Label>Training Effectiveness *</Label>
                  <select value={formData.effectiveness} onChange={e => setFormData(p => ({ ...p, effectiveness: e.target.value }))} className={selectCls}>
                    <option value="5-Excellent">5 — Excellent</option>
                    <option value="4-Good">4 — Good</option>
                    <option value="3-Fair">3 — Fair</option>
                    <option value="2-Poor">2 — Poor</option>
                  </select>
                </Field>

                {/* Snag Reporting */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Report Snags (if any)</Label>
                    {formData.raisedSnagsList.length > 0 && (
                      <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                        {formData.raisedSnagsList.length} queued
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text" placeholder="Describe the snag…"
                        value={formData.raisedSnagDescription}
                        onChange={e => setFormData(p => ({ ...p, raisedSnagDescription: e.target.value }))}
                        className={inputCls + ' col-span-2 text-[12px]'}
                      />
                      <select value={formData.raisedSnagSeverity} onChange={e => setFormData(p => ({ ...p, raisedSnagSeverity: e.target.value }))} className={selectCls + ' text-[12px]'}>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.raisedSnagDescription.trim()) { alert('Please enter a snag description.'); return; }
                        setFormData(p => ({ ...p, raisedSnagsList: [...p.raisedSnagsList, { description: p.raisedSnagDescription, severity: p.raisedSnagSeverity }], raisedSnagDescription: '', raisedSnagSeverity: 'LOW' }));
                      }}
                      className="w-full py-2.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      + Add Snag to Log
                    </button>
                    {formData.raisedSnagsList.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {formData.raisedSnagsList.map((snag: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <SeverityBadge severity={snag.severity} />
                              <span className="text-xs font-semibold text-slate-700">{snag.description}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, raisedSnagsList: p.raisedSnagsList.filter((_, idx) => idx !== i) }))}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <SignaturePad onSave={dataUrl => setFormData(p => ({ ...p, customerOutSignature: dataUrl }))} label="Customer's Digital Signature (Sign-off)" />
                </div>
                <button onClick={handleCustomerOutConfirm} className="w-full py-4 bg-slate-900 hover:bg-red-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-sm active:scale-[0.98] transition-all">
                  Submit Session Completion →
                </button>
              </div>
            </div>
          )}

          {/* ── BREAKDOWN MODAL ── */}
          {workflow.type === 'breakdown' && (
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-7 py-5 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-900 uppercase tracking-tight">Report Breakdown</h3>
                    <p className="text-[9px] text-rose-400 font-bold">{(workflow.data as Simulator).name}</p>
                  </div>
                </div>
                <button onClick={closeWorkflow} className="w-8 h-8 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-rose-500" />
                </button>
              </div>
              <div className="p-7 space-y-5">
                <Field>
                  <Label>Breakdown Reason *</Label>
                  <textarea
                    value={formData.breakdownReason}
                    onChange={e => setFormData(p => ({ ...p, breakdownReason: e.target.value }))}
                    placeholder="Describe the fault / reason for AOG status…"
                    className={textareaCls + ' focus:border-rose-500'}
                  />
                </Field>
                <button onClick={handleBreakdownReport} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-[0.98]">
                  Lock Simulator to AOG
                </button>
              </div>
            </div>
          )}

          {/* ── RECOVERY MODAL ── */}
          {workflow.type === 'recovery' && (
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-7 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Report Recovery</h3>
                    <p className="text-[9px] text-emerald-400 font-bold">{(workflow.data as Simulator).name}</p>
                  </div>
                </div>
                <button onClick={closeWorkflow} className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
              <div className="p-7 space-y-5">
                <Field>
                  <Label>DR Number *</Label>
                  <input type="text" placeholder="e.g. DR-204" value={formData.drNumber} onChange={e => setFormData(p => ({ ...p, drNumber: e.target.value }))} className={inputCls} />
                </Field>
                <Field>
                  <Label>Recovery Resolution *</Label>
                  <textarea
                    value={formData.recoveryResolution}
                    onChange={e => setFormData(p => ({ ...p, recoveryResolution: e.target.value }))}
                    placeholder="Describe what was done to restore serviceability…"
                    className={textareaCls + ' focus:border-emerald-500'}
                  />
                </Field>
                <button onClick={handleRecoveryReport} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-[0.98]">
                  Recover Simulator →
                </button>
              </div>
            </div>
          )}

          {/* ── SNAG RESOLUTION MODAL ── */}
          {workflow.type === 'snag-entry' && (
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-7 py-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-sky-900 uppercase tracking-tight">Resolve Technical Snag</h3>
                    <p className="text-[9px] text-sky-400 font-bold">Engineer sign-off required</p>
                  </div>
                </div>
                <button onClick={closeWorkflow} className="w-8 h-8 bg-sky-100 hover:bg-sky-200 rounded-lg flex items-center justify-center transition-all">
                  <X className="w-4 h-4 text-sky-500" />
                </button>
              </div>
              <div className="p-7 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported Snag</p>
                  <p className="text-sm font-bold text-slate-700 italic">"{workflow.data.description}"</p>
                  <SeverityBadge severity={workflow.data.severity} />
                </div>
                <Field>
                  <Label>Resolution Details *</Label>
                  <textarea
                    value={formData.snagResolutionNotes}
                    onChange={e => setFormData(p => ({ ...p, snagResolutionNotes: e.target.value }))}
                    placeholder="Explain what actions were taken to resolve this snag…"
                    className={textareaCls + ' focus:border-sky-500'}
                  />
                </Field>
                <button onClick={handleResolveSnag} className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-[0.98]">
                  Submit Resolution →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── LOG REPORT MODAL (Full screen) ── */}
      {workflow.type === 'log' && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto print-full">
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between print-hidden shadow-sm">
            <button onClick={closeWorkflow} className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all">
              <X className="w-4 h-4" /> Close
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Training Log — {workflow.data.logSerialNo}
            </span>
            <button onClick={() => window.print()} className="flex items-center gap-2.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-md">
              <Printer className="w-4 h-4" /> Print Log
            </button>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="border-2 border-slate-900 bg-white shadow-xl">
              <div className="border-b-2 border-slate-900 p-8 flex items-center justify-between bg-slate-50">
                <div className="w-16 h-16 bg-red-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0">A</div>
                <div className="text-center flex-1 px-6">
                  <p className="text-xl font-black tracking-tight uppercase text-slate-900">AVI ATMS System</p>
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Simulator Training Log Report</p>
                </div>
                <div className="w-16 text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Page 1 of 1</p>
                </div>
              </div>

              <table className="w-full border-collapse border-b-2 border-slate-900 text-[12px]">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="border-r border-slate-300 p-4 font-black bg-slate-50 w-1/4 uppercase tracking-widest text-slate-500">
                      Booking Date
                      <div className="text-red-600 text-base font-black text-slate-900 mt-0.5">{new Date(parseInt(workflow.data.id.split('-')[1]) || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="border-r border-slate-300 p-4 font-black bg-slate-50 w-1/4 uppercase tracking-widest text-slate-500">
                      Booking Entry No
                      <div className="text-slate-900 text-sm mt-0.5">{workflow.data.bookingId}</div>
                    </td>
                    <td className="p-4 font-black bg-slate-50" colSpan={2}>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="uppercase tracking-widest text-slate-500">FSTD Name<div className="text-slate-900 font-bold text-[11px] mt-0.5">{simulators.find(sim => sim.id === workflow.data.simulatorId)?.name}</div></div>
                        <div className="uppercase tracking-widest text-slate-500">Asset Reference<div className="text-slate-900 font-bold mt-0.5">{simulators.find(sim => sim.id === workflow.data.simulatorId)?.serialNumber}</div></div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-900 bg-white">
                    <td className="border-r border-slate-300 p-4 uppercase tracking-widest font-bold text-slate-500">Training Type<div className="text-slate-800 font-black mt-0.5">{workflow.data.trainingType}</div></td>
                    <td className="border-r border-slate-300 p-4 uppercase tracking-widest font-bold text-slate-500">Log Sheet No<div className="text-slate-800 font-black mt-0.5">{workflow.data.logSerialNo}</div></td>
                    <td className="border-r border-slate-300 p-4 uppercase tracking-widest font-bold text-slate-500">Instructor<div className="text-slate-800 font-black mt-0.5">{workflow.data.instructor}</div></td>
                    <td className="p-4 uppercase tracking-widest font-bold text-slate-500">Client Entity<div className="text-slate-800 font-black mt-0.5">{workflow.data.customer}</div></td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse border-b-2 border-slate-900 text-[12px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase tracking-[0.25em] text-[10px]">
                    <td colSpan={2} className="p-3 text-center border-r border-white/20">Scheduled Time Window</td>
                    <td colSpan={2} className="p-3 text-center">Actual Session Metrics</td>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300 font-black text-center">
                    <td className="p-4 border-r border-slate-300 uppercase">From: {workflow.data.scheduledFrom}</td>
                    <td className="p-4 border-r border-slate-300 uppercase">To: {workflow.data.scheduledTo}</td>
                    <td className="p-4 border-r border-slate-300 uppercase">Start: {workflow.data.actualStart || '—'}</td>
                    <td className="p-4 uppercase">Finish: {workflow.data.actualFinish || '—'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="p-6">
                      <div className="grid grid-cols-4 gap-8 text-center">
                        <div>
                          <p className="uppercase tracking-[0.2em] font-black text-slate-400 text-[9px]">Utilized Time</p>
                          <p className="text-2xl font-black text-red-600 italic mt-1">{workflow.data.metrics.utilizedTime}m</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.2em] font-black text-slate-400 text-[9px]">Break Time</p>
                          <p className="text-2xl font-black text-red-600 italic mt-1">{workflow.data.metrics.breakTime}m</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.2em] font-black text-slate-400 text-[9px]">Down Time</p>
                          <p className="text-2xl font-black text-red-600 italic mt-1">{workflow.data.metrics.downTime}m</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.2em] font-black text-slate-400 text-[9px]">Effectiveness</p>
                          <p className="text-2xl font-black text-slate-800 italic mt-1">{workflow.data.effectiveness || '—'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {workflow.data.crew?.members?.length > 0 && (
                <div className="p-6 border-b-2 border-slate-900">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Crew / Trainees Attending:</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.data.crew.members.map((m: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-widest">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 border-b-2 border-slate-900">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Technical De-brief &amp; Reported Snags:</p>
                <div className="min-h-[80px] bg-slate-50 border border-slate-200 p-5 text-[13px] font-bold text-slate-700 leading-relaxed">
                  {workflow.data.snags.length > 0 ? (
                    <div className="space-y-3">
                      {workflow.data.snags.map((s: any, i: number) => (
                        <div key={i} className="flex items-start justify-between gap-4 border-b last:border-none pb-2 last:pb-0">
                          <p className="italic">• {s.description}</p>
                          <span className={`shrink-0 px-2.5 py-1 text-[8px] font-black uppercase ${s.isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {s.isResolved ? `Resolved — ${s.resolution}` : `Open — ${s.severity}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-slate-500">Platform operation verified within nominal certification parameters. System integrity confirmed. No technical snags reported during this session.</p>
                  )}
                </div>
              </div>

              <div className="p-8 flex items-end justify-between gap-8">
                <div className="flex-1 space-y-2">
                  <div className="w-56 h-20 border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                    {workflow.data.signatures?.engineer
                      ? <img src={workflow.data.signatures.engineer} alt="Engineer Signature" className="max-h-full max-w-full object-contain" />
                      : <span className="text-[10px] text-slate-300 font-medium italic">No signature</span>
                    }
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">SIM Engineer Authorization</p>
                  <p className="text-[9px] font-bold text-slate-400">{workflow.data.engineerName}</p>
                </div>
                <div className="flex-1 text-right space-y-2">
                  <div className="w-56 h-20 border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center ml-auto">
                    {workflow.data.signatures?.customerOut
                      ? <img src={workflow.data.signatures.customerOut} alt="Customer Signature" className="max-h-full max-w-full object-contain" />
                      : <span className="text-[10px] text-slate-300 font-medium italic">No signature</span>
                    }
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Authorized Client Signatory</p>
                  <p className="text-[9px] font-bold text-slate-400 font-mono">Verified System Hash Reference</p>
                </div>
              </div>

              <div className="bg-slate-900 px-8 py-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                  AVI OPS CONNECT · System Generated · Log: {workflow.data.logSerialNo} · {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
