import React, { FC } from 'react';
import { DashboardSummary } from '../../types';
import { Zap, Gauge, TrendingUp, AlertOctagon, Clock, ShieldAlert } from 'lucide-react';

interface KPICardsProps {
  summary: DashboardSummary | null;
}

export const KPICards: FC<KPICardsProps> = ({ summary }) => {
  if (!summary) return null;

  const isCriticalLoss = summary.average_loss_percentage >= 15.0;
  const isHighPeakLoss = summary.peak_hour_loss_percentage >= 12.0;

  const cards = [
    {
      title: 'Total Transformer Input',
      value: `${summary.total_transformer_input_kwh.toLocaleString()} kWh`,
      sub: 'Aggregated Grid Delivery',
      icon: Zap,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20'
    },
    {
      title: 'Total Consumer Billed',
      value: `${summary.total_consumer_energy_kwh.toLocaleString()} kWh`,
      sub: 'Cumulative Metered Load',
      icon: Gauge,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Unaccounted Difference',
      value: `${summary.total_energy_difference_kwh.toLocaleString()} kWh`,
      sub: `Tech: ${summary.technical_loss_kwh.toLocaleString()} | Unexp: ${summary.unexplained_loss_kwh.toLocaleString()} kWh`,
      icon: TrendingUp,
      color: isCriticalLoss ? 'text-rose-400' : 'text-amber-400',
      border: isCriticalLoss ? 'border-rose-500/30' : 'border-amber-500/20'
    },
    {
      title: 'Average Energy Loss',
      value: `${summary.average_loss_percentage}%`,
      sub: 'Allowable Tech Baseline: 6.0%',
      icon: AlertOctagon,
      color: isCriticalLoss ? 'text-rose-400' : 'text-cyan-400',
      border: isCriticalLoss ? 'border-rose-500/30' : 'border-cyan-500/20'
    },
    {
      title: 'Peak-Hour Loss (7-10 PM)',
      value: `${summary.peak_hour_loss_percentage}%`,
      sub: 'High-Demand Discrepancy Rate',
      icon: Clock,
      color: isHighPeakLoss ? 'text-rose-400' : 'text-amber-400',
      border: isHighPeakLoss ? 'border-rose-500/30' : 'border-amber-500/20'
    },
    {
      title: 'Active Anomalies',
      value: summary.active_anomalies_count.toString(),
      sub: `${summary.high_loss_transformers_count} transformers above 12%`,
      icon: ShieldAlert,
      color: summary.active_anomalies_count > 0 ? 'text-rose-400' : 'text-emerald-400',
      border: summary.active_anomalies_count > 0 ? 'border-rose-500/30' : 'border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card: any, idx: number) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-slate-900/70 border ${card.border} backdrop-blur-md flex flex-col justify-between transition-all hover:border-slate-600`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{card.title}</span>
              <div className={`p-1.5 rounded-lg bg-slate-800/80 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
