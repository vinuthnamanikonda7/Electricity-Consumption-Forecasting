import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Cpu, Database, Shield, Zap, Layers, Server, TrendingUp, Code2 } from 'lucide-react';

export default function About() {
  const stack = [
    { name: 'React + Vite', role: 'Frontend Single Page Application with dynamic fast refresh and component modularity.', icon: Layers },
    { name: 'Tailwind CSS', role: 'Utility-first modern styling with custom dark theme and responsive design.', icon: Code2 },
    { name: 'Node.js + Express', role: 'RESTful API backend routing, controllers, input validation, and business logic.', icon: Server },
    { name: 'MySQL Server', role: 'Relational database storing users, historical readings, and forecast records.', icon: Database },
    { name: 'Recharts', role: 'Declarative composable charting library for time-series energy visualization.', icon: TrendingUp },
    { name: 'JWT & Bcrypt', role: 'Stateless secure authentication tokens and 10-round salted password hashing.', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Engineering & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            About the Electricity Forecasting System
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            A comprehensive, full-stack software engineering project designed to address the challenge of electricity consumption tracking and short-term energy demand forecasting.
          </p>
        </div>

        {/* Project Objectives */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 mb-12 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            System Purpose & Motivation
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Electricity consumption in households and facilities fluctuates significantly due to weather, appliance usage, and weekly habits. Without proper tracking and prediction tools, consumers face unexpected utility bills and energy waste.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            This application provides an intuitive data logging pipeline coupled with a moving average forecasting engine. By computing running averages and trend lines across historical readings, the system projects estimated electricity consumption for 1-day, 7-day, and 30-day windows.
          </p>
        </div>

        {/* Technical Architecture Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Software Architecture Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stack.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-4">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecasting Algorithm Explanation */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            Forecasting Methodology (Moving Average)
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            The initial model version employs a <strong>Moving Average</strong> algorithm. Given a window of \(N\) recent consumption readings, the base forecast is computed as:
          </p>
          <div className="p-4 rounded-xl bg-slate-950 font-mono text-emerald-400 text-sm border border-slate-800 text-center">
            Predicted Consumption = (1 / N) * ∑ (Reading[i])
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            The service is structured modularly in `backend/services/forecastService.js`, allowing future extensions to incorporate autoregressive (ARIMA), exponential smoothing, or machine learning (Random Forest/LSTM) models with zero frontend changes.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
