import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Data-Driven Forecasting',
      description: 'Leverage moving average statistical models to generate accurate 1-day, 7-day, and 30-day future electricity consumption projections.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BarChart3,
      title: 'Interactive Recharts Analytics',
      description: 'Visualize historical consumption trends and future forecasts with rich area charts, comparison bars, and peak usage indicators.',
      color: 'from-sky-500 to-indigo-500'
    },
    {
      icon: Database,
      title: 'Local MySQL Integration',
      description: 'All your reading records and prediction datasets are securely stored in your local MySQL Server and easily manageable with MySQL Workbench.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: ShieldCheck,
      title: 'JWT & Bcrypt Security',
      description: 'Enterprise-standard user authentication with bcrypt password hashing, encrypted JWT tokens, and strict per-user data isolation.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Log Readings',
      desc: 'Input daily electricity consumption (in kWh) effortlessly using our streamlined reading recorder.'
    },
    {
      step: '02',
      title: 'Select Forecast Horizon',
      desc: 'Choose your desired forecast timeline: next 24 hours (1-day), weekly (7-days), or monthly (30-days).'
    },
    {
      step: '03',
      title: 'Compute Predictions',
      desc: 'Our backend moving average engine analyzes historical trends and computes future demand estimates.'
    },
    {
      step: '04',
      title: 'Take Action & Optimize',
      desc: 'Compare actual vs. predicted consumption on interactive charts to reduce utility bills and peak demand.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-slate-800/80">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Smart Energy Forecasting Engine</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Electricity Consumption <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Forecasting System
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
                Monitor your electricity usage and predict future consumption with data-driven forecasting. Gain actionable insights into your energy consumption patterns.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700/80 transition-all flex items-center justify-center"
                >
                  Account Login
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Moving Average Model
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> MySQL Workbench Native
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Secure & Local
                </span>
              </div>
            </div>

            {/* Visual Live Preview Card */}
            <div className="mt-16 max-w-4xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-2xl">
              <div className="bg-slate-950 rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-400 font-mono ml-2">forecast_engine://moving-average-v1</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Live Computation Ready</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">Current 7-Day Mean</p>
                    <p className="text-2xl font-bold text-white mt-1">15.24 <span className="text-sm font-normal text-slate-400">kWh/day</span></p>
                    <p className="text-[11px] text-emerald-400 mt-1">✓ Stable baseline</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">Next 7-Day Forecast</p>
                    <p className="text-2xl font-bold text-sky-400 mt-1">106.80 <span className="text-sm font-normal text-slate-400">kWh</span></p>
                    <p className="text-[11px] text-sky-300 mt-1">⚡ 7-Day Projected Total</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400">Model Algorithm</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">Moving Avg</p>
                    <p className="text-[11px] text-slate-400 mt-1">Window: 7 Readings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="py-20 bg-slate-950/60 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Capabilities</h2>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                Comprehensive Electricity Monitoring & Forecasting
              </p>
              <p className="mt-4 text-slate-400 text-sm sm:text-base">
                Everything required to record readings, analyze power demands, and anticipate future energy loads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-slate-950 font-bold mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 text-slate-950" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">Workflow</h2>
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                How The Forecasting System Works
              </p>
              <p className="mt-4 text-slate-400 text-sm">
                Four simple steps from raw meter readings to actionable energy predictions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-4xl font-extrabold text-slate-700 mb-4">{s.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-900/40 via-slate-900 to-sky-900/40 border border-emerald-500/20 text-center relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Forecast Your Electricity Consumption?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                Create an account in seconds, log your power readings, and generate your first energy forecast immediately.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
