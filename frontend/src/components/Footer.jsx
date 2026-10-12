import React from 'react';
import { Zap, Heart, Shield, Cpu, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-white">ElectroForecast</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              An intelligent electricity consumption forecasting system that helps individuals and facilities track power usage, analyze patterns, and predict future energy demand with reliable moving average algorithms.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-emerald-400" /> Node.js & React</span>
              <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-sky-400" /> MySQL Server</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-amber-400" /> JWT Auth</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About System</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">User Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Forecasting Features */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Capabilities</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Moving Average Forecasting</li>
              <li>1-Day, 7-Day, 30-Day Horizons</li>
              <li>Interactive Recharts Trends</li>
              <li>MySQL Workbench Integration</li>
              <li>CSV Data Export</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Electricity Consumption Forecasting System. College Software Engineering Project.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for energy efficiency & smart monitoring.
          </p>
        </div>
      </div>
    </footer>
  );
}
