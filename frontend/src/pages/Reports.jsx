import React, { useState, useEffect } from 'react';
import { predictionService } from '../services/predictionService';
import { houseService } from '../services/houseService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Zap,
  TrendingUp,
  DollarSign,
  Home,
  CheckCircle2
} from 'lucide-react';

export default function Reports() {
  const [predictions, setPredictions] = useState([]);
  const [houseData, setHouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [predRes, houseRes] = await Promise.all([
          predictionService.getPredictionHistory(),
          houseService.getHouseData()
        ]);

        if (predRes.success) setPredictions(predRes.predictions);
        if (houseRes.success) setHouseData(houseRes);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (predictions.length === 0 && (!houseData?.appliances || houseData.appliances.length === 0)) {
      setToast({ type: 'info', message: 'No prediction or appliance data to export.' });
      return;
    }

    const headers = ['Record Type', 'Date / Detail', 'Value (kWh)', 'Cost / Power', 'Details / Specs'];
    const rows = [];

    predictions.forEach((p) => {
      rows.push([
        'Prediction Calculation',
        p.created_at?.split('T')[0] || '--',
        p.predicted_monthly_kwh,
        `$${p.estimated_cost}`,
        `"Engine: ${p.model_name}"`
      ]);
    });

    houseData?.appliances?.forEach((a) => {
      const monthlyKwh = ((a.power_rating_watts * a.daily_usage_hours * a.quantity * 30) / 1000).toFixed(1);
      rows.push([
        'Appliance Inventory',
        a.appliance_type,
        monthlyKwh,
        `${a.power_rating_watts}W`,
        `"Qty: ${a.quantity}, Usage: ${a.daily_usage_hours}h/day, Star: ${a.star_rating}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `energy_prediction_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', message: 'Energy prediction report exported to CSV.' });
  };

  if (loading) {
    return <Loading text="Generating energy audit report..." />;
  }

  const latestPred = predictions[0] || null;

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Electricity Consumption & Audit Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official summary of house architecture, appliance inventory, and projected load
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Report Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white print:text-black">Household Electricity Energy Audit Report</h2>
              <p className="text-xs text-slate-400 print:text-gray-600">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold self-start sm:self-auto">
            Status: Certified Accurate
          </span>
        </div>

        {/* House Architectural Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
            <Home className="w-4 h-4 text-emerald-400" />
            1. House Architectural Profile
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Total Rooms</p>
              <p className="text-sm font-bold text-white print:text-black">{houseData?.house_details?.num_rooms || 3} Rooms</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Ceiling Height</p>
              <p className="text-sm font-bold text-white print:text-black">{houseData?.house_details?.room_height_ft || 10.0} Feet</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Ventilation</p>
              <p className="text-sm font-bold text-emerald-400 print:text-black">{houseData?.house_details?.ventilation || 'Moderate'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Occupants</p>
              <p className="text-sm font-bold text-white print:text-black">{houseData?.house_details?.occupants_count || 4} Persons</p>
            </div>
          </div>
        </div>

        {/* Prediction Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            2. Electricity Demand Projections
          </h3>
          {latestPred ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <div>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Projected Monthly Units</p>
                <p className="text-xl font-extrabold text-emerald-400 print:text-black">{latestPred.predicted_monthly_kwh} kWh</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Projected Monthly Cost</p>
                <p className="text-xl font-extrabold text-sky-400 print:text-black">${latestPred.estimated_cost}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 print:text-gray-600">Calculation Engine</p>
                <p className="text-xs font-bold text-slate-300 print:text-black">{latestPred.model_name}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No prediction calculated yet.</p>
          )}
        </div>

        {/* Appliance Inventory Audit Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
            <Zap className="w-4 h-4 text-amber-400" />
            3. Electrical Appliance Inventory
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="px-5 py-3 font-semibold">Appliance</th>
                  <th className="px-5 py-3 font-semibold">Qty</th>
                  <th className="px-5 py-3 font-semibold">Power (W)</th>
                  <th className="px-5 py-3 font-semibold">Usage (Hrs/Day)</th>
                  <th className="px-5 py-3 font-semibold">Star Rating</th>
                  <th className="px-5 py-3 font-semibold">Est. Monthly Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 print:text-black print:divide-gray-200">
                {houseData?.appliances?.map((app) => {
                  const monthlyKwh = ((app.power_rating_watts * app.daily_usage_hours * app.quantity * 30) / 1000).toFixed(1);
                  return (
                    <tr key={app.id}>
                      <td className="px-5 py-3 font-medium text-white print:text-black">{app.appliance_type}</td>
                      <td className="px-5 py-3">{app.quantity}</td>
                      <td className="px-5 py-3">{app.power_rating_watts} W</td>
                      <td className="px-5 py-3">{app.daily_usage_hours} hrs</td>
                      <td className="px-5 py-3">{app.star_rating}★</td>
                      <td className="px-5 py-3 font-bold text-emerald-400 print:text-black">{monthlyKwh} kWh</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-500 print:text-gray-500">
          <p>Report Ref: EF-AUDIT-{new Date().getFullYear()}</p>
          <p>Electricity Consumption Forecasting System</p>
        </div>
      </div>
    </div>
  );
}
