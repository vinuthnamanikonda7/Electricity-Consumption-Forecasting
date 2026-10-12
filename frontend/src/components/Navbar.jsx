import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Menu,
  X,
  LayoutDashboard,
  Home,
  TrendingUp,
  Lightbulb,
  FileText,
  ShieldAlert,
  Users,
  HardDrive,
  LogOut,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center space-x-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105 ${
              isAdmin
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/20'
                : 'bg-gradient-to-tr from-emerald-500 to-sky-500 shadow-emerald-500/20'
            }`}>
              {isAdmin ? (
                <ShieldAlert className="w-6 h-6 text-white" />
              ) : (
                <Zap className="w-6 h-6 text-slate-950" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-300 bg-clip-text text-transparent">
                  ElectroForecast
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {isAdmin ? 'System Control Center' : 'Smart Energy & Prediction'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Public links ONLY shown when NOT logged in */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/about') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/contact') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Contact
                </Link>
              </>
            )}

            {/* Authenticated Links */}
            {isAuthenticated && (
              <>
                {isAdmin ? (
                  // Dedicated Admin Navigation Links
                  <>
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin') && (!location.search || location.search.includes('overview'))
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Overview</span>
                    </Link>

                    <Link
                      to="/admin?tab=users"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.search.includes('tab=users')
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Households</span>
                    </Link>

                    <Link
                      to="/admin?tab=messages"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.search.includes('tab=messages')
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Inquiries</span>
                    </Link>

                    <Link
                      to="/admin?tab=reports"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.search.includes('tab=reports')
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span>Audit Reports</span>
                    </Link>

                    <Link
                      to="/admin?tab=backup"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.search.includes('tab=backup')
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <HardDrive className="w-4 h-4 text-purple-400" />
                      <span>Backups</span>
                    </Link>
                  </>
                ) : (
                  // Dedicated Household Navigation Links
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/dashboard') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/house"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/house') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>House & Appliances</span>
                    </Link>

                    <Link
                      to="/predictions"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/predictions') ? 'text-sky-400 bg-sky-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Predictions</span>
                    </Link>

                    <Link
                      to="/recommendations"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/recommendations') ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Saving Tips</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {user?.name?.charAt(0).toUpperCase() || (isAdmin ? 'A' : 'U')}
                  </div>
                  <span className="text-xs font-semibold max-w-[120px] truncate">{user?.name || 'User'}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                      ADMIN
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login?portal=admin"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
                  title="Administrator Control Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>

                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  User Login
                </Link>

                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          {!isAuthenticated ? (
            // Unauthenticated Public Menu
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Home
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                About
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Contact
              </Link>
              <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
                <Link to="/login?portal=admin" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-sm flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center rounded-xl bg-slate-800 text-white font-medium text-sm">
                  User Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm">
                  Get Started
                </Link>
              </div>
            </>
          ) : isAdmin ? (
            // Authenticated Admin Mobile Menu
            <div className="pt-2 space-y-1">
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-800">
                Admin Overview
              </Link>
              <Link to="/admin?tab=users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Household Directory
              </Link>
              <Link to="/admin?tab=messages" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Contact Inquiries
              </Link>
              <Link to="/admin?tab=reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Audit Reports
              </Link>
              <Link to="/admin?tab=backup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Database Backups
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Profile ({user?.name || 'Admin'})
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left mt-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            // Authenticated Household Mobile Menu
            <div className="pt-2 space-y-1">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800">
                Dashboard
              </Link>
              <Link to="/house" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                House & Appliances
              </Link>
              <Link to="/predictions" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Predictions & Load
              </Link>
              <Link to="/recommendations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Energy-Saving Tips
              </Link>
              <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Reports & Audit
              </Link>
              <Link to="/consumption" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Meter Readings
              </Link>
              <Link to="/forecast" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Moving Average Forecast
              </Link>
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Prediction History
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800">
                Profile ({user?.name || 'User'})
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left mt-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
