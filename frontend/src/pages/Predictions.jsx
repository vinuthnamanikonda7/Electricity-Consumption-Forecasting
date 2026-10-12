import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { predictionService } from '../services/predictionService';
import { houseService } from '../services/houseService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import {
  TrendingUp,
  Zap,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  Home,
  Lightbulb,
  ArrowRight,
  Activity,
  Layers,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Predictions() {
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [houseData, setHouseData] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [toast, setToast] = useState(null);

  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#a855f7', '#ec4899', '#6366f1', '#14b8a6', '#84cc16'];

  const loadData = async () => {
    try {
      const [histRes, houseRes] = await Promise.all([
        predictionService.getPredictionHistory(),
        houseService.getHouseData()
      ]);

      if (histRes.success && histRes.predictions.length > 0) {
        setHistory(histRes.predictions);
        setLatestPrediction(histRes.predictions[0]);
      }
      if (houseRes.success) {
        setHouseData(houseRes);
      }
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPrediction = async () => {
    if (!houseData?.appliances || houseData.appliances.length === 0) {
      setToast({
        type: 'error',
        message: 'No appliances configured. Please add appliances in the House Details tab first.'
      });
      return;
    }

    setCalculating(true);
    try {
      const res = await predictionService.calculatePrediction('Manual calculation run');
      if (res.success && res.prediction) {
        setLatestPrediction(res.prediction);
        setToast({ type: 'success', message: 'New prediction computed successfully!' });
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to compute prediction.';
      setToast({ type: 'error', message: msg });
    } finally {
      setCalculating(false);
    }
  };

  if (loadingInitial) {
    return <Loading text="Loading energy predictions..." />;
  }

  // Format category breakdown for Pie & Bar Chart
  const pieData = latestPrediction?.category_breakdown
    ? Object.entries(latestPrediction.category_breakdown).map(([name, value]) => ({
        name,
        value: parseFloat(value)
      }))
    : [];

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Electricity Consumption Prediction
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Physics-appliance hybrid simulation incorporating room height and ventilation dynamics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/house"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Edit House & Appliances</span>
          </Link>

          <button
            onClick={handleRunPrediction}
            disabled={calculating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {calculating ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{latestPrediction ? 'Re-calculate Prediction' : 'Generate Prediction'}</span>
          </button>
        </div>
      </div>

      {latestPrediction ? (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Predicted Monthly Consumption"
              value={latestPrediction.predicted_monthly_kwh}
              unit="kWh/mo"
              icon={Zap}
              color="emerald"
              subtitle={`Daily average: ${(latestPrediction.predicted_monthly_kwh / 30).toFixed(1)} kWh/day`}
              change="Estimated Load"
            />

            <StatCard
              title="Estimated Monthly Bill"
              value={`$${latestPrediction.estimated_cost}`}
              unit=""
              icon={DollarSign}
              color="cyan"
              subtitle="Progressive tiered utility tariff"
              change="Projected Cost"
            />

            <StatCard
              title="Ventilation Influence"
              value={`${((latestPrediction.ventilation_factor || 1.0) * 100 - 100).toFixed(0)}%`}
              unit="HVAC variance"
              icon={Wind}
              color={latestPrediction.ventilation_factor > 1 ? 'amber' : 'emerald'}
              subtitle={`House rating: ${houseData?.house_details?.ventilation || 'Moderate'}`}
              change="Thermal Efficiency"
            />

            <StatCard
              title="Active Appliances Tracked"
              value={houseData?.appliances?.length || 0}
              unit="units"
              icon={Layers}
              color="purple"
              subtitle={`${houseData?.house_details?.num_rooms || 3} rooms configured`}
              change="Inventory Profile"
            />
          </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Breakdown Donut Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  Appliance Category Load Share
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Energy consumption distribution across categories</p>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} kWh`, 'Monthly']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category kWh Bar Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Monthly kWh Demand by Category
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Identify highest energy drawing segments</p>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickFormatter={(str) => str.split(' ')[0]} />
                    <YAxis stroke="#64748b" fontSize={10} unit=" kWh" />
                    <Tooltip
                      formatter={(val) => [`${val} kWh`, 'Monthly Demand']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Saving Recommendations Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Personalized Energy-Saving Recommendations Generated</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  We identified multiple opportunities to reduce your monthly bill based on your high-load appliances.
                </p>
              </div>
            </div>

            <Link
              to="/recommendations"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all flex-shrink-0"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No Prediction Run Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ensure your house dimensions and electrical appliances are entered, then run your first simulation to calculate estimated monthly electricity units and billing.
          </p>
          <button
            onClick={handleRunPrediction}
            disabled={calculating}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            Run Electricity Prediction
          </button>
        </div>
      )}
    </div>
  );
}
