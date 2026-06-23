import React, { useState } from 'react';
import { Student, StudentDocument, VerificationStatus, DocumentType, User, UserRole } from '../types';
import { Users, FileText, AlertTriangle, ShieldCheck, Check, X, ShieldAlert, UploadCloud, Info } from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";
const selectCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  setStudents,
  currentUser,
  onLogAudit
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', employeeNo: '', dob: '', nationality: 'Indian', email: '', company: 'Air India Express Limited', aircraftType: 'A320-NEO', batchId: 'batch-1' });

  // Filtered student list
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.employeeNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.employeeNo) return;
    const added: Student = {
      id: `stud-${Date.now()}`,
      employeeNo: newStudent.employeeNo,
      name: newStudent.name,
      dob: newStudent.dob || '1995-01-01',
      nationality: newStudent.nationality,
      email: newStudent.email || `${newStudent.name.toLowerCase().replace(/ /g, '')}@company.com`,
      company: newStudent.company,
      aircraftType: newStudent.aircraftType,
      batchId: newStudent.batchId,
      status: 'ACTIVE',
      documents: [
        { id: `doc-${Date.now()}-1`, type: DocumentType.LICENSE, name: 'Initial License Subm.', expiryDate: '2028-12-31', status: VerificationStatus.PENDING },
        { id: `doc-${Date.now()}-2`, type: DocumentType.MEDICAL, name: 'DGCA Medical Subm.', expiryDate: '2027-01-01', status: VerificationStatus.PENDING }
      ],
      competencies: { 'Knowledge': 3, 'CRM': 3, 'Flight Path Mgt': 3, 'Problem Solving': 3 }
    };
    setStudents(p => [...p, added]);
    onLogAudit('STUDENT_CREATE', `Enrolled student: ${added.name} (EMP: ${added.employeeNo})`);
    setSelectedStudent(added);
    setShowAddForm(false);
    setNewStudent({ name: '', employeeNo: '', dob: '', nationality: 'Indian', email: '', company: 'Air India Express Limited', aircraftType: 'A320-NEO', batchId: 'batch-1' });
  };

  const handleVerifyDocument = (studentId: string, docId: string, status: VerificationStatus, reason?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const updatedDocs = s.documents.map(d => {
        if (d.id !== docId) return d;
        return {
          ...d,
          status,
          verifiedAt: status === VerificationStatus.VERIFIED ? new Date().toLocaleDateString() : undefined,
          verifiedBy: status === VerificationStatus.VERIFIED ? currentUser.name : undefined,
          rejectionReason: status === VerificationStatus.REJECTED ? reason : undefined
        };
      });

      // Check if student should be put on HOLD due to document expiry/rejection
      const hasExpiredOrRejected = updatedDocs.some(d => {
        const isExpired = new Date(d.expiryDate) < new Date('2026-06-21');
        return d.status === VerificationStatus.REJECTED || (d.status === VerificationStatus.VERIFIED && isExpired);
      });

      const nextStatus = hasExpiredOrRejected ? 'HOLD' : 'ACTIVE';
      onLogAudit('DOCUMENT_VERIFY', `Document verified status updated to ${status} for student: ${s.name}`);

      return { ...s, documents: updatedDocs, status: nextStatus as any };
    }));

    // Update selected student reference
    setTimeout(() => {
      setSelectedStudent(curr => {
        if (!curr || curr.id !== studentId) return curr;
        const fresh = students.find(s => s.id === studentId);
        return fresh || curr;
      });
    }, 50);
  };

  const handleOverrideHold = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      onLogAudit('HOLD_OVERRIDE', `Manual bypass of training hold for student: ${s.name} by ${currentUser.name}`);
      return { ...s, status: 'ACTIVE' };
    }));
    alert("Training hold bypassed. Logging audit trail entry...");
  };

  const isQualityDeskOrAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.QUALITY_MANAGER || currentUser.role === UserRole.OPERATIONS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left panel: student roster */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Trainee Database</h3>
            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{students.length} Cadets</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-400"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-black"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {showAddForm ? (
            <form onSubmit={handleAddStudent} className="p-5 space-y-3.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrol New Student</p>
              <input type="text" placeholder="Full Name *" value={newStudent.name} onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
              <input type="text" placeholder="Employee ID *" value={newStudent.employeeNo} onChange={e => setNewStudent(p => ({ ...p, employeeNo: e.target.value }))} className={inputCls} required />
              <input type="date" placeholder="Date of Birth" value={newStudent.dob} onChange={e => setNewStudent(p => ({ ...p, dob: e.target.value }))} className={inputCls} />
              <input type="text" placeholder="Nationality" value={newStudent.nationality} onChange={e => setNewStudent(p => ({ ...p, nationality: e.target.value }))} className={inputCls} />
              <select value={newStudent.company} onChange={e => setNewStudent(p => ({ ...p, company: e.target.value }))} className={selectCls}>
                <option value="Air India Express Limited">Air India Express Limited</option>
                <option value="SpiceJet Limited">SpiceJet Limited</option>
                <option value="Akasa Air">Akasa Air</option>
              </select>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                Enrol Cadet →
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all">
                Cancel
              </button>
            </form>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No trainees found</div>
          ) : (
            filteredStudents.map(student => {
              const hasHold = student.status === 'HOLD';
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                    selectedStudent?.id === student.id ? 'bg-slate-50 border-r-4 border-red-500' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{student.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{student.employeeNo} · {student.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    hasHold ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    student.status === 'GRADUATED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {student.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: detail profile & document repository */}
      <div className="lg:col-span-2 space-y-6 h-[650px] overflow-y-auto pr-1">
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Trainee Profile Card</span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">{selectedStudent.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Emp ID: {selectedStudent.employeeNo} · Company Sponsor: {selectedStudent.company}</p>
                </div>
                
                {selectedStudent.status === 'HOLD' && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[9px] font-black uppercase text-rose-700">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> Compliance Hold
                    </span>
                    {isQualityDeskOrAdmin && (
                      <button 
                        onClick={() => handleOverrideHold(selectedStudent.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        Override Hold
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Nationality</span>
                  <span className="font-bold text-slate-800">{selectedStudent.nationality}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</span>
                  <span className="font-bold text-slate-800">{selectedStudent.dob}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Aircraft Type</span>
                  <span className="font-bold text-slate-800">{selectedStudent.aircraftType}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Assigned Batch</span>
                  <span className="font-bold text-slate-800">{selectedStudent.batchId}</span>
                </div>
              </div>
            </div>

            {/* Document Repository */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Regulatory Documents</h3>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedStudent.documents.map(doc => {
                  const isExpired = new Date(doc.expiryDate) < new Date('2026-06-21');
                  return (
                    <div key={doc.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">
                            {doc.type}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{doc.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          Expires: <span className={isExpired ? 'text-red-500 font-extrabold' : 'text-slate-500'}>{doc.expiryDate} {isExpired && ' (Expired!)'}</span>
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-[9px] text-rose-600 font-bold leading-none bg-rose-50 border border-rose-100 p-1.5 rounded mt-1">
                            Rejection Note: "{doc.rejectionReason}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status label */}
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                          doc.status === VerificationStatus.VERIFIED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          doc.status === VerificationStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status}
                        </span>

                        {/* Verification controls */}
                        {isQualityDeskOrAdmin && doc.status === VerificationStatus.PENDING && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleVerifyDocument(selectedStudent.id, doc.id, VerificationStatus.VERIFIED)}
                              className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all"
                              title="Approve / Verify"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter Rejection Reason:") || "Document failed readability verification.";
                                handleVerifyDocument(selectedStudent.id, doc.id, VerificationStatus.REJECTED, reason);
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all"
                              title="Reject / Flag"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Competency Radar Heatmap */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Competency Heatmap</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(selectedStudent.competencies).map(([dimension, score]) => (
                  <div key={dimension} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{dimension}</span>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`w-2 h-6 rounded-sm ${
                            i < score 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="block text-xs font-black text-slate-800 mt-2">{score} / 5</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Cadet Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsView;
