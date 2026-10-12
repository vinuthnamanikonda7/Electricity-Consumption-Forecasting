import React, { useState } from 'react';
import Toast from '../components/Toast';
import {
  Settings as SettingsIcon,
  Zap,
  Bell,
  Database,
  Shield,
  CheckCircle2,
  Save,
  Server,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const [defaultUnit, setDefaultUnit] = useState(localStorage.getItem('pref_unit') || 'kWh');
  const [defaultHorizon, setDefaultHorizon] = useState(localStorage.getItem('pref_horizon') || '7');
  const [alertHighUsage, setAlertHighUsage] = useState(true);
  const [toast, setToast] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('pref_unit', defaultUnit);
    localStorage.setItem('pref_horizon', defaultHorizon);
    setToast({ type: 'success', message: 'Preferences saved successfully!' });
  };

  const handleClearCache = () => {
    localStorage.removeItem('pref_unit');
    localStorage.removeItem('pref_horizon');
    setToast({ type: 'info', message: 'Local UI preferences cleared.' });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize forecasting parameters, default units, and system diagnostics
        </p>
      </div>

      {/* Preferences Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">General Application Preferences</h2>
            <p className="text-xs text-slate-400">Configure default units and forecasting parameters</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Preferred Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Default Energy Unit
              </label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="kWh">Kilowatt-hour (kWh) - Standard Household</option>
                <option value="MWh">Megawatt-hour (MWh) - Industrial Scale</option>
                <option value="Units">Standard Units</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Applied as the default measurement unit when adding new readings.
              </p>
            </div>

            {/* Default Horizon */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Default Forecast Horizon
              </label>
              <select
                value={defaultHorizon}
                onChange={(e) => setDefaultHorizon(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1 Day Ahead (24-Hour Horizon)</option>
                <option value="7">7 Days Ahead (Weekly Horizon)</option>
                <option value="30">30 Days Ahead (Monthly Horizon)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Initial timeline selected when opening the forecasting page.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleClearCache}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Security & Privacy Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Account Security & Privacy</h2>
            <p className="text-xs text-slate-400">Security parameters and session protection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">Authentication Mode</p>
            <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 2-Factor Email OTP
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Verified Brevo Email Delivery</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">Data Encryption</p>
            <p className="text-sm font-bold text-sky-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> End-to-End Secure
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Bcrypt password hashing & JWT</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">Account Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Active & Verified
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Household Resident Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
