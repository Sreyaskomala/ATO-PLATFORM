import React, { useState } from 'react';
import { LmsContent, Student, User } from '../types';
import { PlayCircle, FileText, CheckCircle2, Award, ExternalLink, Zap } from 'lucide-react';
import { MOCK_LMS_CONTENTS } from '../constants';

interface LmsViewProps {
  students: Student[];
  currentUser: User;
  onLogAudit: (action: string, details: string) => void;
}

const LmsView: React.FC<LmsViewProps> = ({ students, currentUser, onLogAudit }) => {
  const [lmsContent, setLmsContent] = useState<LmsContent[]>(MOCK_LMS_CONTENTS);
  const [activeItem, setActiveItem] = useState<LmsContent | null>(MOCK_LMS_CONTENTS[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartContent = (item: LmsContent) => {
    setActiveItem(item);
    setIsPlaying(true);
    setProgress(0);
    
    // Simulate player progress
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setLmsContent(prev => prev.map(c => {
          if (c.id !== item.id) return c;
          onLogAudit('LMS_COMPLETE', `Cadet completed SCORM e-learning module: ${item.title}`);
          return { ...c, completed: true, score: item.type === 'QUIZ' ? 85 : undefined };
        }));
      }
    }, 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Library Column */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">E-Learning Content Library</h3>
          <p className="text-[10px] text-slate-400 font-bold">SCORM &amp; xAPI Compliant Modules</p>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {lmsContent.map(item => (
            <div 
              key={item.id} 
              onClick={() => { setActiveItem(item); setIsPlaying(false); }}
              className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                activeItem?.id === item.id ? 'bg-slate-50 border-r-4 border-red-500' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  {item.type === 'VIDEO' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </span>
                <div>
                  <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{item.durationMinutes} min · {item.type}</p>
                </div>
              </div>

              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Player Column */}
      <div className="lg:col-span-2 space-y-6">
        {activeItem ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase tracking-widest">
                    {activeItem.type} MODULE
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeItem.title}</h3>
                </div>
                <Award className={`w-10 h-10 ${activeItem.completed ? 'text-emerald-500' : 'text-slate-200'}`} />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-500 text-xs min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
                {isPlaying ? (
                  <div className="w-full max-w-xs space-y-3">
                    <p className="font-bold text-slate-700">Simulating SCORM Interactive Player...</p>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{progress}% Buffering &amp; Logs Syncing</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-12 h-12 text-slate-300" />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700">Ready to Launch Training Package</p>
                      <p className="text-[10px] text-slate-400 max-w-sm">This will start a sandbox player capturing your interaction timestamps and quiz performance metrics directly into your cadet training file.</p>
                    </div>
                    <button 
                      onClick={() => handleStartContent(activeItem)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow"
                    >
                      Start Lesson <ExternalLink className="w-3.5 h-3.5 inline ml-1.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between text-[11px] font-bold text-slate-400">
              <span>Standard: SCORM 2004 4th Edition</span>
              <span>Session Log: xAPI Active</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Module Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LmsView;
