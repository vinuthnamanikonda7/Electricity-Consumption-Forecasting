import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import {
  ShieldAlert,
  Users,
  Database,
  TrendingUp,
  Zap,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  FileText,
  Activity,
  HardDrive,
  RefreshCw,
  Sparkles,
  Server,
  Layers,
  Calendar,
  Check,
  Filter,
  Mail,
  Clock,
  Send,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL query (?tab=overview | users | predictions | messages | reports | backup)
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'household', is_verified: 1 });
  const [savingUser, setSavingUser] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteMessageConfirmId, setDeleteMessageConfirmId] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);

  const setTab = (tabName) => {
    if (tabName === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin?tab=${tabName}`);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, usersRes, reportsRes, messagesRes, logsRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.getAllUsers(search),
        adminService.getSystemReports(),
        adminService.getContactMessages(),
        adminService.getAdminLogs()
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (usersRes.success) setUsers(usersRes.users);
      if (reportsRes.success) setReports(reportsRes.reports);
      if (messagesRes.success) setMessages(messagesRes.messages);
      if (logsRes && logsRes.success) setAdminLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setToast({ type: 'error', message: 'Failed to retrieve administrator metrics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [search]);

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      is_verified: user.is_verified
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const res = await adminService.updateUser(editingUser.id, editForm);
      if (res.success) {
        setToast({ type: 'success', message: 'User updated successfully!' });
        setIsEditModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update user.' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await adminService.deleteUser(id);
      if (res.success) {
        setToast({ type: 'success', message: 'User account deleted.' });
        setDeleteConfirmId(null);
        fetchAdminData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      setToast({ type: 'error', message: msg });
    }
  };

  const handleUpdateMessageStatus = async (id, status) => {
    try {
      const res = await adminService.updateMessageStatus(id, status);
      if (res.success) {
        setToast({ type: 'success', message: `Inquiry marked as ${status}.` });
        fetchAdminData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update inquiry status.' });
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await adminService.deleteContactMessage(id);
      if (res.success) {
        setToast({ type: 'success', message: 'Contact inquiry deleted.' });
        setDeleteMessageConfirmId(null);
        fetchAdminData();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete message.' });
    }
  };

  const handleTriggerBackup = async () => {
    setBackingUp(true);
    try {
      const res = await adminService.triggerBackup();
      if (res.success) {
        setToast({
          type: 'success',
          message: `Database backup generated: ${res.backup.filename}`
        });
        setBackupHistory((prev) => [
          {
            filename: res.backup.filename,
            size: `${(res.backup.size / 1024).toFixed(1)} KB`,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Backup generation failed.' });
    } finally {
      setBackingUp(false);
    }
  };

  const exportAuditCSV = () => {
    if (!reports || reports.length === 0) {
      setToast({ type: 'info', message: 'No audit records to export.' });
      return;
    }

    const headers = ['Record ID', 'User ID', 'User Name', 'User Email', 'Type', 'Value (kWh)', 'Cost (INR)', 'Recorded Date'];
    const rows = reports.map((r) => [
      r.id,
      r.user_id,
      `"${(r.user_name || '').replace(/"/g, '""')}"`,
      `"${(r.user_email || '').replace(/"/g, '""')}"`,
      r.type || 'Prediction',
      r.predicted_monthly_kwh || r.consumption || 0,
      r.estimated_cost || 0,
      r.created_at || r.reading_date || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', message: 'System audit report exported to CSV successfully.' });
  };

  if (loading) {
    return <Loading text="Loading administrator control center..." />;
  }

  // Ventilation chart data formatting
  const ventilationData = (metrics?.ventilation_distribution || []).map((v) => ({
    name: v.ventilation || 'Moderate',
    count: v.count
  }));

  const COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#A855F7'];

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header with Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              ADMINISTRATOR CONTROL CENTER
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Server className="w-3 h-3" /> MySQL 3306 Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central Administration & Grid Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide household management, aggregate power projections, contact messages, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
            title="Refresh system metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerBackup}
            disabled={backingUp}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <HardDrive className="w-4 h-4" />
            <span>{backingUp ? 'Backing up...' : 'Trigger MySQL Backup'}</span>
          </button>
        </div>
      </div>

      {/* Top Level Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'System Overview', icon: ShieldAlert },
          { id: 'users', label: `Household Directory (${users.length})`, icon: Users },
          { id: 'messages', label: `Contact Inquiries (${messages.length})`, icon: MessageSquare },
          { id: 'logs', label: `Admin Action Logs (${adminLogs.length})`, icon: Activity },
          { id: 'predictions', label: 'Grid Predictions', icon: Zap },
          { id: 'reports', label: 'Audit Logs & CSV', icon: FileText },
          { id: 'backup', label: 'Database & Recovery', icon: HardDrive }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM OVERVIEW & KPIS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Registered Households"
              value={metrics?.total_households || 0}
              unit="households"
              icon={Users}
              color="purple"
              subtitle={`${metrics?.total_users || 0} total system users`}
              change="User Base"
            />

            <StatCard
              title="System Forecasted Load"
              value={metrics?.system_total_predicted_load_kwh || 0}
              unit="kWh"
              icon={Zap}
              color="emerald"
              subtitle="Aggregate monthly demand"
              change="Grid Load"
            />

            <StatCard
              title="Avg Household Consumption"
              value={metrics?.average_household_monthly_kwh || 0}
              unit="kWh/mo"
              icon={TrendingUp}
              color="cyan"
              subtitle="Average load per household"
              change="Benchmark"
            />

            <StatCard
              title="Tracked Appliances & Reads"
              value={metrics?.total_appliances || 0}
              unit="appliances"
              icon={Database}
              color="amber"
              subtitle={`${metrics?.total_readings || 0} meter readings in DB`}
              change="Active Assets"
            />
          </div>

          {/* Charts & System Activity Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ventilation & Housing Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  House Ventilation Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Housing architecture breakdown across users</p>
              </div>

              {ventilationData.length > 0 ? (
                <div className="h-48 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventilationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" fill="#A855F7" radius={[8, 8, 0, 0]}>
                        {ventilationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No ventilation data recorded yet.</div>
              )}

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                {ventilationData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{item.name}: <strong>{item.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live System Activity Feed */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Recent System Prediction Calculations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time energy forecast calculations across households</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  LIVE STREAM
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {metrics?.recent_activity && metrics.recent_activity.length > 0 ? (
                  metrics.recent_activity.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                          {act.user_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{act.user_name}</p>
                          <p className="text-[10px] text-slate-400">{act.user_email}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400">{act.predicted_monthly_kwh} kWh/mo</p>
                        <p className="text-[10px] text-slate-400">₹{act.estimated_cost} • {new Date(act.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">No recent activity logs recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOUSEHOLD USERS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Registered Household Users Directory
              </h2>
              <p className="text-xs text-slate-400">Inspect architectural profiles, assigned roles, and manage permissions</p>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">House Specs</th>
                  <th className="px-5 py-3 font-semibold">Appliances</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {u.phone || '--'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.is_verified ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pending OTP
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {u.num_rooms ? `${u.num_rooms} R (${u.ventilation || 'Mod'}) • ${u.house_size_sqft || 1200} sqft` : '--'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-sky-400">
                      {u.appliance_count || 0} items
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === u.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONTACT INQUIRIES & MESSAGES */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Contact Messages & Inquiries ({messages.length})
              </h2>
              <p className="text-xs text-slate-400">Messages sent by visitors and household users from the Contact page</p>
            </div>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.status === 'unread'
                      ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                        {m.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{m.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'unread'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : m.status === 'replied'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {m.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="py-3">
                    <p className="text-xs font-bold text-purple-300 mb-1">Subject: {m.subject}</p>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                      {m.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {m.status !== 'read' && (
                        <button
                          onClick={() => handleUpdateMessageStatus(m.id, 'read')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      {m.status !== 'replied' && (
                        <button
                          onClick={() => handleUpdateMessageStatus(m.id, 'replied')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Replied</span>
                        </button>
                      )}
                    </div>

                    {deleteMessageConfirmId === m.id ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteMessageConfirmId(null)}
                          className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteMessageConfirmId(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No contact inquiries or messages submitted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ADMIN ACTION & SECURITY LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Administrative Action & Security Audit Trail
              </h2>
              <p className="text-xs text-slate-400">Chronological history of all admin logins, account edits, deletions, and system maintenance</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
              Stored in MySQL (admin_logs)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Log ID</th>
                  <th className="px-5 py-3 font-semibold">Admin Account</th>
                  <th className="px-5 py-3 font-semibold">Action Type</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Target ID</th>
                  <th className="px-5 py-3 font-semibold">IP Address</th>
                  <th className="px-5 py-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {adminLogs && adminLogs.length > 0 ? (
                  adminLogs.map((log) => {
                    const getBadgeClass = (type) => {
                      if (type.includes('DELETE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      if (type.includes('UPDATE') || type.includes('EDIT')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      if (type.includes('LOGIN')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      if (type.includes('BACKUP')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                      return 'bg-slate-800 text-slate-300 border-slate-700';
                    };

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-500">#{log.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-white">{log.admin_email || 'System Admin'}</p>
                          <p className="text-[10px] text-slate-500">ID: {log.admin_id || 'System'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold font-mono ${getBadgeClass(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 font-medium">
                          {log.description}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {log.target_id || '-'}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No admin action logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GRID PREDICTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'predictions' && (
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Grid-Wide Electricity Consumption Predictions
              </h2>
              <p className="text-xs text-slate-400">Aggregated physics-appliance model calculations across all homes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">User Account</th>
                  <th className="px-5 py-3 font-semibold">Predicted Monthly Load</th>
                  <th className="px-5 py-3 font-semibold">Estimated Monthly Bill</th>
                  <th className="px-5 py-3 font-semibold">Calculation Model</th>
                  <th className="px-5 py-3 font-semibold text-right">Calculation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {metrics?.recent_activity && metrics.recent_activity.length > 0 ? (
                  metrics.recent_activity.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-white">{p.user_name}</p>
                        <p className="text-[11px] text-slate-400">{p.user_email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400 text-sm">
                        {p.predicted_monthly_kwh} <span className="text-xs font-normal text-slate-400">kWh</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-white">
                        ₹{p.estimated_cost}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Hybrid Physics-Appliance
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      No household predictions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS & REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Comprehensive System Audit Trail
              </h2>
              <p className="text-xs text-slate-400">All historical meter readings and prediction calculations across users</p>
            </div>

            <button
              onClick={exportAuditCSV}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Record Type</th>
                  <th className="px-5 py-3 font-semibold">Consumption (kWh)</th>
                  <th className="px-5 py-3 font-semibold">Estimated Cost</th>
                  <th className="px-5 py-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white">{r.user_name}</p>
                      <p className="text-[11px] text-slate-400">{r.user_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                        {r.type || 'Prediction Record'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-sky-400">
                      {r.predicted_monthly_kwh || r.consumption || '--'} kWh
                    </td>
                    <td className="px-5 py-3.5 text-white">
                      {r.estimated_cost ? `₹${r.estimated_cost}` : '--'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400">
                      {new Date(r.created_at || r.reading_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DATABASE & BACKUP OPERATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">MySQL Database & Disaster Recovery</h2>
                  <p className="text-xs text-slate-400">Generate on-demand SQL dumps and verify database schema integrity</p>
                </div>
              </div>

              <button
                onClick={handleTriggerBackup}
                disabled={backingUp}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <HardDrive className="w-4 h-4" />
                <span>{backingUp ? 'Generating Backup...' : 'Generate New SQL Backup'}</span>
              </button>
            </div>

            {/* Database Tables Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { table: 'users', desc: 'Registered user accounts & auth hashes', count: metrics?.total_users || 0 },
                { table: 'house_details', desc: 'Architectural details & room specs', count: metrics?.total_households || 0 },
                { table: 'appliances', desc: 'Appliance wattage, star ratings, hours', count: metrics?.total_appliances || 0 },
                { table: 'electricity_readings', desc: 'Historical daily meter consumption logs', count: metrics?.total_readings || 0 },
              ].map((t) => (
                <div key={t.table} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-xs font-mono font-bold text-purple-400">{t.table}</p>
                  <p className="text-xl font-extrabold text-white">{t.count} <span className="text-xs font-normal text-slate-400">records</span></p>
                  <p className="text-[10px] text-slate-500">{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Backup Action History */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300">Generated Backups This Session</h3>
              {backupHistory.length > 0 ? (
                <div className="space-y-2">
                  {backupHistory.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-slate-200">{b.filename}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                        <span>{b.size}</span>
                        <span>{b.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No manual backups triggered during this session yet. Click the button above to generate a snapshot.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-base font-bold text-white">Edit User Account</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="household">Household</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editForm.is_verified}
                    onChange={(e) => setEditForm({ ...editForm, is_verified: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value={1}>Verified</option>
                    <option value={0}>Unverified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {savingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
