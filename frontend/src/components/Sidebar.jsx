import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  TrendingUp,
  Lightbulb,
  FileText,
  Zap,
  Activity,
  History,
  ShieldAlert,
  Users,
  HardDrive,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Mail
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dedicated Navigation Items for Administrator
  const adminNavItems = [
    { name: 'Admin Overview', path: '/admin', query: 'overview', icon: ShieldAlert },
    { name: 'Household Directory', path: '/admin?tab=users', query: 'users', icon: Users },
    { name: 'Contact Inquiries', path: '/admin?tab=messages', query: 'messages', icon: Mail },
    { name: 'Grid Load & Predictions', path: '/admin?tab=predictions', query: 'predictions', icon: Zap },
    { name: 'Audit Logs & Reports', path: '/admin?tab=reports', query: 'reports', icon: FileText },
    { name: 'Database & Backups', path: '/admin?tab=backup', query: 'backup', icon: HardDrive },
    { name: 'Admin Profile', path: '/profile', icon: User },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  // Dedicated Navigation Items for Household User
  const householdNavItems = [
    { name: 'Household Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'House & Appliances', path: '/house', icon: Home },
    { name: 'Consumption Predictions', path: '/predictions', icon: TrendingUp },
    { name: 'Saving Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'Reports & Export', path: '/reports', icon: FileText },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const currentNavItems = isAdmin ? adminNavItems : householdNavItems;

  const isItemActive = (item) => {
    if (isAdmin) {
      if (item.path === '/admin') {
        return location.pathname === '/admin' && (!location.search || location.search.includes('overview'));
      }
      if (item.query) {
        return location.pathname === '/admin' && location.search.includes(`tab=${item.query}`);
      }
    }
    return location.pathname === item.path;
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-950/95 transition-all duration-300 relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-md z-10"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-2">
          {isAdmin ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>ADMINISTRATOR PANEL</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>HOUSEHOLD PORTAL</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? isAdmin
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : isAdmin
                  ? 'text-slate-400 hover:text-purple-200 hover:bg-purple-950/30 border border-transparent'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                active ? (isAdmin ? 'text-purple-400' : 'text-emerald-400') : ''
              }`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl bg-slate-900/60 border border-slate-800`}>
          {!collapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className={`w-7 h-7 rounded-lg ${isAdmin ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} border flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                {user?.name?.charAt(0).toUpperCase() || (isAdmin ? 'A' : 'U')}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{isAdmin ? 'Administrator' : 'Household User'}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              collapsed ? 'w-full flex justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
