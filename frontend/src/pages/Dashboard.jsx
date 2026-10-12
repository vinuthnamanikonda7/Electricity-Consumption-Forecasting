import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { houseService } from '../services/houseService';
import { predictionService } from '../services/predictionService';
import { recommendationService } from '../services/recommendationService';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  Zap,
  TrendingUp,
  Activity,
  DollarSign,
  Home,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [houseData, setHouseData] = useState(null);
  const [latestPred, setLatestPred] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, houseRes, predRes, recRes] = await Promise.all([
        dashboardService.getSummary().catch(() => ({ success: false })),
        houseService.getHouseData().catch(() => ({ success: false })),
        predictionService.getPredictionHistory().catch(() => ({ success: false })),
        recommendationService.getRecommendations().catch(() => ({ success: false }))
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (houseRes.success) setHouseData(houseRes);
      if (predRes.success && predRes.predictions?.length > 0) setLatestPred(predRes.predictions[0]);
      if (recRes.success) setRecommendations(recRes.recommendations);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Loading dashboard metrics..." />;
  }

  const hasAppliances = houseData?.appliances?.length > 0;

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Household Energy Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time overview of your home energy profile, consumption predictions, and saving tips
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/house"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Manage Appliances</span>
          </Link>

          <Link
            to="/predictions"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Load</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Predicted Monthly Units"
          value={latestPred ? latestPred.predicted_monthly_kwh : '--'}
          unit={latestPred ? 'kWh' : ''}
          icon={Zap}
          color="emerald"
          subtitle={latestPred ? `Est. Cost: $${latestPred.estimated_cost}/mo` : 'Run prediction simulation'}
          change={latestPred ? 'Calculated' : 'Pending'}
        />

        <StatCard
          title="House Ventilation"
          value={houseData?.house_details?.ventilation || 'Moderate'}
          unit=""
          icon={Home}
          color={houseData?.house_details?.ventilation === 'Good' ? 'emerald' : houseData?.house_details?.ventilation === 'Poor' ? 'amber' : 'cyan'}
          subtitle={`${houseData?.house_details?.num_rooms || 3} rooms (${houseData?.house_details?.room_height_ft || 10}ft ceiling)`}
          change="Thermal Quality"
        />

        <StatCard
          title="Tracked Appliances"
          value={houseData?.appliances?.length || 0}
          unit="devices"
          icon={Layers}
          color="cyan"
          subtitle="Configured in house inventory"
          change="Appliance Profile"
        />

        <StatCard
          title="Saving Opportunities"
          value={recommendations.length}
          unit="tips"
          icon={Lightbulb}
          color="amber"
          subtitle="Actionable energy-saving tips"
          change="Optimization"
        />
      </div>

      {/* House & Appliance Quick Setup Callout if empty */}
      {!hasAppliances && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-emerald-500/10 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Complete Your House & Appliance Profile</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add your household rooms, ventilation, and appliances to generate accurate electricity predictions.
              </p>
            </div>
          </div>

          <Link
            to="/house"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <span>Configure House Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Predictions & Tips Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Appliance Category Energy Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Predicted Energy Demand by Appliance Category
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Calculated monthly energy load breakdown (kWh)</p>
            </div>
            <Link to="/predictions" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <span>View Predictions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {latestPred?.category_breakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Object.entries(
                    typeof latestPred.category_breakdown === 'object'
                      ? latestPred.category_breakdown
                      : JSON.parse(latestPred.category_breakdown || '{}')
                  ).map(([cat, val]) => ({
                    category: cat,
                    kwh: typeof val === 'object' ? val.kwh : val
                  }))}
                >
                  <defs>
                    <linearGradient id="dashColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" kWh" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="kwh" name="Monthly kWh" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#dashColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <TrendingUp className="w-8 h-8 opacity-40 text-emerald-400" />
                <p className="text-xs">No prediction calculation run yet.</p>
                <Link to="/predictions" className="text-xs text-emerald-400 hover:underline">Calculate energy prediction</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Top Recommendations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Top Saving Tips
              </h2>
              <Link to="/recommendations" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                See All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400">{rec.priority} Priority</span>
                    <span className="text-[10px] font-bold text-emerald-400">Save ~{rec.estimated_kwh_savings} kWh</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{rec.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{rec.description}</p>
                </div>
              ))}

              {recommendations.length === 0 && (
                <p className="text-xs text-slate-500 italic py-8 text-center">
                  Configure appliances to receive personalized saving tips.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1"
            >
              <span>Explore All Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
