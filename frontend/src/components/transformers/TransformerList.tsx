import React, { useState, FC } from 'react';
import { Transformer, Feeder } from '../../types';
import { Cpu, MapPin, Zap, Users, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TransformerListProps {
  transformers: Transformer[];
  feeders: Feeder[];
  onSelectTransformer: (id: number) => void;
}

export const TransformerList: FC<TransformerListProps> = ({ 
  transformers, 
  feeders,
  onSelectTransformer 
}) => {
  const [selectedFeederId, setSelectedFeederId] = useState<number | 'ALL'>('ALL');

  const filtered = selectedFeederId === 'ALL' 
    ? transformers 
    : transformers.filter((t: Transformer) => t.feeder_id === selectedFeederId);

  return (
    <div className="space-y-6">
      {/* Header & Feeder Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Feeder & Transformer Distribution Infrastructure</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active monitoring points mapped across primary substations and low-voltage distribution rings.
          </p>
        </div>

        {/* Feeder Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter Feeder:</span>
          <select
            value={selectedFeederId}
            onChange={(e: any) => setSelectedFeederId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Feeders ({feeders.length})</option>
            {feeders.map((f: Feeder) => (
              <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t: Transformer) => {
          const feeder = feeders.find((f: Feeder) => f.id === t.feeder_id);
          return (
            <div 
              key={t.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{t.code}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{t.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {t.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{t.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Feeder: <span className="text-slate-300 font-medium">{feeder?.name || 'Unassigned'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Connected Meters: <span className="text-cyan-400 font-semibold">{t.consumer_count || 5}</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{t.capacity_kva} kVA Capacity</span>
                <button
                  onClick={() => onSelectTransformer(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black font-semibold text-xs transition-all"
                >
                  View Telemetry
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
