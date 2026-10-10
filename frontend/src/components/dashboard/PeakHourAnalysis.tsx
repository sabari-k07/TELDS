import React, { FC } from 'react';
import { Clock, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PeakHourAnalysisProps {
  peakComparison: {
    peak_hours_window: string;
    peak_stats: { count: number; avg_loss_pct: number; total_diff_kwh: number; anomalies: number };
    off_peak_stats: { count: number; avg_loss_pct: number; total_diff_kwh: number; anomalies: number };
  } | null;
}

export const PeakHourAnalysis: FC<PeakHourAnalysisProps> = ({ peakComparison }) => {
  if (!peakComparison) return null;

  const { peak_stats, off_peak_stats, peak_hours_window } = peakComparison;
  const discrepancyDelta = Math.max(0, peak_stats.avg_loss_pct - off_peak_stats.avg_loss_pct);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Peak-Hour Energy Dynamics</h3>
            <span className="text-xs text-amber-400 font-mono">{peak_hours_window}</span>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
          Automated Night-Shift Surveillance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Peak Window Stats */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-slate-900/60 border border-amber-500/30">
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
            Peak Interval (19:00 - 22:00)
          </div>
          <div className="text-2xl font-black text-amber-400">
            {peak_stats.avg_loss_pct}%
          </div>
          <div className="text-xs text-slate-400 mt-2 space-y-1">
            <div>Unaccounted Loss: <span className="text-white font-medium">{peak_stats.total_diff_kwh} kWh</span></div>
            <div>Peak Anomalies Triggered: <span className="text-rose-400 font-bold">{peak_stats.anomalies}</span></div>
          </div>
        </div>

        {/* Off-Peak Stats */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Off-Peak (Daytime & Normal Hours)
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {off_peak_stats.avg_loss_pct}%
          </div>
          <div className="text-xs text-slate-400 mt-2 space-y-1">
            <div>Unaccounted Loss: <span className="text-white font-medium">{off_peak_stats.total_diff_kwh} kWh</span></div>
            <div>Off-Peak Anomalies: <span className="text-slate-300 font-medium">{off_peak_stats.anomalies}</span></div>
          </div>
        </div>

        {/* Engineering Takeaway */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Peak Discrepancy Delta
          </div>
          <div>
            <div className={`text-2xl font-black ${discrepancyDelta > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              +{discrepancyDelta.toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {discrepancyDelta > 5
                ? 'High evening delta indicates significant unmetered load or commercial peak bypass. Feeder inspection recommended.'
                : 'Balanced evening variation within acceptable technical power distribution limits.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
