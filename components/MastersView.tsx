import React, { useState } from 'react';
import { Course, Subject, Classroom, Simulator, UserRole } from '../types';
import { Wrench, Shield, CheckCircle2, AlertCircle, Plus, Info, LayoutList, Layers } from 'lucide-react';
import { TRAINING_TYPES } from '../constants';

interface MastersViewProps {
  simulators: Simulator[];
  setSimulators: React.Dispatch<React.SetStateAction<Simulator[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  classrooms: Classroom[];
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
  instructors: any[];
  setInstructors: React.Dispatch<React.SetStateAction<any[]>>;
  customers: any[];
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  onLogAudit: (action: string, details: string) => void;
}

const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all placeholder:text-slate-300";
const selectCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

const MastersView: React.FC<MastersViewProps> = ({
  simulators,
  setSimulators,
  courses,
  setCourses,
  subjects,
  setSubjects,
  classrooms,
  setClassrooms,
  instructors,
  setInstructors,
  customers,
  setCustomers,
  onLogAudit
}) => {
  const [activeTab, setActiveTab] = useState<'simulators' | 'courses' | 'subjects' | 'classrooms' | 'instructors' | 'customers'>('simulators');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [simForm, setSimForm] = useState({ name: '', model: '', serialNumber: '', engineType: '', facility: 'Sector Alpha', status: 'SERVICEABLE' });
  const [courseForm, setCourseForm] = useState({ code: '', name: '', aircraftType: 'A320-NEO', durationHours: 120, validityMonths: 12, stages: '' });
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', durationHours: 10, aircraftType: 'A320-NEO', deliveryMode: 'Classroom' });
  const [classroomForm, setClassroomForm] = useState({ name: '', capacity: 20, location: '', equipment: '' });
  const [instructorForm, setInstructorForm] = useState({ name: '', qualification: 'TRI/TRE', email: '', phone: '', base: 'Sector Alpha' });
  const [customerForm, setCustomerForm] = useState({ name: '', type: 'Airline', billingContact: '', email: '' });

  const handleAddSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simForm.name || !simForm.serialNumber) return;
    const newSim: Simulator = {
      id: `sim-${Date.now()}`,
      facility: simForm.facility,
      name: simForm.name,
      model: simForm.model || 'A320-NEO',
      serialNumber: simForm.serialNumber,
      engineType: simForm.engineType || 'CFM LEAP-1A',
      status: simForm.status as any,
      totalHours: 0,
      metrics: { reliability: 100 }
    };
    setSimulators(p => [...p, newSim]);
    onLogAudit('MASTER_CREATE', `Created simulator master entry: ${newSim.name}`);
    setShowAddForm(false);
    setSimForm({ name: '', model: '', serialNumber: '', engineType: '', facility: 'Sector Alpha', status: 'SERVICEABLE' });
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) return;
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      code: courseForm.code,
      name: courseForm.name,
      aircraftType: courseForm.aircraftType,
      durationHours: Number(courseForm.durationHours) || 100,
      validityMonths: Number(courseForm.validityMonths) || 12,
      stages: courseForm.stages ? courseForm.stages.split(',').map(s => s.trim()) : ['Ground School', 'Simulator']
    };
    setCourses(p => [...p, newCourse]);
    onLogAudit('MASTER_CREATE', `Created course master: ${newCourse.name} (${newCourse.code})`);
    setShowAddForm(false);
    setCourseForm({ code: '', name: '', aircraftType: 'A320-NEO', durationHours: 120, validityMonths: 12, stages: '' });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) return;
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      code: subjectForm.code,
      name: subjectForm.name,
      durationHours: Number(subjectForm.durationHours) || 10,
      aircraftType: subjectForm.aircraftType,
      deliveryMode: subjectForm.deliveryMode as any
    };
    setSubjects(p => [...p, newSubject]);
    onLogAudit('MASTER_CREATE', `Created subject master: ${newSubject.name}`);
    setShowAddForm(false);
    setSubjectForm({ code: '', name: '', durationHours: 10, aircraftType: 'A320-NEO', deliveryMode: 'Classroom' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Master Data Management</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">Control the structural parameters of ATMS operations</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : `Add Master`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {(['simulators', 'courses', 'subjects', 'classrooms', 'instructors', 'customers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowAddForm(false); }}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === tab 
                ? 'border-red-600 text-slate-900 bg-red-50/10' 
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic forms */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-slide-up space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Create New {activeTab.slice(0, -1)} entry</p>
          
          {activeTab === 'simulators' && (
            <form onSubmit={handleAddSim} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">FSTD Name *</label>
                <input type="text" placeholder="e.g. A320-SIM-04" value={simForm.name} onChange={e => setSimForm(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Model *</label>
                <input type="text" placeholder="e.g. A320-NEO" value={simForm.model} onChange={e => setSimForm(p => ({ ...p, model: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Serial Number *</label>
                <input type="text" placeholder="e.g. AVI-320-04" value={simForm.serialNumber} onChange={e => setSimForm(p => ({ ...p, serialNumber: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Facility</label>
                <select value={simForm.facility} onChange={e => setSimForm(p => ({ ...p, facility: e.target.value }))} className={selectCls}>
                  <option value="Sector Alpha">Sector Alpha</option>
                  <option value="Sector Beta">Sector Beta</option>
                  <option value="Sector Gamma">Sector Gamma</option>
                </select>
              </div>
              <div className="sm:col-span-2 pt-5">
                <button type="submit" className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  Create Simulator Master →
                </button>
              </div>
            </form>
          )}

          {activeTab === 'courses' && (
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course Code *</label>
                <input type="text" placeholder="e.g. A320-TR" value={courseForm.code} onChange={e => setCourseForm(p => ({ ...p, code: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course Name *</label>
                <input type="text" placeholder="e.g. Airbus A320 Type Rating" value={courseForm.name} onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration (Hours)</label>
                <input type="number" value={courseForm.durationHours} onChange={e => setCourseForm(p => ({ ...p, durationHours: parseInt(e.target.value) || 0 }))} className={inputCls} />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course Stages (Comma-separated)</label>
                <input type="text" placeholder="e.g. Ground School, FTD, LOFT Check, Examination" value={courseForm.stages} onChange={e => setCourseForm(p => ({ ...p, stages: e.target.value }))} className={inputCls} />
              </div>
              <div className="pt-2">
                <button type="submit" className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  Create Course →
                </button>
              </div>
            </form>
          )}

          {activeTab === 'subjects' && (
            <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject Code *</label>
                <input type="text" placeholder="e.g. SYS-A320" value={subjectForm.code} onChange={e => setSubjectForm(p => ({ ...p, code: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject Name *</label>
                <input type="text" placeholder="e.g. Hydralic systems" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Mode</label>
                <select value={subjectForm.deliveryMode} onChange={e => setSubjectForm(p => ({ ...p, deliveryMode: e.target.value }))} className={selectCls}>
                  <option value="Classroom">Classroom</option>
                  <option value="E-Learning">E-Learning</option>
                  <option value="Simulator">Simulator</option>
                  <option value="Briefing">Briefing</option>
                </select>
              </div>
              <div className="pt-5">
                <button type="submit" className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  Create Subject →
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lists */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'simulators' && (
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Simulator Name</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Serial Number</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Facility</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Model</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulators.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-6 py-4 font-black text-slate-900 text-xs">{s.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{s.serialNumber}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{s.facility}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{s.model}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-black uppercase border ${
                        s.status === 'SERVICEABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        s.status === 'AOG' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'courses' && (
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Code</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Course Name</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Aircraft Model</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Duration (Hrs)</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Stages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-6 py-4 font-mono text-red-600 text-xs font-black">{c.code}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-xs">{c.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{c.aircraftType}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{c.durationHours} hrs</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {c.stages.map((stg, idx) => (
                        <span key={idx} className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-[8px] font-black uppercase text-slate-500 rounded">
                          {stg}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'subjects' && (
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Code</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Name</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Aircraft</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{s.code}</td>
                    <td className="px-6 py-4 font-black text-slate-900 text-xs">{s.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{s.durationHours} hrs</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{s.aircraftType}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">
                        {s.deliveryMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MastersView;
