import React, { useState, FC } from 'react';
import { Alert, AlertStatus, AlertSeverity } from '../../types';
import { api } from '../../services/api';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';

interface AlertTrackerProps {
  alerts: Alert[];
  onAlertUpdated: () => void;
}

export const AlertTracker: FC<AlertTrackerProps> = ({ alerts, onAlertUpdated }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [newStatus, setNewStatus] = useState<AlertStatus>('INVESTIGATING');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleOpenModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setNewStatus(alert.status);
    setNotes('');
  };

  const handleUpdate = async () => {
    if (!selectedAlert) return;
    setUpdating(true);
    try {
      await api.updateAlertStatus(selectedAlert.id, newStatus, notes);
      onAlertUpdated();
      setSelectedAlert(null);
    } catch {
      // Mock local update if offline
      selectedAlert.status = newStatus;
      if (notes) {
        selectedAlert.investigation_notes = (selectedAlert.investigation_notes || '') + '\n' + notes;
      }
      setSelectedAlert(null);
      onAlertUpdated();
    } finally {
      setUpdating(false);
    }
  };

  const severityBadge = (sev: AlertSeverity) => {
    const colors: Record<AlertSeverity, string> = {
      CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      LOW: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colors[sev]}`}>
        {sev}
      </span>
    );
  };

  const statusBadge = (st: AlertStatus) => {
    const map: Record<AlertStatus, { label: string; color: string }> = {
      OPEN: { label: 'Open', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
      INVESTIGATING: { label: 'Investigating', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
      FIELD_INSPECTION_SCHEDULED: { label: 'Field Team Dispatched', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      RESOLVED: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      FALSE_ALARM: { label: 'False Alarm / Meter Issue', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[st].color}`}>
        {map[st].label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Energy Anomaly Alert & Investigation Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review threshold breaches, assign inspection teams, and track resolution audit notes.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert: Alert) => (
          <div
            key={alert.id}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {severityBadge(alert.severity)}
                {statusBadge(alert.status)}
                {alert.is_peak_hour && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                    <Clock className="w-3 h-3" />
                    Peak Hour
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{alert.title}</span>
                <span className="text-xs text-cyan-400 font-mono">({alert.transformer_name || 'TX-RES-308'})</span>
              </h4>

              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {alert.description || `Discrepancy: ${alert.loss_percentage}% (${alert.energy_difference_kwh} kWh). Feeder inspection advised.`}
              </p>

              {alert.investigation_notes && (
                <div className="mt-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
                  <div className="text-[10px] text-cyan-400 mb-1 font-sans font-semibold">Investigation Log:</div>
                  {alert.investigation_notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleOpenModal(alert)}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-black font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <span>Update / Investigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-slate-800">
            No active energy anomalies recorded.
          </div>
        )}
      </div>

      {/* Investigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Update Investigation Status</span>
            </h3>

            <div className="space-y-1 text-xs">
              <div className="text-slate-400">Transformer: <span className="text-white font-medium">{selectedAlert.transformer_name}</span></div>
              <div className="text-slate-400">Discrepancy: <span className="text-rose-400 font-bold">{selectedAlert.loss_percentage}%</span></div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">New Status:</label>
              <select
                value={newStatus}
                onChange={(e: any) => setNewStatus(e.target.value as AlertStatus)}
                className="w-full mt-1.5 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-400"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="FIELD_INSPECTION_SCHEDULED">FIELD INSPECTION SCHEDULED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="FALSE_ALARM">FALSE ALARM (METER MALFUNCTION)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Investigation Notes & Actions Taken:</label>
              <textarea
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                placeholder="e.g. Field crew inspected pole #42. Discovered loose clamp causing 8% thermal drop. Repaired and normalized."
                rows={3}
                className="w-full mt-1.5 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={updating}
                onClick={handleUpdate}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400"
              >
                {updating ? 'Saving...' : 'Save & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
