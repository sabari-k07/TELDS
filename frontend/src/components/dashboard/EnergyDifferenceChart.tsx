import React, { FC } from 'react';
import { EnergyAnalysis } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface EnergyDifferenceChartProps {
  data: EnergyAnalysis[];
}

export const EnergyDifferenceChart: FC<EnergyDifferenceChartProps> = ({ data }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Energy Intake vs Consumer Consumption & Loss %</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Interval readings comparison. Orange bands and dots indicate Peak Hours (19:00 - 22:00).
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400"></span>
            <span className="text-slate-300">Transformer Input (kWh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400"></span>
            <span className="text-slate-300">Consumer Total (kWh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-400"></span>
            <span className="text-slate-300">Loss %</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="consumerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="time_label" 
              stroke="#64748b" 
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left" 
              stroke="#64748b" 
              tick={{ fontSize: 11 }}
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#f43f5e" 
              domain={[0, 40]}
              tick={{ fontSize: 11 }}
              label={{ value: 'Loss %', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => [
                name === 'Loss %' ? `${value}%` : `${value} kWh`, 
                name
              ]}
            />
            {/* Critical threshold line */}
            <ReferenceLine yAxisId="right" y={12} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning 12%', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine yAxisId="right" y={18} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical 18%', fill: '#f43f5e', fontSize: 10 }} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="transformer_input_kwh"
              name="Tx Input (kWh)"
              stroke="#00f0ff"
              fill="url(#inputGrad)"
              strokeWidth={2}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="consumer_total_kwh"
              name="Consumer Total (kWh)"
              stroke="#10b981"
              fill="url(#consumerGrad)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="loss_percentage"
              name="Loss %"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.is_peak_hour) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="#f59e0b" 
                      stroke="#0f172a" 
                      strokeWidth={1.5} 
                      key={`dot-${payload.id}`}
                    />
                  );
                }
                return <circle cx={cx} cy={cy} r={2} fill="#f43f5e" key={`dot-${payload.id}`} />;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
