import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  User,
  KeyRound
} from 'lucide-react';

export default function Login({ defaultPortal = 'household' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, loginWithPassword, isAuthenticated, isAdmin } = useAuth();

  // Determine initial portal ('household' vs 'admin') from prop or query param
  const queryParams = new URLSearchParams(location.search);
  const initialPortal = queryParams.get('portal') === 'admin' ? 'admin' : defaultPortal;

  const [portal, setPortal] = useState(initialPortal); // 'household' | 'admin'
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password' (for household)
  const [otpStep, setOtpStep] = useState(1); // 1: Enter email, 2: Enter OTP

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Sync portal if query parameter changes
  useEffect(() => {
    const qPortal = queryParams.get('portal');
    if (qPortal === 'admin') {
      setPortal('admin');
    } else if (qPortal === 'household') {
      setPortal('household');
    }
  }, [location.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Clear errors when toggling modes
  const handleSwitchPortal = (newPortal) => {
    setPortal(newPortal);
    setError('');
    setShowPassword(false);
  };

  // Quick Demo Credentials for Administrator
  const handleFillAdminDemo = () => {
    setAdminId('admin@electricity.com');
    setAdminPassword('Admin#2024');
    setError('');
    setToast({
      type: 'info',
      message: 'Admin demo credentials filled! Click "Sign In as Administrator".'
    });
  };

  // Handle Request OTP (Household)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email, 'login');
      setOtpCode('');
      setOtpStep(2);
      setToast({ type: 'success', message: 'Verification code sent to your email!' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP code.';
      setError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP (Household)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, otpCode.trim());
      setToast({ type: 'success', message: 'Signed in successfully! Redirecting...' });
      setTimeout(() => {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid verification code.';
      setError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login (Household)
  const handleHouseholdPasswordLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword(email, password, 'household');
      setToast({ type: 'success', message: 'Logged in successfully! Redirecting...' });
      setTimeout(() => {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Portal Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminId || !adminPassword) {
      setError('Please provide your Administrator Login ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword(adminId, adminPassword, 'admin');
      setToast({ type: 'success', message: 'Administrator authenticated! Redirecting to Control Center...' });
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Administrator authentication failed.';
      setError(msg);
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <Navbar />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          
          {/* Main Card */}
          <div className={`glass-panel p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
            portal === 'admin'
              ? 'border-purple-500/30 shadow-purple-950/40'
              : 'border-slate-800 shadow-slate-950/60'
          }`}>

            {/* Portal Switcher Tabs */}
            <div className="grid grid-cols-2 rounded-2xl bg-slate-900/90 p-1.5 mb-6 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchPortal('household')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  portal === 'household'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Household User</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPortal('admin')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  portal === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* PORTAL A: HOUSEHOLD USER LOGIN */}
            {/* ========================================================================= */}
            {portal === 'household' && (
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                    <Zap className="w-6 h-6 text-slate-950" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Household Login</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {authMode === 'otp'
                      ? otpStep === 1
                        ? 'Sign in securely with 6-digit Email OTP'
                        : `Enter the verification code sent to ${email}`
                      : 'Sign in with your email and password'}
                  </p>
                </div>

                {/* Sub-mode Toggle (OTP vs Password) */}
                <div className="flex rounded-xl bg-slate-900 p-1 mb-5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('otp'); setOtpStep(1); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'otp'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Email OTP (Passwordless)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('password'); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'password'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Password
                  </button>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* OTP Mode */}
                {authMode === 'otp' && (
                  <>
                    {otpStep === 1 ? (
                      <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Registered Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="user@example.com"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Get 6-Digit OTP</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-1">
                          <div className="font-semibold text-white flex items-center justify-center gap-1.5">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <span>Check Your Email Inbox</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Enter the 6-digit code sent to <strong className="text-emerald-400">{email}</strong>
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                            Enter 6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••••"
                            className="w-full text-center tracking-[0.75em] font-mono text-2xl py-3 rounded-2xl bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Enter Dashboard</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setOtpStep(1)}
                            className="text-slate-400 hover:text-white"
                          >
                            ← Change Email
                          </button>
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={resending}
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                            <span>Resend OTP</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* Password Mode */}
                {authMode === 'password' && (
                  <form onSubmit={handleHouseholdPasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer Switcher */}
                <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-emerald-400 hover:underline">
                      Register as Household
                    </Link>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Are you a system admin?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchPortal('admin')}
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      Log in to Administrator Portal
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PORTAL B: ADMINISTRATOR PORTAL LOGIN */}
            {/* ========================================================================= */}
            {portal === 'admin' && (
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-600/30">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>Restricted Access</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Administrator Portal</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in with your administrator ID and secure master password
                  </p>
                </div>

                {/* Quick Demo Credentials Pill */}
                <div className="mb-5 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-purple-400" /> Default Admin Credentials
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: <span className="text-white">admin@electricity.com</span> | Pass: <span className="text-white">Admin#2024</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillAdminDemo}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>Auto Fill</span>
                  </button>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Admin Form */}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Administrator Login ID / Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        placeholder="admin or admin@electricity.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Administrator Master Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as Administrator</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchPortal('household')}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    ← Return to Household User Login
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
