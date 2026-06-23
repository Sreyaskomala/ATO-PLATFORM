import React, { useState } from 'react';
import { 
  Cpu, Fingerprint, Database, ShieldAlert, Globe, 
  RotateCcw, Sliders, PlayCircle, CheckCircle2, AlertTriangle, 
  Activity, ArrowRight, Server, Zap, RefreshCw, BarChart3
} from 'lucide-react';

interface FutureHubViewProps {
  onLogAudit: (action: string, details: string) => void;
}

const FutureHubView: React.FC<FutureHubViewProps> = ({ onLogAudit }) => {
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'advancements' | 'sandbox'>('market');
  
  // Biometric Check-in Sandbox state
  const [bioStatus, setBioStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [bioPilot, setBioPilot] = useState('Capt. Robert Vance');
  
  // Telemetry Ingestion Sandbox state
  const [selectedManeuver, setSelectedManeuver] = useState('Engine Out on Takeoff');
  const [telemetryResult, setTelemetryResult] = useState<any | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // AI Rescheduling Sandbox state
  const [disruptionType, setDisruptionType] = useState<'instructor_sick' | 'sim_aog'>('instructor_sick');
  const [rescheduleLog, setRescheduleLog] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState(false);

  // Run mock biometric facial recognition
  const handleStartBiometricScan = () => {
    setBioStatus('scanning');
    onLogAudit('BIOMETRIC_SCAN_START', `Initiated facial recognition check-in for pilot: ${bioPilot}`);
    setTimeout(() => {
      const rand = Math.random();
      if (rand > 0.1) {
        setBioStatus('success');
        onLogAudit('BIOMETRIC_SCAN_SUCCESS', `Facial scan matched (Confidence 99.8%) for pilot: ${bioPilot}. Attendance verified.`);
      } else {
        setBioStatus('failed');
        onLogAudit('BIOMETRIC_SCAN_FAILED', `Facial scan verification mismatch for pilot: ${bioPilot}. Access hold triggered.`);
      }
    }, 2000);
  };

  // Run mock telemetry ingestion
  const handleIngestTelemetry = () => {
    setIsIngesting(true);
    setTelemetryResult(null);
    onLogAudit('TELEMETRY_INGESTION_START', `Parsing FSTD telemetry streams for exercise: ${selectedManeuver}`);
    setTimeout(() => {
      let result = {
        timestamp: new Date().toISOString(),
        sampledPoints: 2400,
        deviations: [] as string[],
        competenciesScore: {} as Record<string, number>,
        grade: 'Satisfactory'
      };

      if (selectedManeuver === 'Engine Out on Takeoff') {
        result.deviations = ['Yaw overshoot on rotation (2.4 deg)', 'Beta target tracking offset (1s)'];
        result.competenciesScore = { 'Flight Path Mgt': 3.8, 'Problem Solving': 4.5, 'Knowledge': 4.8 };
        result.grade = '4 - Satisfactory';
      } else if (selectedManeuver === 'ILS Windshear Approach') {
        result.deviations = ['Glideslope exceedance (1.1 dots)', 'Speed deviation +12 knots'];
        result.competenciesScore = { 'Flight Path Mgt': 3.1, 'CRM': 4.2, 'Knowledge': 4.0 };
        result.grade = '3 - Additional Training Recommended';
      } else {
        result.deviations = ['No notable structural deviations detected'];
        result.competenciesScore = { 'Flight Path Mgt': 4.9, 'CRM': 4.8, 'Problem Solving': 4.8 };
        result.grade = '5 - Excellent';
      }

      setTelemetryResult(result);
      setIsIngesting(false);
      onLogAudit('TELEMETRY_INGESTION_SUCCESS', `Ingested telemetry for ${selectedManeuver}. Auto-graded: ${result.grade}`);
    }, 1500);
  };

  // Run AI Scheduling solver
  const handleSolveDisruption = () => {
    setIsSolving(true);
    setRescheduleLog([]);
    onLogAudit('AI_RESCHEDULING_START', `AI solver executing recovery plan for disruption: ${disruptionType}`);
    
    const steps = [
      'Scanning conflict matrices across 4 facilities...',
      disruptionType === 'instructor_sick' 
        ? 'Identified 3 affected sessions for Instructor V. Kulkarni.' 
        : 'Identified 5 affected simulator slots for FFS-B737-MAX-01.',
      'Checking standby instructor fatigue limits & currency rosters...',
      'Matching qualification matrices for substitute examiners...',
      'Solving multi-variable constraint relaxation (FFS device availability + crew duty times)...',
      'Optimized schedule generated: 0 hard conflicts, 2 sessions shifted by +2 hours, 1 split booking allocated.',
      'Auto-dispatching push notifications to crew members via mobile channel.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setRescheduleLog(p => [...p, step]);
        if (idx === steps.length - 1) {
          setIsSolving(false);
          onLogAudit('AI_RESCHEDULING_SUCCESS', `Disruption resolved. 100% of affected schedules reassigned conflict-free.`);
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 text-white" />
        </div>
        <span className="inline-block px-2.5 py-1 bg-red-600/30 border border-red-500/50 text-[8px] font-black uppercase tracking-widest text-red-400 rounded-full mb-3">
          R&D Hub &amp; Future Vision
        </span>
        <h2 className="text-2xl font-black tracking-tight">Future Hub: Market Intelligence &amp; Next-Gen Operations</h2>
        <p className="text-xs text-slate-300 font-medium max-w-2xl mt-1">
          Explore competitor gaps, discover advanced operational enhancements, and interact with live technical sandbox simulators for flight simulator telemetry ingestion and AI scheduling recovery.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('market')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === 'market' 
              ? 'border-red-600 text-slate-900 bg-red-50/10' 
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 inline mr-1.5" /> Competitor Gaps
        </button>
        <button
          onClick={() => setActiveSubTab('advancements')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === 'advancements' 
              ? 'border-red-600 text-slate-900 bg-red-50/10' 
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 inline mr-1.5" /> Next-Gen Innovations
        </button>
        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            activeSubTab === 'sandbox' 
              ? 'border-red-600 text-slate-900 bg-red-50/10' 
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1.5" /> Interactive Sandbox
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        
        {/* Tab 1: Competitor Gaps */}
        {activeSubTab === 'market' && (
          <div className="grid grid-cols-1 gap-6 animate-slide-up">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">Current Industry Challenges</h3>
              <p className="text-xs text-slate-500">
                While training software suites like **MINT TMS**, **Fox BKS**, **FlightLogger**, and **AQT ATMS** represent the primary enterprise platforms currently available on the market, they are widely recognized to suffer from severe design and technical constraints:
              </p>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Core Constraints / Limitations</th>
                      <th className="px-4 py-3">ATMS Advantage &amp; Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50/40">
                      <td className="px-4 py-4 font-black text-slate-900">MINT TMS / Fox BKS</td>
                      <td className="px-4 py-4 text-slate-500 space-y-1">
                        <p>• Rigid, legacy interfaces leading to significant human data-entry error.</p>
                        <p>• Black-box scheduling algorithms where conflicts require manual re-planning loops.</p>
                        <p>• Disconnects between core training logs and safety tracking databases.</p>
                      </td>
                      <td className="px-4 py-4 text-slate-900 bg-red-50/10">
                        <p className="font-bold text-red-600">Unified Operations &amp; AI Assistance</p>
                        <p className="text-[11px] text-slate-600 mt-1">ATMS couples CRM, simulator tracking, and grading into a single state machine, utilizing an Explainable AI Assistant to query and audit operations instantly.</p>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/40">
                      <td className="px-4 py-4 font-black text-slate-900">FlightLogger / Aviatize</td>
                      <td className="px-4 py-4 text-slate-500 space-y-1">
                        <p>• Primarily optimized for flight school logistics, scaling poorly for major commercial airlines.</p>
                        <p>• Poor support for Evidence-Based Training (EBT) and advanced regulatory rules (e.g. DGCA CAR/EASA Part-FCL).</p>
                      </td>
                      <td className="px-4 py-4 text-slate-900 bg-red-50/10">
                        <p className="font-bold text-red-600">Enterprise Multi-Tenancy &amp; EBT Rules</p>
                        <p className="text-[11px] text-slate-600 mt-1">Natively evaluates FAA/DGCA/EASA compliance rules at the student profile level and isolated database level, with automatic compliance blockages.</p>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/40">
                      <td className="px-4 py-4 font-black text-slate-900">AQT ATMS</td>
                      <td className="px-4 py-4 text-slate-500 space-y-1">
                        <p>• Separate standalone modules for LMS and simulator operational rosters, causing synchronization lag.</p>
                        <p>• Lacks native biometric sign-offs or cryptographic proofing of regulatory logs.</p>
                      </td>
                      <td className="px-4 py-4 text-slate-900 bg-red-50/10">
                        <p className="font-bold text-red-600">Natively Synchronized LMS &amp; Cryptography</p>
                        <p className="text-[11px] text-slate-600 mt-1">Synchronized SCORM players auto-verify milestones and write tamper-evident logs chained via SHA-256 integrity tags.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-start">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm">Regulatory Defensibility and "Audit in a Click"</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Competitor systems compile spreadsheets and legacy reports that take up to 48 hours to assemble during a DGCA or EASA audit. Our platform solves this constraint natively by maintaining a **cryptographically hashed, tamper-evident audit trail** and a **live compliance scanning engine** that alerts administrators of any regulatory infractions (e.g. expired class 1 medicals) in less than 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Future Advancements */}
        {activeSubTab === 'advancements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            
            {/* AI Adaptive */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-red-200 transition-all group">
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">1. AI-Driven Adaptive Curricula</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Replaces rigid, one-size-fits-all training syllabus. The AI engine analyzes the pilot's historical exam results, LMS quiz attempts, and simulator competency grading to automatically inject personalized, targeted refresher topics into upcoming briefs.
              </p>
            </div>

            {/* Sim Telemetry */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-red-200 transition-all group">
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">2. FSTD Telemetry Ingestion</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directly connects to FSTD flight logs (pitch, roll, yaw, throttle, systems exceedance). The parser ingests raw telemetry during check-out to automatically populate objective grading criteria, identifying flight envelope deviations instantly.
              </p>
            </div>

            {/* Biometrics */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-red-200 transition-all group">
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">3. Biometric Identity Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secures simulator attendance integrity. Standard badge swipes are vulnerable to proxy attendance; integrating biometric face scan checkpoints at the simulator bay gates verifies the correct pilot is in the cockpit for regulatory logging.
              </p>
            </div>

            {/* Blockchain */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-red-200 transition-all group">
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">4. Cryptographic Record Locking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Protects pilot logs from tampering. Finalized training grades, checkride results, and examiner signatures are hashed and chained, creating a secure, unalterable digital ledger that guarantees complete data integrity.
              </p>
            </div>

            {/* Mobile Offline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-red-200 transition-all group md:col-span-2">
              <div className="w-10 h-10 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">5. Offline-First Synchronization</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Many simulator bays operate in shielded rooms with poor Wi-Fi or cellular connectivity. Standard systems crash or lose data during offline sessions; an offline-first sync layer cached locally inside the examiner's iPad guarantees grading records are preserved and synchronized once online.
              </p>
            </div>

          </div>
        )}

        {/* Tab 3: Interactive Sandbox */}
        {activeSubTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Sandbox 1: Biometric Verification */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sandbox Demo #1</span>
                  <Fingerprint className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2">Biometric Face Check-in</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Simulates a face recognition verification event at a simulator terminal. Toggles attendance status and flags credentials mismatch in real time.
                </p>
                
                {/* Simulator visual */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-4 flex flex-col items-center justify-center h-28 relative">
                  {bioStatus === 'idle' && (
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">{bioPilot}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Awaiting scan</p>
                    </div>
                  )}
                  {bioStatus === 'scanning' && (
                    <div className="flex flex-col items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-5 h-5 text-red-500 animate-spin" />
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Analyzing face template...</p>
                    </div>
                  )}
                  {bioStatus === 'success' && (
                    <div className="text-center text-emerald-600 flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 mb-1" />
                      <p className="text-xs font-black uppercase">Verified (99.8%)</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Roster updated: Present</p>
                    </div>
                  )}
                  {bioStatus === 'failed' && (
                    <div className="text-center text-red-500 flex flex-col items-center">
                      <AlertTriangle className="w-6 h-6 mb-1" />
                      <p className="text-xs font-black uppercase">Scan Mismatch</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Safety alert dispatch logged</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <select 
                  value={bioPilot} 
                  onChange={e => { setBioPilot(e.target.value); setBioStatus('idle'); }} 
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl mb-2.5"
                  disabled={bioStatus === 'scanning'}
                >
                  <option value="Capt. Robert Vance">Capt. Robert Vance (Qualified)</option>
                  <option value="Unknown Operator">Unknown Operator (No credential)</option>
                </select>
                <button
                  onClick={handleStartBiometricScan}
                  className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  disabled={bioStatus === 'scanning'}
                >
                  Scan Face &amp; Register Attendance
                </button>
              </div>
            </div>

            {/* Sandbox 2: Telemetry Ingestor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sandbox Demo #2</span>
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2">FFS Telemetry Stream Parser</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a maneuver checklist and process the raw JSON log to automatically generate Pilot Competency scores.
                </p>

                {/* Telemetry log viewer */}
                <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-4 my-3 rounded-2xl h-28 overflow-y-auto border border-slate-800">
                  {isIngesting ? (
                    <div className="flex items-center justify-center h-full gap-2 text-red-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ingesting FSTD sensor data...
                    </div>
                  ) : telemetryResult ? (
                    <div className="space-y-1.5">
                      <p className="text-slate-400">// Ingest Successful</p>
                      <p>Time: {telemetryResult.timestamp.slice(11, 19)}</p>
                      <p className="text-white">Deviations:</p>
                      {telemetryResult.deviations.map((d: string, i: number) => (
                        <p key={i} className="text-rose-400 ml-2">⚠ {d}</p>
                      ))}
                      <p className="text-white">Scores:</p>
                      {Object.entries(telemetryResult.competenciesScore).map(([k, v]: any) => (
                        <p key={k} className="ml-2">{k}: <span className="text-amber-400 font-bold">{v}/5.0</span></p>
                      ))}
                      <p className="text-emerald-300 font-bold">Auto-Grade: {telemetryResult.grade}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-center">
                      Select a maneuver and ingest FFS telemetry log
                    </div>
                  )}
                </div>
              </div>

              <div>
                <select 
                  value={selectedManeuver} 
                  onChange={e => { setSelectedManeuver(e.target.value); setTelemetryResult(null); }} 
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl mb-2.5"
                  disabled={isIngesting}
                >
                  <option value="Engine Out on Takeoff">Engine Out on Takeoff</option>
                  <option value="ILS Windshear Approach">ILS Windshear Approach</option>
                  <option value="Steep Turns &amp; Stall Recovery">Steep Turns &amp; Stall Recovery</option>
                </select>
                <button
                  onClick={handleIngestTelemetry}
                  className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  disabled={isIngesting}
                >
                  Ingest Telemetry Log
                </button>
              </div>
            </div>

            {/* Sandbox 3: AI Rescheduling */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sandbox Demo #3</span>
                  <Zap className="w-4 h-4 text-red-600" />
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2">AI Recovery &amp; Re-Planning</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trigger a simulated operational conflict (sick leave or sim breakdown) and watch the AI Solver find slot reassignments.
                </p>

                {/* Solving log viewer */}
                <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-4 my-3 rounded-2xl h-28 overflow-y-auto border border-slate-800">
                  {isSolving ? (
                    <div className="space-y-1">
                      {rescheduleLog.map((log, i) => (
                        <p key={i} className={i === rescheduleLog.length - 1 ? 'text-red-400 font-bold' : ''}>
                          {log}
                        </p>
                      ))}
                      <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Solving heuristic tree...
                      </div>
                    </div>
                  ) : rescheduleLog.length > 0 ? (
                    <div className="space-y-1">
                      {rescheduleLog.map((log, i) => (
                        <p key={i} className="text-slate-300">
                          {log}
                        </p>
                      ))}
                      <p className="text-emerald-400 font-bold pt-1">✓ Solution Accepted. Schedule Updated.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-center">
                      Select disruption and execute AI recovery solver
                    </div>
                  )}
                </div>
              </div>

              <div>
                <select 
                  value={disruptionType} 
                  onChange={e => { setDisruptionType(e.target.value as any); setRescheduleLog([]); }} 
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl mb-2.5"
                  disabled={isSolving}
                >
                  <option value="instructor_sick">Instructor Sick Leave (CRM Class)</option>
                  <option value="sim_aog">FFS-B737-MAX-01 AOG (Fault Code: EFIS-02)</option>
                </select>
                <button
                  onClick={handleSolveDisruption}
                  className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  disabled={isSolving}
                >
                  Solve Disruption Heuristics
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default FutureHubView;
