import React, { useState, useEffect } from 'react';
import { feedingLogs, waterQuality, healthRecords, tanks } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tankList, setTankList] = useState([]);
  const [chartTank, setChartTank] = useState('');
  const [feeding, setFeeding] = useState([]);
  const [wqHistory, setWqHistory] = useState([]);
  const [health, setHealth] = useState([]);
  const [wqLatest, setWqLatest] = useState([]);
  const toast = useToast();

  const load = async () => {
    try {
      const [tks, fl, hr] = await Promise.all([
        tanks.getAll(),
        feedingLogs.getAll({ date }),
        healthRecords.getAll({}),
      ]);
      setTankList(tks.data);
      setFeeding(fl.data);
      setHealth(hr.data.filter(h => h.date === date));
      if (!chartTank && tks.data.length > 0) setChartTank(String(tks.data[0].id));
    } catch { toast('Failed to load', 'error'); }
  };

  const loadChart = async () => {
    if (!chartTank) return;
    try {
      const res = await waterQuality.getAll({ tank_id: chartTank, limit: 14 });
      setWqHistory(res.data.slice(0, 14).reverse());
    } catch {}
  };

  useEffect(() => { load(); }, [date]);
  useEffect(() => { loadChart(); }, [chartTank]);

  const fedTanks = tankList.filter(t => feeding.some(f => f.tank_id === t.id));
  const notFedTanks = tankList.filter(t => !feeding.some(f => f.tank_id === t.id));

  const chartData = wqHistory.map(r => ({ date: r.date, pH: r.ph, Temp: r.temperature_c, Ammonia: r.ammonia_ppm }));

  const healthByType = ['routine','illness','treatment','mortality'].map(type => ({
    type, count: health.filter(h => h.observation_type === type).length
  })).filter(h => h.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-gray-500 text-sm">Daily summaries and trend analysis</p></div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Daily Summary — {date}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feeding */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Feeding ({feeding.length} records)</h3>
            {fedTanks.length > 0 ? (
              <div className="space-y-1">
                {fedTanks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{t.name}</span>
                    <span className="text-gray-400 text-xs">{feeding.filter(f => f.tank_id === t.id).length}x</span>
                  </div>
                ))}
                {notFedTanks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-400">{t.name}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No feeding records for this date</p>}
          </div>

          {/* Health */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Health Records ({health.length})</h3>
            {health.length > 0 ? (
              <div className="space-y-1">
                {health.map(h => (
                  <div key={h.id} className="flex items-start gap-2 text-sm py-1 border-b border-gray-100">
                    <StatusBadge status={h.observation_type} type="healthType" />
                    <span className="text-gray-600 text-xs line-clamp-2">{h.tank_name}: {h.description}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No health records for this date</p>}
          </div>

          {/* Summary Stats */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Tanks fed</span>
                <span className="font-medium">{fedTanks.length}/{tankList.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Health records</span>
                <span className="font-medium">{health.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Illnesses logged</span>
                <span className={`font-medium ${health.filter(h => h.observation_type === 'illness').length > 0 ? 'text-red-600' : ''}`}>
                  {health.filter(h => h.observation_type === 'illness').length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Mortalities</span>
                <span className={`font-medium ${health.filter(h => h.observation_type === 'mortality').length > 0 ? 'text-red-600' : ''}`}>
                  {health.filter(h => h.observation_type === 'mortality').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Water Quality Trends Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Water Quality Trends (Last 14 readings)</h2>
          <select value={chartTank} onChange={e => setChartTank(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Ammonia" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-gray-400 py-10">No water quality data available for this tank</p>}
      </div>

      {/* Health summary bar chart */}
      {healthByType.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Health Observations — {date}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={healthByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0891b2" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
