import React, { useState } from 'react';
import { Question, Student, ExamResult, User, UserRole } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { HelpCircle, Award, CheckCircle, Clock, FileText, ChevronRight, PenTool } from 'lucide-react';
import SignaturePad from './SignaturePad';

interface ExamsViewProps {
  students: Student[];
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const selectCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";

const ExamsView: React.FC<ExamsViewProps> = ({ students, currentUser, onLogAudit }) => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'oral' | 'bank'>('mcq');
  
  // MCQ Graded Exam simulation state
  const [selectedStudent, setSelectedStudent] = useState<string>(students[0]?.id || '');
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Oral exam state
  const [oralStudent, setOralStudent] = useState<string>(students[0]?.id || '');
  const [oralItems, setOralItems] = useState([
    { id: '1', topic: 'Pre-flight Weight & Balance calculations', passed: true, notes: 'Accurate calculations.' },
    { id: '2', topic: 'Emergency Descent checklist recovery', passed: true, notes: 'Quick responses.' },
    { id: '3', topic: 'Adverse weather navigation / Windshear recovery', passed: false, notes: 'Delayed throttle response.' }
  ]);
  const [oralSig, setOralSig] = useState('');
  const [isOralSubmitted, setIsOralSubmitted] = useState(false);

  const startMcqExam = () => {
    setIsExamActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setExamResult(null);
    onLogAudit('EXAM_START', `Cadet ${students.find(s => s.id === selectedStudent)?.name} started A320 MCQ Examination`);
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    setSelectedAnswers(p => ({ ...p, [qIdx]: optIdx }));
  };

  const submitMcqExam = () => {
    let score = 0;
    MOCK_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score += 1;
      }
    });

    const percent = Math.round((score / MOCK_QUESTIONS.length) * 100);
    const passed = percent >= 75;
    const student = students.find(s => s.id === selectedStudent);
    
    const result: ExamResult = {
      id: `res-${Date.now()}`,
      studentId: selectedStudent,
      studentName: student?.name || 'Cadet',
      subjectId: 'subj-1',
      subjectName: 'A320 Systems & CRM',
      date: new Date().toLocaleDateString(),
      score: percent,
      passMark: 75,
      passed
    };

    setExamResult(result);
    setIsExamActive(false);
    onLogAudit('EXAM_SUBMIT', `Cadet ${result.studentName} graded: ${result.score}% (Passed: ${result.passed})`);
  };

  const handleSubmitOral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oralSig) {
      alert("TRE Examiner signature is required to validate the oral check sheet.");
      return;
    }
    setIsOralSubmitted(true);
    const student = students.find(s => s.id === oralStudent);
    onLogAudit('ORAL_EXAM_SUBMIT', `TRE submitted oral check gradesheet for cadet ${student?.name}`);
    alert("Oral gradesheet signed off and archived.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Examinations & Assessment Engine</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">DGCA CAR / EASA compliant computer-based exam module</p>
        </div>
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl gap-1 shrink-0">
          <button onClick={() => { setActiveTab('mcq'); setIsExamActive(false); setExamResult(null); }} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'mcq' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>MCQ Exam</button>
          <button onClick={() => { setActiveTab('oral'); setIsOralSubmitted(false); setOralSig(''); }} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'oral' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Oral Check</button>
          <button onClick={() => { setActiveTab('bank'); }} className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Question Bank</button>
        </div>
      </div>

      {activeTab === 'mcq' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          {!isExamActive && !examResult ? (
            <div className="space-y-6 text-center py-8">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Launch Graded Systems Examination</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Select cadet profile below to initialize the random question generator. The pass mark threshold is 75%.</p>
              </div>
              <div className="max-w-xs mx-auto">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest text-left mb-1.5 px-1">Select Candidate</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className={selectCls}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.employeeNo})</option>)}
                </select>
              </div>
              <button onClick={startMcqExam} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                Generate Exam Paper →
              </button>
            </div>
          ) : isExamActive ? (
            <div className="space-y-6">
              {/* Question card */}
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                <span>A320 SYSTEMS EXAM</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timed Sandbox</span>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}</p>
                <h4 className="text-sm font-black text-slate-900 leading-relaxed">{MOCK_QUESTIONS[currentQuestionIdx]?.text}</h4>
                
                <div className="space-y-2">
                  {MOCK_QUESTIONS[currentQuestionIdx]?.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(currentQuestionIdx, oIdx)}
                        className={`w-full text-left px-5 py-4 border rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected ? 'border-red-500 bg-red-50/10 text-red-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(p => p - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30"
                >
                  Previous
                </button>
                {currentQuestionIdx < MOCK_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(p => p + 1)}
                    className="px-4 py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={submitMcqExam}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    Submit Exam Paper
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center py-8">
              <Award className={`w-14 h-14 ${examResult?.passed ? 'text-emerald-500' : 'text-rose-500'} mx-auto`} />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {examResult?.passed ? 'Examination Passed!' : 'Did not meet passing score'}
                </h3>
                <p className="text-xs text-slate-400">Candidate: {examResult?.studentName}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-xs mx-auto grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Score Achieved</span>
                  <span className={`text-2xl font-black italic ${examResult?.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{examResult?.score}%</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Requirement</span>
                  <span className="text-2xl font-black text-slate-800 italic">{examResult?.passMark}%</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setExamResult(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'oral' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <FileText className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Digital Oral check gradesheet</h3>
              <p className="text-[9px] text-slate-400 font-bold">Standardized oral check rubrics verified by Type Rating Examiners (TRE)</p>
            </div>
          </div>

          {isOralSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Oral Check Results Signed off &amp; Saved Successfully</p>
              <button onClick={() => setIsOralSubmitted(false)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Record Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmitOral} className="space-y-6">
              <div className="max-w-xs">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Candidate Cadet</label>
                <select value={oralStudent} onChange={e => setOralStudent(e.target.value)} className={selectCls}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Rubric items */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Evaluation Matrix</p>
                {oralItems.map((item, idx) => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">{item.topic}</p>
                      <input 
                        type="text" placeholder="Remarks..." value={item.notes} 
                        onChange={e => { const u = [...oralItems]; u[idx].notes = e.target.value; setOralItems(u); }}
                        className="bg-transparent border-none text-[11px] font-semibold text-slate-400 outline-none w-full placeholder:text-slate-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { const u = [...oralItems]; u[idx].passed = true; setOralItems(u); }}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border ${
                          item.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => { const u = [...oralItems]; u[idx].passed = false; setOralItems(u); }}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border ${
                          !item.passed ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Fail
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <SignaturePad onSave={dataUrl => setOralSig(dataUrl)} label="TRE Examiner Digital Signature" />
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow transition-all">
                Submit signed gradesheet
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Question Content</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Options</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Difficulty</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Correct Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {MOCK_QUESTIONS.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{q.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-[280px]" title={q.text}>{q.text}</td>
                    <td className="px-6 py-4 text-slate-500 leading-relaxed font-semibold">
                      {q.options.map((opt, i) => (
                        <div key={i}>• {opt}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black border ${
                        q.difficulty === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{q.options[q.answerIndex]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsView;
