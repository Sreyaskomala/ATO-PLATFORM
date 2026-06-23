import React, { useState } from 'react';
import { Batch, BatchStatus, Course, Student, User } from '../types';
import { Layers, Play, Pause, CheckCircle2, XCircle, Copy, Plus } from 'lucide-react';

interface BatchesViewProps {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  courses: Course[];
  students: Student[];
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";
const selectCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  setBatches,
  courses,
  students,
  currentUser,
  onLogAudit
}) => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(batches[0] || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBatch, setNewBatch] = useState({ code: '', courseId: 'course-1', customerId: 'cust-1', aircraftType: 'A320-NEO', startDate: '2026-07-01', endDate: '2026-08-15', plannedStrength: 10 });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.code) return;

    // Capacity validation: classroom limit capacity
    if (newBatch.plannedStrength > 25) {
      alert("Validation Error: Planned batch strength exceeds maximum classroom capacity parameters (25 cadets max).");
      return;
    }

    const added: Batch = {
      id: `batch-${Date.now()}`,
      code: newBatch.code,
      courseId: newBatch.courseId,
      customerId: newBatch.customerId,
      aircraftType: newBatch.aircraftType,
      startDate: newBatch.startDate,
      endDate: newBatch.endDate,
      plannedStrength: Number(newBatch.plannedStrength) || 10,
      actualStrength: 0,
      status: BatchStatus.PLANNED,
      studentIds: []
    };
    setBatches(p => [...p, added]);
    setSelectedBatch(added);
    onLogAudit('BATCH_CREATE', `Created batch ${added.code} with planned capacity ${added.plannedStrength}`);
    setShowAddForm(false);
    setNewBatch({ code: '', courseId: 'course-1', customerId: 'cust-1', aircraftType: 'A320-NEO', startDate: '2026-07-01', endDate: '2026-08-15', plannedStrength: 10 });
  };

  const handleUpdateStatus = (batchId: string, status: BatchStatus) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      onLogAudit('BATCH_STATUS_UPDATE', `Batch ${b.code} status transitioned to ${status}`);
      return { ...b, status };
    }));
    
    // Trigger local updates
    setTimeout(() => {
      setSelectedBatch(curr => {
        if (!curr || curr.id !== batchId) return curr;
        return batches.find(b => b.id === batchId) || { ...curr, status };
      });
    }, 50);

    alert(`Batch status updated to ${status}. All associated operational sessions updated.`);
  };

  const handleCloneBatch = (batch: Batch) => {
    const clonedCode = `${batch.code.split('-').slice(0, -1).join('-')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cloned: Batch = {
      ...batch,
      id: `batch-${Date.now()}`,
      code: clonedCode,
      startDate: '2026-08-01',
      endDate: '2026-09-15',
      actualStrength: 0,
      studentIds: [],
      status: BatchStatus.PLANNED
    };
    setBatches(p => [...p, cloned]);
    onLogAudit('BATCH_CLONE', `Cloned batch template from ${batch.code} into ${cloned.code}`);
    setSelectedBatch(cloned);
    alert(`Batch cloned successfully as: ${cloned.code}. Dates set to default template period.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left panel: Batch List */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Training Batches</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
          >
            + Create
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {showAddForm ? (
            <form onSubmit={handleCreateBatch} className="p-5 space-y-3.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Create New Batch</p>
              <input type="text" placeholder="Batch Code *" value={newBatch.code} onChange={e => setNewBatch(p => ({ ...p, code: e.target.value }))} className={inputCls} required />
              <select value={newBatch.courseId} onChange={e => setNewBatch(p => ({ ...p, courseId: e.target.value }))} className={selectCls}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Planned Strength *" value={newBatch.plannedStrength} onChange={e => setNewBatch(p => ({ ...p, plannedStrength: parseInt(e.target.value) || 0 }))} className={inputCls} required />
              <input type="date" value={newBatch.startDate} onChange={e => setNewBatch(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
              <input type="date" value={newBatch.endDate} onChange={e => setNewBatch(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                Submit Batch →
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                Cancel
              </button>
            </form>
          ) : batches.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No batches defined</div>
          ) : (
            batches.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBatch(b)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                  selectedBatch?.id === b.id ? 'bg-slate-50 border-r-4 border-red-500' : 'hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900 text-xs font-mono">{b.code}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{courses.find(c => c.id === b.courseId)?.name || 'Course'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  b.status === BatchStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' :
                  b.status === BatchStatus.SUSPENDED ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  b.status === BatchStatus.COMPLETED ? 'bg-slate-900 text-white border-slate-900' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Batch Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedBatch ? (
          <div className="space-y-6">
            {/* Overview Detail Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Batch Specifications</span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1 font-mono">{selectedBatch.code}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Sponsor Profile: {selectedBatch.customerId}</p>
                </div>

                <div className="flex gap-1.5 shrink-0 flex-wrap">
                  {selectedBatch.status === BatchStatus.PLANNED && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedBatch.id, BatchStatus.ACTIVE)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Batch
                    </button>
                  )}
                  {selectedBatch.status === BatchStatus.ACTIVE && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(selectedBatch.id, BatchStatus.SUSPENDED)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        <Pause className="w-3.5 h-3.5" /> Suspend
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedBatch.id, BatchStatus.COMPLETED)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}
                  {selectedBatch.status === BatchStatus.SUSPENDED && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedBatch.id, BatchStatus.ACTIVE)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Resume
                    </button>
                  )}
                  <button 
                    onClick={() => handleCloneBatch(selectedBatch)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Clone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</span>
                  <span className="font-bold text-slate-800">{selectedBatch.startDate}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">End Date</span>
                  <span className="font-bold text-slate-800">{selectedBatch.endDate}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Cadets Strength</span>
                  <span className="font-bold text-slate-800">{selectedBatch.studentIds.length} / {selectedBatch.plannedStrength} max</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Aircraft Segment</span>
                  <span className="font-bold text-slate-800">{selectedBatch.aircraftType}</span>
                </div>
              </div>
            </div>

            {/* Enrolled students list */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Enrolled Cadets roster</h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {selectedBatch.studentIds.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No students currently assigned to this batch.</div>
                ) : (
                  selectedBatch.studentIds.map(sid => {
                    const student = students.find(s => s.id === sid);
                    if (!student) return null;
                    return (
                      <div key={sid} className="px-6 py-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400">{student.employeeNo}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                          student.status === 'HOLD' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Batch Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchesView;
