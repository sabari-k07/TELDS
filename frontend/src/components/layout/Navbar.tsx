import React, { FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Activity, User as UserIcon, RefreshCw } from 'lucide-react';

export const Navbar: FC = () => {
  const { user, switchDemoRole } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0b1329]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Live status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              TELDS
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
              v1.0 • Grid Analytics
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Telemetry Active • Simulated Stream</span>
        </div>
      </div>

      {/* Role Switcher & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Role Quick-Switch for demonstration */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            Role:
          </span>
          {(['ADMIN', 'ENGINEER', 'OPERATOR', 'FIELD_INSPECTOR'] as UserRole[]).map((r: UserRole) => (
            <button
              key={r}
              onClick={() => switchDemoRole(r)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                user?.role === r 
                  ? 'bg-cyan-500 text-black shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.full_name}</div>
            <div className="text-[10px] text-cyan-400 font-mono">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
