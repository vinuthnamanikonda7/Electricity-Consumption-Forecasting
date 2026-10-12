import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
    error: 'bg-rose-950/90 border-rose-500/30 text-rose-100',
    info: 'bg-sky-950/90 border-sky-500/30 text-sky-100'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-bounce-short max-w-md">
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${bgStyles[type] || bgStyles.info}`}>
        {icons[type] || icons.info}
        <p className="text-sm font-medium pr-2">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
