
import React from 'react';
import { Simulator, SimulatorStatus } from '../types';
import { Activity, Wrench, AlertCircle, Plane, Zap, MapPin } from 'lucide-react';

interface SimulatorCardProps {
  simulator: Simulator;
  onClick?: () => void;
}

const SimulatorCard: React.FC<SimulatorCardProps> = ({ simulator, onClick }) => {
  const getIcon = () => {
    switch (simulator.status) {
      case SimulatorStatus.SERVICEABLE: return <Activity className="w-5 h-5 text-emerald-500" />;
      case SimulatorStatus.UNSERVICEABLE: return <AlertCircle className="w-5 h-5 text-red-500" />;
      case SimulatorStatus.MAINTENANCE: return <Wrench className="w-5 h-5 text-amber-500" />;
      case SimulatorStatus.AOG: return <Zap className="w-5 h-5 text-red-600" />;
      default: return <Plane className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (simulator.status) {
      case SimulatorStatus.SERVICEABLE: return 'bg-emerald-500';
      case SimulatorStatus.UNSERVICEABLE: return 'bg-red-500';
      case SimulatorStatus.MAINTENANCE: return 'bg-amber-500';
      case SimulatorStatus.AOG: return 'bg-slate-900';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] p-7 border border-slate-200 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5 hover:-translate-y-1 cursor-pointer overflow-hidden relative"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 ${getStatusColor()}`}></div>

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{simulator.name}</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${simulator.status === SimulatorStatus.SERVICEABLE ? 'animate-pulse' : ''}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{simulator.status}</span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-red-50 transition-colors">
          {getIcon()}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reliability Index</p>
            <p className="text-xl font-black text-slate-800 tracking-tighter">{simulator.metrics.reliability}%</p>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
               <MapPin className="w-3 h-3 text-red-600" /> {simulator.facility}
             </div>
             <p className="text-[9px] font-bold text-slate-400">{simulator.serialNumber}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{simulator.model}</span>
           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-red-600 font-black text-[10px] uppercase tracking-widest">
             Release <ChevronRight className="w-3 h-3" />
           </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
);

export default SimulatorCard;
