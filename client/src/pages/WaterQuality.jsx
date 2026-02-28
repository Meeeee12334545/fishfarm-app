import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { waterQuality, tanks } from '../api';
import WaterQualityCard from '../components/WaterQualityCard';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { useToast } from '../components/Toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EMPTY = { tank_id: '', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5), temperature_c: '', ph: '', ammonia_ppm: '', nitrite_ppm: '', nitrate_ppm: '', dissolved_oxygen: '', salinity: '', recorded_by: '', notes: '' };

export default function WaterQuality() {
  const [records, setRecords] = useState([]);
  const [latest, setLatest] = useState([]);
  const [tankList, setTankList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterTank, setFilterTank] = useState('');
  const [chartTank, setChartTank] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const params = { limit: 100 };
      if (filterTank) params.tank_id = filterTank;
      const [recs, lat, tks] = await Promise.all([
        waterQuality.getAll(params),
        waterQuality.getLatest(),
        tanks.getAll()
      ]);
      setRecords(recs.data);
      setLatest(lat.data);
      setTankList(tks.data);
    } catch { toast('Failed to load', 'error'); }
  };

  useEffect(() => { load(); }, [filterTank]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5) }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ tank_id: r.tank_id, date: r.date, time: r.time, temperature_c: r.temperature_c || '', ph: r.ph || '', ammonia_ppm: r.ammonia_ppm || '', nitrite_ppm: r.nitrite_ppm || '', nitrate_ppm: r.nitrate_ppm || '', dissolved_oxygen: r.dissolved_oxygen || '', salinity: r.salinity || '', recorded_by: r.recorded_by || '', notes: r.notes || '' }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) await waterQuality.update(editing.id, form);
      else await waterQuality.create(form);
      toast(editing ? 'Reading updated' : 'Reading saved');
      setModalOpen(false); load();
    } catch { toast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reading?')) return;
    try { await waterQuality.delete(id); toast('Deleted'); load(); }
    catch { toast('Failed to delete', 'error'); }
  };

  // Chart data for selected tank
  const chartData = (chartTank ? records.filter(r => r.tank_id === parseInt(chartTank)) : [])
    .slice(0, 14).reverse()
    .map(r => ({ date: r.date, pH: r.ph, Temp: r.temperature_c, Ammonia: r.ammonia_ppm }));

  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time' },
    { key: 'tank_name', label: 'Tank', sortable: true },
    { key: 'temperature_c', label: 'Temp °C', render: v => v ?? '-' },
    { key: 'ph', label: 'pH', render: (v, row) => {
      const bad = v && (v < 6.0 || v > 8.5);
      return <span className={bad ? 'text-red-600 font-semibold' : ''}>{v ?? '-'}{bad ? ' ⚠' : ''}</span>;
    }},
    { key: 'ammonia_ppm', label: 'NH₃ ppm', render: (v) => {
      const bad = v && v > 0.05;
      return <span className={bad ? 'text-red-600 font-semibold' : ''}>{v ?? '-'}{bad ? ' ⚠' : ''}</span>;
    }},
    { key: 'nitrite_ppm', label: 'NO₂ ppm', render: v => v ?? '-' },
    { key: 'nitrate_ppm', label: 'NO₃ ppm', render: v => v ?? '-' },
    { key: 'recorded_by', label: 'By' },
    { key: 'id', label: '', render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={e => { e.stopPropagation(); openEdit(row); }} className="text-xs text-blue-600 hover:underline">Edit</button>
        <button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} className="text-xs text-red-500 hover:underline ml-1">Del</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Water Quality</h1><p className="text-gray-500 text-sm">Monitor tank water parameters</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Log Reading
        </button>
      </div>

      {/* Latest per tank grid */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Current Readings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tankList.map(tank => {
            const reading = latest.find(r => r.tank_id === tank.id);
            return <WaterQualityCard key={tank.id} reading={reading} tankName={tank.name} />;
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Historical Trends</h2>
          <select value={chartTank} onChange={e => setChartTank(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Select tank...</option>
            {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {chartTank && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pH" stroke="#0891b2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Ammonia" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Select a tank to view trend chart</p>
        )}
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filterTank} onChange={e => setFilterTank(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Tanks</option>
          {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={records} emptyMessage="No water quality records found" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Reading' : 'Log Water Quality'} size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tank <span className="text-red-500">*</span></label>
            <select value={form.tank_id} onChange={e => setForm(f => ({...f, tank_id: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select tank...</option>
              {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            {[['date','Date','date'],['time','Time','time'],['temperature_c','Temperature (°C)','number'],['ph','pH','number'],['ammonia_ppm','Ammonia (ppm)','number'],['nitrite_ppm','Nitrite (ppm)','number'],['nitrate_ppm','Nitrate (ppm)','number'],['dissolved_oxygen','Dissolved O₂','number'],['salinity','Salinity','number'],['recorded_by','Recorded By','text']].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} step="any" value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-[#0891b2] text-white py-2 rounded-lg text-sm font-medium hover:bg-cyan-700">Save Reading</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
