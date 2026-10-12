import React from 'react';

export default function StatCard({ title, value, unit = '', icon: Icon, change, subtitle, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-300'
    },
    cyan: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      badge: 'bg-sky-500/10 text-sky-300'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-300'
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badge: 'bg-purple-500/10 text-purple-300'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {value !== undefined && value !== null ? value : '--'}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Status</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${scheme.badge}`}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
