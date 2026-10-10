import React, { FC } from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  UploadCloud, 
  AlertTriangle, 
  FileSpreadsheet, 
  HelpCircle,
  Activity
} from 'lucide-react';

export type TabType = 'dashboard' | 'segments' | 'transformers' | 'upload' | 'alerts' | 'reports';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  anomalyCount: number;
}

export const Sidebar: FC<SidebarProps> = ({ activeTab, setActiveTab, anomalyCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Loss Dashboard', icon: LayoutDashboard },
    { id: 'segments', label: 'Segment Localisation', icon: Activity },
    { id: 'transformers', label: 'Feeders & Transformers', icon: Cpu },
    { id: 'upload', label: 'CSV Meter Ingestion', icon: UploadCloud },
    { 
      id: 'alerts', 
      label: 'Anomaly Investigations', 
      icon: AlertTriangle, 
      badge: anomalyCount > 0 ? anomalyCount : null 
    },
    { id: 'reports', label: 'Energy Reports & Audit', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#070b14] flex flex-col justify-between p-4 shrink-0">
      <div>
        <div className="text-[11px] font-mono tracking-wider uppercase text-slate-500 px-3 mb-3">
          Core Operations
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item: { id: string; label: string; icon: any; badge?: number | null }) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Methodology notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-[11px]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Loss Formula Protocol</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Δ Energy = Tx Input − Total Consumer.<br />
          System distinguishes technical losses from unverified discrepancies without automatic theft classification.
        </p>
      </div>
    </aside>
  );
};
