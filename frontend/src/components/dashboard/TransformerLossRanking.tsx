import React, { FC } from 'react';
import { AlertCircle, ChevronRight, Activity } from 'lucide-react';

interface TransformerRankingItem {
  transformer_id: number;
  code: string;
  name: string;
  location: string;
  capacity_kva: number;
  average_loss_percentage: number;
  anomalies_detected: number;
  status: string;
}

interface TransformerLossRankingProps {
  rankings: TransformerRankingItem[];
  onSelectTransformer: (id: number) => void;
}

export const TransformerLossRanking: FC<TransformerLossRankingProps> = ({ 
  rankings, 
  onSelectTransformer 
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Feeder & Transformer Loss Priority Queue</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by percentage energy discrepancy to guide field engineering investigations.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-3">Transformer</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Capacity</th>
              <th className="py-3 px-3">Avg Loss %</th>
              <th className="py-3 px-3">Anomalies</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rankings.map((item: TransformerRankingItem) => {
              const isHigh = item.average_loss_percentage >= 12.0;
              return (
                <tr key={item.transformer_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-cyan-400">{item.code}</span>
                    <span className="text-slate-300 font-normal truncate max-w-[200px]">{item.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.location}</td>
                  <td className="py-3 px-3 font-mono">{item.capacity_kva} kVA</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded ${
                      isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.average_loss_percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.anomalies_detected > 0 ? (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {item.anomalies_detected}
                      </span>
                    ) : (
                      <span className="text-emerald-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectTransformer(item.transformer_id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all font-medium text-xs"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
