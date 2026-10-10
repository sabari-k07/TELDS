import React, { useState, FC } from 'react';
import { api } from '../../services/api';
import { FileSpreadsheet, Download, Filter, Calendar } from 'lucide-react';

interface ReportRow {
  timestamp: string;
  transformer_code: string;
  transformer_name: string;
  location: string;
  input_kwh: number;
  consumer_kwh: number;
  difference_kwh: number;
  loss_percentage: number;
  technical_loss_kwh: number;
  unexplained_loss_kwh: number;
  is_peak_hour: string;
  is_anomaly: string;
  anomaly_reason: string;
}

export const ReportsView: FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Realistic sample rows
  const reportRows: ReportRow[] = [
    {
      timestamp: '2026-10-10 20:00',
      transformer_code: 'TX-RES-308',
      transformer_name: 'Residential DT 308 (Green Park)',
      location: 'Green Park Colony',
      input_kwh: 52.0,
      consumer_kwh: 34.2,
      difference_kwh: 17.8,
      loss_percentage: 34.23,
      technical_loss_kwh: 3.12,
      unexplained_loss_kwh: 14.68,
      is_peak_hour: 'Yes',
      is_anomaly: 'Yes',
      anomaly_reason: 'Peak hour unverified discrepancy'
    },
    {
      timestamp: '2026-10-10 19:00',
      transformer_code: 'TX-RES-308',
      transformer_name: 'Residential DT 308 (Green Park)',
      location: 'Green Park Colony',
      input_kwh: 45.0,
      consumer_kwh: 32.0,
      difference_kwh: 13.0,
      loss_percentage: 28.89,
      technical_loss_kwh: 2.7,
      unexplained_loss_kwh: 10.3,
      is_peak_hour: 'Yes',
      is_anomaly: 'Yes',
      anomaly_reason: 'Elevated peak discrepancy'
    },
    {
      timestamp: '2026-10-10 12:00',
      transformer_code: 'TX-RES-308',
      transformer_name: 'Residential DT 308 (Green Park)',
      location: 'Green Park Colony',
      input_kwh: 28.0,
      consumer_kwh: 26.4,
      difference_kwh: 1.6,
      loss_percentage: 5.71,
      technical_loss_kwh: 1.68,
      unexplained_loss_kwh: 0.0,
      is_peak_hour: 'No',
      is_anomaly: 'No',
      anomaly_reason: 'Normal technical baseline'
    },
    {
      timestamp: '2026-10-10 06:00',
      transformer_code: 'TX-RES-308',
      transformer_name: 'Residential DT 308 (Green Park)',
      location: 'Green Park Colony',
      input_kwh: 24.0,
      consumer_kwh: 22.6,
      difference_kwh: 1.4,
      loss_percentage: 5.83,
      technical_loss_kwh: 1.44,
      unexplained_loss_kwh: 0.0,
      is_peak_hour: 'No',
      is_anomaly: 'No',
      anomaly_reason: 'Normal technical baseline'
    }
  ];

  const handleExportCSV = () => {
    const csvHeader = "Timestamp,Transformer Code,Transformer Name,Input (kWh),Consumer (kWh),Difference (kWh),Loss %,Tech Loss (kWh),Unexplained Loss (kWh),Peak Hour,Anomaly,Notes\n";
    const csvContent = reportRows.map(r => 
      `"${r.timestamp}","${r.transformer_code}","${r.transformer_name}",${r.input_kwh},${r.consumer_kwh},${r.difference_kwh},${r.loss_percentage}%,${r.technical_loss_kwh},${r.unexplained_loss_kwh},"${r.is_peak_hour}","${r.is_anomaly}","${r.anomaly_reason}"`
    ).join("\n");

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TELDS_${period.toUpperCase()}_Energy_Audit_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <span>Energy Audit & Regulatory Reporting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download compliant utility audit spreadsheets with separated technical vs unexplained loss breakdown.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((p: 'daily' | 'weekly' | 'monthly') => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                  period === p ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Transformer</th>
              <th className="py-3.5 px-4">Input (kWh)</th>
              <th className="py-3.5 px-4">Consumer (kWh)</th>
              <th className="py-3.5 px-4">Diff (kWh)</th>
              <th className="py-3.5 px-4">Loss %</th>
              <th className="py-3.5 px-4">Unexplained (kWh)</th>
              <th className="py-3.5 px-4">Peak Hour</th>
              <th className="py-3.5 px-4">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {reportRows.map((r: ReportRow, i: number) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-400">{r.timestamp}</td>
                <td className="py-3 px-4 font-sans font-semibold text-white">{r.transformer_code}</td>
                <td className="py-3 px-4 text-cyan-300">{r.input_kwh}</td>
                <td className="py-3 px-4 text-emerald-300">{r.consumer_kwh}</td>
                <td className="py-3 px-4 text-amber-300">{r.difference_kwh}</td>
                <td className="py-3 px-4 font-bold text-rose-400">{r.loss_percentage}%</td>
                <td className="py-3 px-4 text-rose-300">{r.unexplained_loss_kwh}</td>
                <td className="py-3 px-4 font-sans">
                  {r.is_peak_hour === 'Yes' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Peak
                    </span>
                  ) : (
                    <span className="text-slate-500">No</span>
                  )}
                </td>
                <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{r.anomaly_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
