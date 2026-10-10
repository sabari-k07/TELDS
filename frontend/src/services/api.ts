import axios from 'axios';
import { 
  User, Feeder, Transformer, DashboardSummary, 
  EnergyAnalysis, Alert, AlertStatus, ReadingUploadResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('telds_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (username: string, password: string): Promise<{ access_token: string; user: User }> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await client.post('/auth/login', formData);
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  // Transformers & Feeders
  getFeeders: async (): Promise<Feeder[]> => {
    const res = await client.get('/transformers/feeders');
    return res.data;
  },
  getTransformers: async (feederId?: number): Promise<Transformer[]> => {
    const res = await client.get('/transformers', { params: { feeder_id: feederId } });
    return res.data;
  },
  getTransformerDetail: async (id: number) => {
    const res = await client.get(`/transformers/${id}`);
    return res.data;
  },

  // Analytics
  getDashboardSummary: async (transformerId?: number): Promise<DashboardSummary> => {
    const res = await client.get('/analytics/summary', { params: { transformer_id: transformerId } });
    return res.data;
  },
  getTimeseries: async (transformerId?: number, limit = 48): Promise<EnergyAnalysis[]> => {
    const res = await client.get('/analytics/timeseries', { params: { transformer_id: transformerId, limit } });
    return res.data;
  },
  getPeakHourComparison: async (transformerId?: number) => {
    const res = await client.get('/analytics/peak-hour-comparison', { params: { transformer_id: transformerId } });
    return res.data;
  },
  getTransformerRanking: async () => {
    const res = await client.get('/analytics/transformer-ranking');
    return res.data;
  },

  // Alerts
  getAlerts: async (statusFilter?: string, transformerId?: number): Promise<Alert[]> => {
    const res = await client.get('/alerts', { 
      params: { 
        status_filter: statusFilter, 
        transformer_id: transformerId 
      } 
    });
    return res.data;
  },
  updateAlertStatus: async (alertId: number, status: AlertStatus, notes?: string): Promise<Alert> => {
    const res = await client.patch(`/alerts/${alertId}/status`, {
      status,
      investigation_notes: notes,
    });
    return res.data;
  },

  // Upload
  uploadCSV: async (file: File): Promise<ReadingUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/readings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Reports
  getReportsSummary: async (transformerId?: number) => {
    const res = await client.get('/reports/summary', { params: { transformer_id: transformerId } });
    return res.data;
  },
  exportCSVUrl: (transformerId?: number) => {
    const params = transformerId ? `?transformer_id=${transformerId}` : '';
    return `${API_BASE_URL}/api/v1/reports/export-csv${params}`;
  },

  // Segment Localisation
  getFeederTopology: async () => {
    const res = await client.get('/segments/topology');
    return res.data;
  },
  getSegmentScenario: async (scenarioId: string) => {
    const res = await client.get(`/segments/scenarios/${scenarioId}`);
    return res.data;
  },
  sendSegmentTelemetry: async (packet: any) => {
    const res = await client.post('/segments/telemetry', packet);
    return res.data;
  }
};
