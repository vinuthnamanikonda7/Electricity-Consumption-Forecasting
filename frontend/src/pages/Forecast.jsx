import React, { useState, useEffect } from 'react';
import { forecastService } from '../services/forecastService';
import { consumptionService } from '../services/consumptionService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import {
  TrendingUp,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Forecast() {
  const [horizonDays, setHorizonDays] = useState(7);
  const [windowSize, setWindowSize] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  const [historicalCount, setHistoricalCount] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchHistoricalReadings = async () => {
    try {
      const res = await consumptionService.getReadings({ limit: 100 });
      if (res.success) {
        setHistoricalCount(res.count);
      }
    } catch (err) {
      console.error('Failed to check readings:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchHistoricalReadings();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await consumptionService.seedDemoReadings();
      if (res.success) {
        setToast({
          type: 'success',
          message: `Loaded ${res.count} days of sample meter readings successfully!`
        });
        await fetchHistoricalReadings();
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to seed sample readings.'
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateForecast = async () => {
    if (historicalCount === 0) {
      setToast({
        type: 'error',
        message: 'No historical readings found. Please add readings in the Consumption tab first.'
      });
      return;
    }

    setGenerating(true);
    try {
      const res = await forecastService.generateForecast({
        horizon_days: horizonDays,
        window_size: windowSize
      });

      if (res.success && res.forecast) {
        setForecastResult(res.forecast);
        setToast({
          type: 'success',
          message: `Generated ${horizonDays}-day electricity forecast successfully!`
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Forecast generation failed.';
      setToast({ type: 'error', message: msg });
    } finally {
      setGenerating(false);
    }
  };

  // Combine historical and predicted points into a single timeline series for Recharts
  const buildChartData = () => {
    if (!forecastResult) return [];

    const data = [];

    // 1. Historical points (up to last 14 for clear chart comparison)
    if (forecastResult.historical_comparison) {
      forecastResult.historical_comparison.slice(-14).forEach((h) => {
        data.push({
          date: h.date,
          actual: parseFloat(h.actual_consumption),
          predicted: null
        });
      });
    }

    // 2. Connect the transition point with the last actual value
    if (data.length > 0 && forecastResult.predictions.length > 0) {
      const lastHist = data[data.length - 1];
      // give the last historical point a starting anchor for predicted line
      lastHist.predicted = lastHist.actual;
    }

    // 3. Predicted future points
    forecastResult.predictions.forEach((p) => {
      data.push({
        date: p.date,
        actual: null,
        predicted: parseFloat(p.predicted_consumption),
        lower_bound: parseFloat(p.lower_bound),
        upper_bound: parseFloat(p.upper_bound)
      });
    });

    return data;
  };

  if (loadingInitial) {
    return <Loading text="Checking historical data..." />;
  }

  const chartData = buildChartData();

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Electricity Consumption Forecasting
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate data-driven electricity demand projections using historical moving averages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
            <DatabaseStatus count={historicalCount} />
          </div>

          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            title="Preload 30 days of realistic meter readings to test forecasting"
          >
            {seeding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading Sample Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Load 30-Day Sample Readings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notice Banner if 0 readings */}
      {historicalCount === 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300">No Meter Readings Recorded Yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Moving average time-series forecasting requires historical daily consumption records. You can load 30 days of realistic sample readings instantly or record daily readings manually.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Readings</span>
          </button>
        </div>
      )}

      {/* Forecast Controls Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Forecasting Configuration</h2>
            <p className="text-xs text-slate-400">Configure future horizon timeline and historical window</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Horizon Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Forecast Horizon (Future Period)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Day', days: 1 },
                { label: '7 Days', days: 7 },
                { label: '30 Days', days: 30 }
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setHorizonDays(opt.days)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    horizonDays === opt.days
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Projects demand for the next {horizonDays} day(s).
            </p>
          </div>

          {/* Model Method & Window */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Algorithm & Window Size
            </label>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Moving Average (MA)</p>
                <p className="text-[11px] text-slate-400">Rolling mean of recent {windowSize} readings</p>
              </div>
              <select
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-200 border border-slate-700"
              >
                <option value={3}>3 readings</option>
                <option value={7}>7 readings</option>
                <option value={14}>14 readings</option>
                <option value={30}>30 readings</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Baseline moving average over recent sample window.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={handleGenerateForecast}
              disabled={generating || historicalCount === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Predictions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
            {historicalCount === 0 && (
              <p className="text-[11px] text-amber-400 text-center flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Add readings to unlock forecasting
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Forecast Results View */}
      {forecastResult && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Result Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Forecast Method"
              value={forecastResult.model_name}
              unit=""
              icon={Layers}
              color="emerald"
              subtitle={`Window: ${forecastResult.readings_used} past readings`}
              change="Verified Model"
            />

            <StatCard
              title="Total Forecasted Energy"
              value={forecastResult.total_predicted_consumption}
              unit="kWh"
              icon={Zap}
              color="cyan"
              subtitle={`Over ${forecastResult.horizon_days} day horizon`}
              change="Projected Load"
            />

            <StatCard
              title="Daily Expected Mean"
              value={forecastResult.average_daily_predicted}
              unit="kWh/day"
              icon={TrendingUp}
              color="amber"
              subtitle={`Base MA: ${forecastResult.base_moving_average} kWh`}
              change="Expected Average"
            />

            <StatCard
              title="Forecast Uncertainty"
              value={`±${forecastResult.standard_deviation}`}
              unit="kWh"
              icon={BarChart3}
              color="purple"
              subtitle="Standard Deviation (σ)"
              change="Confidence Range"
            />
          </div>

          {/* Historical vs Forecast Line Chart */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                  Historical vs. Forecasted Electricity Consumption
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual recorded readings (solid green) vs. Moving Average projection (dashed blue)
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Actual Consumption
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" /> Predicted Forecast
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" kWh" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Consumption (kWh)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted Forecast (kWh)"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#38bdf8' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Forecast Points Breakdown Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Predicted Consumption Breakdown by Target Date
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Individual daily projections calculated for your household
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Forecast Date</th>
                    <th className="px-6 py-3.5 font-semibold">Predicted Consumption</th>
                    <th className="px-6 py-3.5 font-semibold">Expected Range (σ)</th>
                    <th className="px-6 py-3.5 font-semibold">Forecasting Model</th>
                    <th className="px-6 py-3.5 font-semibold">Horizon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {forecastResult.predictions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-white">
                        {p.date}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-sky-400 text-sm">
                        {p.predicted_consumption} <span className="text-xs font-normal text-slate-400">kWh</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {p.lower_bound} – {p.upper_bound} kWh
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                          {p.model_name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {p.horizon_days} Day(s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DatabaseStatus({ count }) {
  if (count === 0) {
    return (
      <span className="text-rose-400 flex items-center gap-1 font-medium">
        <AlertTriangle className="w-3.5 h-3.5" /> 0 meter readings (Need 1+)
      </span>
    );
  }
  return (
    <span className="text-emerald-400 flex items-center gap-1 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> {count} historical readings available
    </span>
  );
}
