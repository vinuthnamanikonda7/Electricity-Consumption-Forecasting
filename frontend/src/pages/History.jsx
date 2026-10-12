import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { predictionService } from '../services/predictionService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  History as HistoryIcon,
  Trash2,
  Calendar,
  Zap,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await predictionService.getPredictionHistory();
      if (res.success) {
        setPredictions(res.predictions || []);
      }
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
      setToast({ type: 'error', message: 'Failed to retrieve prediction history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await predictionService.deletePrediction(id);
      setToast({ type: 'success', message: 'Prediction record deleted successfully.' });
      setDeleteConfirmId(null);
      fetchHistory();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete prediction entry.' });
    }
  };

  const filteredPredictions = predictions.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.created_at?.toLowerCase().includes(q) ||
      p.model_name?.toLowerCase().includes(q) ||
      String(p.predicted_monthly_kwh).includes(q) ||
      String(p.estimated_cost).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prediction History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View past electricity consumption calculations and appliance forecasts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/predictions"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Calculate New Prediction</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      {predictions.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search date, kWh, or cost..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Total Saved Calculations: <strong className="text-white">{predictions.length}</strong>
          </span>
        </div>
      )}

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loading text="Loading prediction history..." />
          </div>
        ) : filteredPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Calculation Date</th>
                  <th className="px-6 py-3.5 font-semibold">Predicted Monthly Load</th>
                  <th className="px-6 py-3.5 font-semibold">Estimated Monthly Bill</th>
                  <th className="px-6 py-3.5 font-semibold">Calculation Engine</th>
                  <th className="px-6 py-3.5 font-semibold">House Factor</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredPredictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 text-sm">
                      {parseFloat(p.predicted_monthly_kwh).toFixed(2)}{' '}
                      <span className="text-xs font-normal text-slate-400">kWh</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ₹{parseFloat(p.estimated_cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3" />
                        {p.model_name || 'Physics-Appliance Hybrid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {p.load_factor ? `${p.load_factor}x factor` : '1.00x factor'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirmId === p.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[11px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete calculation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Prediction History Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? 'No prediction records matched your search query.'
                : 'You have not run any electricity consumption calculations yet. Add your appliances and calculate your monthly projection.'}
            </p>
            <Link
              to="/predictions"
              className="inline-flex items-center space-x-1.5 mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <span>Go to Consumption Predictions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
