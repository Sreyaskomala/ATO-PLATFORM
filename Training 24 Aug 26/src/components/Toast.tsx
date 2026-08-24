'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-skyline-500/30 bg-aviation-900/95 text-slate-100';
        let icon = <Info className="w-5 h-5 text-skyline-400 shrink-0" />;

        if (toast.type === 'error') {
          borderClass = 'border-rose-500/50 bg-aviation-900/95 text-rose-100 shadow-glow-rose';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'success') {
          borderClass = 'border-emerald-500/50 bg-aviation-900/95 text-emerald-100 shadow-glow-emerald';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-aviation-900/95 text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-fade-in ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
