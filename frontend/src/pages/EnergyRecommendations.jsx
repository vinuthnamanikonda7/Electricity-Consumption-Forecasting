import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import {
  Lightbulb,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function EnergyRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({ total_kwh: 0, total_cost: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationService.getRecommendations();
      if (res.success) {
        setRecommendations(res.recommendations);
        setSummary({
          total_kwh: res.total_potential_kwh_savings,
          total_cost: res.total_potential_cost_savings
        });
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setToast({ type: 'error', message: 'Failed to load energy-saving suggestions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleApply = async (id) => {
    try {
      const res = await recommendationService.toggleApplyRecommendation(id);
      if (res.success) {
        setToast({ type: 'success', message: res.message });
        setRecommendations(prev =>
          prev.map(r => (r.id === id ? { ...r, is_applied: res.is_applied } : r))
        );
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update recommendation status.' });
    }
  };

  if (loading) {
    return <Loading text="Generating personalized energy tips..." />;
  }

  const appliedCount = recommendations.filter(r => r.is_applied).length;
  const activeCount = recommendations.length - appliedCount;

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Energy-Saving Recommendations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalized efficiency recommendations calculated specifically for your household appliances and ventilation
          </p>
        </div>

        <Link
          to="/predictions"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>View Prediction Analysis</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Potential Monthly Savings"
          value={summary.total_kwh}
          unit="kWh/month"
          icon={TrendingDown}
          color="emerald"
          subtitle="If all recommendations are applied"
          change="Energy Conservation"
        />

        <StatCard
          title="Estimated Financial Savings"
          value={`$${summary.total_cost}`}
          unit="/month"
          icon={DollarSign}
          color="cyan"
          subtitle="Utility bill reduction"
          change="Cost Reduction"
        />

        <StatCard
          title="Implementation Progress"
          value={`${appliedCount} / ${recommendations.length}`}
          unit="actions"
          icon={ShieldCheck}
          color="amber"
          subtitle={`${activeCount} suggestions awaiting action`}
          change="Action Plan"
        />
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Tailored Conservation Suggestions
          </h2>
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
            {recommendations.length} total recommendations
          </span>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const priorityColors = {
                High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                Low: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              };

              return (
                <div
                  key={rec.id}
                  className={`glass-panel p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                    rec.is_applied
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityColors[rec.priority] || priorityColors.Medium}`}>
                        {rec.priority} Priority Impact
                      </span>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">
                          Save ~{rec.estimated_kwh_savings} kWh
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          (approx. ${rec.estimated_cost_savings}/mo)
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{rec.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      {rec.is_applied ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied to routine
                        </span>
                      ) : (
                        'Ready to implement'
                      )}
                    </span>

                    <button
                      onClick={() => handleToggleApply(rec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        rec.is_applied
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {rec.is_applied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Implemented</span>
                        </>
                      ) : (
                        <span>Mark as Done</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto space-y-3">
            <Lightbulb className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Recommendations Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run your first electricity consumption prediction to generate custom energy conservation recommendations.
            </p>
            <Link
              to="/predictions"
              className="inline-flex items-center space-x-1.5 mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              <span>Run Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
