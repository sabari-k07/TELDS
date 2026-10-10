/// <reference path="./ambient.d.ts" />
import React, { useState, useEffect, FC } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { KPICards } from './components/dashboard/KPICards';
import { EnergyDifferenceChart } from './components/dashboard/EnergyDifferenceChart';
import { PeakHourAnalysis } from './components/dashboard/PeakHourAnalysis';
import { TransformerLossRanking } from './components/dashboard/TransformerLossRanking';
import { TransformerList } from './components/transformers/TransformerList';
import { CSVUploader } from './components/upload/CSVUploader';
import { AlertTracker } from './components/alerts/AlertTracker';
import { ReportsView } from './components/reports/ReportsView';
import { SegmentLocalisationView } from './components/segments/SegmentLocalisationView';
import { api } from './services/api';
import { DashboardSummary, EnergyAnalysis, Alert, Transformer, Feeder } from './types';
import { Cpu, RefreshCcw } from 'lucide-react';

const mockSummary: DashboardSummary = {
  period: 'Last 7 days',
  total_transformer_input_kwh: 14250.0,
  total_consumer_energy_kwh: 12180.0,
  total_energy_difference_kwh: 2070.0,
  average_loss_percentage: 14.53,
  technical_loss_kwh: 855.0,
  unexplained_loss_kwh: 1215.0,
  peak_hour_loss_percentage: 24.8,
  total_transformers_monitored: 3,
  active_anomalies_count: 2,
  high_loss_transformers_count: 2
};

const mockTimeseries: EnergyAnalysis[] = [
  { id: 1, timestamp: '2026-10-10 00:00', time_label: '00:00', transformer_input_kwh: 18.5, consumer_total_kwh: 17.5, energy_difference_kwh: 1.0, loss_percentage: 5.41, technical_loss_kwh: 1.11, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false },
  { id: 2, timestamp: '2026-10-10 03:00', time_label: '03:00', transformer_input_kwh: 16.0, consumer_total_kwh: 15.2, energy_difference_kwh: 0.8, loss_percentage: 5.0, technical_loss_kwh: 0.96, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false },
  { id: 3, timestamp: '2026-10-10 06:00', time_label: '06:00', transformer_input_kwh: 24.0, consumer_total_kwh: 22.6, energy_difference_kwh: 1.4, loss_percentage: 5.83, technical_loss_kwh: 1.44, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false },
  { id: 4, timestamp: '2026-10-10 09:00', time_label: '09:00', transformer_input_kwh: 32.0, consumer_total_kwh: 30.1, energy_difference_kwh: 1.9, loss_percentage: 5.94, technical_loss_kwh: 1.92, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false },
  { id: 5, timestamp: '2026-10-10 12:00', time_label: '12:00', transformer_input_kwh: 28.0, consumer_total_kwh: 26.4, energy_difference_kwh: 1.6, loss_percentage: 5.71, technical_loss_kwh: 1.68, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false },
  { id: 6, timestamp: '2026-10-10 15:00', time_label: '15:00', transformer_input_kwh: 35.0, consumer_total_kwh: 32.8, energy_difference_kwh: 2.2, loss_percentage: 6.29, technical_loss_kwh: 2.1, unexplained_loss_kwh: 0.1, is_peak_hour: false, is_anomaly: false },
  { id: 7, timestamp: '2026-10-10 18:00', time_label: '18:00', transformer_input_kwh: 38.0, consumer_total_kwh: 34.5, energy_difference_kwh: 3.5, loss_percentage: 9.21, technical_loss_kwh: 2.28, unexplained_loss_kwh: 1.22, is_peak_hour: false, is_anomaly: false },
  { id: 8, timestamp: '2026-10-10 19:00', time_label: '19:00', transformer_input_kwh: 45.0, consumer_total_kwh: 32.0, energy_difference_kwh: 13.0, loss_percentage: 28.89, technical_loss_kwh: 2.7, unexplained_loss_kwh: 10.3, is_peak_hour: true, is_anomaly: true, anomaly_reason: 'Peak hour unverified difference' },
  { id: 9, timestamp: '2026-10-10 20:00', time_label: '20:00', transformer_input_kwh: 52.0, consumer_total_kwh: 34.2, energy_difference_kwh: 17.8, loss_percentage: 34.23, technical_loss_kwh: 3.12, unexplained_loss_kwh: 14.68, is_peak_hour: true, is_anomaly: true, anomaly_reason: 'Peak hour unverified difference' },
  { id: 10, timestamp: '2026-10-10 21:00', time_label: '21:00', transformer_input_kwh: 48.0, consumer_total_kwh: 35.5, energy_difference_kwh: 12.5, loss_percentage: 26.04, technical_loss_kwh: 2.88, unexplained_loss_kwh: 9.62, is_peak_hour: true, is_anomaly: true, anomaly_reason: 'Peak hour unverified difference' },
  { id: 11, timestamp: '2026-10-10 22:00', time_label: '22:00', transformer_input_kwh: 30.0, consumer_total_kwh: 28.1, energy_difference_kwh: 1.9, loss_percentage: 6.33, technical_loss_kwh: 1.8, unexplained_loss_kwh: 0.1, is_peak_hour: false, is_anomaly: false },
  { id: 12, timestamp: '2026-10-10 23:00', time_label: '23:00', transformer_input_kwh: 22.0, consumer_total_kwh: 20.8, energy_difference_kwh: 1.2, loss_percentage: 5.45, technical_loss_kwh: 1.32, unexplained_loss_kwh: 0.0, is_peak_hour: false, is_anomaly: false }
];

const mockAlerts: Alert[] = [
  {
    id: 1,
    title: 'Critical Peak-Hour Discrepancy on Residential DT 308',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    loss_percentage: 34.23,
    energy_difference_kwh: 17.8,
    is_peak_hour: true,
    description: 'Discrepancy exceeds 18% limit during 20:00 evening peak window. Technical loss estimate: 3.12 kWh. Unexplained difference: 14.68 kWh.',
    investigation_notes: '[2026-10-10 21:15 by Rajesh Kumar]: Dispatched mobile metering inspection van to Green Park Sector 2.',
    transformer_id: 3,
    transformer_name: 'Residential DT 308 (Green Park)',
    transformer_code: 'TX-RES-308',
    created_at: '2026-10-10T20:05:00Z',
    updated_at: '2026-10-10T21:15:00Z'
  },
  {
    id: 2,
    title: 'Elevated Loss Alert on Commercial DT 204',
    severity: 'HIGH',
    status: 'OPEN',
    loss_percentage: 16.4,
    energy_difference_kwh: 24.6,
    is_peak_hour: false,
    description: 'Loss rate 16.4% on City Center Commercial Transformer. Unaccounted energy: 15.6 kWh.',
    transformer_id: 2,
    transformer_name: 'Commercial Transformer 204 (Mall Complex)',
    transformer_code: 'TX-COM-204',
    created_at: '2026-10-10T15:30:00Z',
    updated_at: '2026-10-10T15:30:00Z'
  }
];

const mockTransformers: Transformer[] = [
  { id: 1, feeder_id: 1, code: 'TX-IND-101', name: 'Distribution Transformer 101', location: 'Sector 4 Industrial Area', capacity_kva: 500, status: 'ACTIVE', created_at: new Date().toISOString(), consumer_count: 12 },
  { id: 2, feeder_id: 2, code: 'TX-COM-204', name: 'Commercial Transformer 204', location: 'City Center Mall Complex', capacity_kva: 315, status: 'ACTIVE', created_at: new Date().toISOString(), consumer_count: 28 },
  { id: 3, feeder_id: 3, code: 'TX-RES-308', name: 'Residential DT 308 (Green Park)', location: 'Green Park Colony Ring Road', capacity_kva: 250, status: 'ACTIVE', created_at: new Date().toISOString(), consumer_count: 45 }
];

const mockFeeders: Feeder[] = [
  { id: 1, code: 'FDR-11KV-01', name: 'North Industrial Feeder', substation: 'Central 66/11kV Substation', voltage_kv: 11.0, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 2, code: 'FDR-11KV-02', name: 'Metro Commercial Feeder', substation: 'Central 66/11kV Substation', voltage_kv: 11.0, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 3, code: 'FDR-11KV-03', name: 'East Suburban Feeder', substation: 'Suburban 33/11kV Substation', voltage_kv: 11.0, status: 'ACTIVE', created_at: new Date().toISOString() },
];

export const AppContent: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary>(mockSummary);
  const [timeseries, setTimeseries] = useState<EnergyAnalysis[]>(mockTimeseries);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [transformers, setTransformers] = useState<Transformer[]>(mockTransformers);
  const [feeders, setFeeders] = useState<Feeder[]>(mockFeeders);
  const [selectedTxId, setSelectedTxId] = useState<number | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const txId = selectedTxId === 'ALL' ? undefined : selectedTxId;
      const [sumRes, timeRes, alertRes, txList, fList] = await Promise.allSettled([
        api.getDashboardSummary(txId),
        api.getTimeseries(txId),
        api.getAlerts(undefined, txId),
        api.getTransformers(),
        api.getFeeders()
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (timeRes.status === 'fulfilled') setTimeseries(timeRes.value);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value);
      if (txList.status === 'fulfilled' && txList.value.length > 0) setTransformers(txList.value);
      if (fList.status === 'fulfilled' && fList.value.length > 0) setFeeders(fList.value);
    } catch {
      // Fallbacks kept active
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTxId]);

  const peakComparison = {
    peak_hours_window: '19:00 - 22:00 (7 PM - 10 PM)',
    peak_stats: {
      count: 3,
      avg_loss_pct: 29.7,
      total_diff_kwh: 43.3,
      anomalies: 2
    },
    off_peak_stats: {
      count: 9,
      avg_loss_pct: 5.7,
      total_diff_kwh: 12.8,
      anomalies: 0
    }
  };

  const rankings = [
    {
      transformer_id: 3,
      code: 'TX-RES-308',
      name: 'Residential DT 308 (Green Park)',
      location: 'Green Park Colony',
      capacity_kva: 250,
      average_loss_percentage: 24.8,
      anomalies_detected: 2,
      status: 'ACTIVE'
    },
    {
      transformer_id: 2,
      code: 'TX-COM-204',
      name: 'Commercial Transformer 204 (Mall Complex)',
      location: 'City Center Mall',
      capacity_kva: 315,
      average_loss_percentage: 16.4,
      anomalies_detected: 1,
      status: 'ACTIVE'
    },
    {
      transformer_id: 1,
      code: 'TX-IND-101',
      name: 'Distribution Transformer 101 (Sector 4)',
      location: 'Sector 4 Industrial',
      capacity_kva: 500,
      average_loss_percentage: 6.2,
      anomalies_detected: 0,
      status: 'ACTIVE'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          anomalyCount={alerts.filter((a: Alert) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length} 
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-medium">Select Monitored Transformer:</span>
                  <select
                    value={selectedTxId}
                    onChange={(e: any) => setSelectedTxId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ALL">All Transformers (Aggregated)</option>
                    {transformers.map((t: Transformer) => (
                      <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={loadData}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Telemetry</span>
                </button>
              </div>

              {/* KPI summary */}
              <KPICards summary={summary} />

              {/* Main Chart */}
              <EnergyDifferenceChart data={timeseries} />

              {/* Grid 2-cols: Peak Hour + Ranking */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PeakHourAnalysis peakComparison={peakComparison} />
                <TransformerLossRanking 
                  rankings={rankings} 
                  onSelectTransformer={(id: number) => {
                    setSelectedTxId(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </div>
            </div>
          )}

          {/* Segment Localisation Tab */}
          {activeTab === 'segments' && (
            <SegmentLocalisationView />
          )}

          {/* Feeders Tab */}
          {activeTab === 'transformers' && (
            <TransformerList 
              transformers={transformers} 
              feeders={feeders} 
              onSelectTransformer={(id: number) => {
                setSelectedTxId(id);
                setActiveTab('dashboard');
              }} 
            />
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <CSVUploader onUploadSuccess={loadData} />
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <AlertTracker alerts={alerts} onAlertUpdated={loadData} />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
