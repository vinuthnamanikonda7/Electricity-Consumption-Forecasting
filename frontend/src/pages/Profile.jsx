import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import {
  User,
  Mail,
  Calendar,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  Save,
  KeyRound,
  Layers
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Edit Name State
  const [name, setName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await authService.getMe();
        if (res.success && res.user) {
          setProfileData(res.user);
          setName(res.user.name || '');
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }

    setUpdatingName(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      if (res.success) {
        updateUser({ name: name.trim() });
        setProfileData(prev => ({ ...prev, name: name.trim() }));
        setToast({ type: 'success', message: 'Name updated successfully!' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update name.';
      setToast({ type: 'error', message: msg });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setToast({ type: 'error', message: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await authService.updateProfile({ currentPassword, newPassword });
      if (res.success) {
        setToast({ type: 'success', message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Check current password.';
      setToast({ type: 'error', message: msg });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  const creationDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="max-w-4xl space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Account Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal details, credentials, and account statistics
        </p>
      </div>

      {/* Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
            {profileData?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {profileData?.name}
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                Active User
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {profileData?.email}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              Member since {creationDate}
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1 sm:flex-initial sm:min-w-[110px]">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Appliances
            </p>
            <p className="text-lg font-bold text-white mt-0.5">{profileData?.total_appliances || 0}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1 sm:flex-initial sm:min-w-[110px]">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-400" /> Predictions
            </p>
            <p className="text-lg font-bold text-white mt-0.5">{profileData?.total_predictions || 0}</p>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Update Name Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-emerald-400" />
              Update Personal Details
            </h3>
            <p className="text-xs text-slate-400 mb-6">Change your display name in the application</p>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profileData?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingName}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updatingName ? 'Saving...' : 'Save Name Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-sky-400" />
              Change Password
            </h3>
            <p className="text-xs text-slate-400 mb-6">Ensure your account uses a secure password</p>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password (Min. 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
