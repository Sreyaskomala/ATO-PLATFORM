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
        let borderClass = 'border-slate-200 dark:border-skyline-500/30 bg-white/95 dark:bg-aviation-900/95 text-slate-900 dark:text-slate-100 shadow-lg dark:shadow-none';
        let icon = <Info className="w-5 h-5 text-skyline-500 dark:text-skyline-400 shrink-0" />;

        if (toast.type === 'error') {
          borderClass = 'border-rose-200 dark:border-rose-500/50 bg-rose-50/95 dark:bg-aviation-900/95 text-rose-900 dark:text-rose-100 shadow-md dark:shadow-glow-rose';
          icon = <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />;
        } else if (toast.type === 'success') {
          borderClass = 'border-emerald-200 dark:border-emerald-500/50 bg-emerald-50/95 dark:bg-aviation-900/95 text-emerald-900 dark:text-emerald-100 shadow-md dark:shadow-glow-emerald';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 dark:border-amber-500/50 bg-amber-50/95 dark:bg-aviation-900/95 text-amber-900 dark:text-amber-100 shadow-md';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl transition-all animate-fadeIn ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
