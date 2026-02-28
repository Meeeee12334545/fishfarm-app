import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { feedingLogs, tanks } from '../api';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { useToast } from '../components/Toast';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0,5);
const EMPTY = { tank_id: '', date: today(), time: nowTime(), food_type: '', amount_grams: '', fed_by: '', notes: '' };

export default function Feeding() {
  const [logs, setLogs] = useState([]);
  const [tankList, setTankList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterDate, setFilterDate] = useState(today());
  const [filterTank, setFilterTank] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterTank) params.tank_id = filterTank;
      const [l, t] = await Promise.all([feedingLogs.getAll(params), tanks.getAll()]);
      setLogs(l.data);
      setTankList(t.data);
    } catch { toast('Failed to load feeding logs', 'error'); }
  };

  useEffect(() => { load(); }, [filterDate, filterTank]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, date: today(), time: nowTime() }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ tank_id: r.tank_id, date: r.date, time: r.time, food_type: r.food_type, amount_grams: r.amount_grams || '', fed_by: r.fed_by || '', notes: r.notes || '' }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) await feedingLogs.update(editing.id, form);
      else await feedingLogs.create(form);
      toast(editing ? 'Log updated' : 'Feeding logged');
      setModalOpen(false); load();
    } catch { toast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feeding log?')) return;
    try { await feedingLogs.delete(id); toast('Deleted'); load(); }
    catch { toast('Failed to delete', 'error'); }
  };

  // Summary by tank for selected date
  const tankSummary = tankList.map(tank => {
    const fedToday = logs.filter(l => l.tank_id === tank.id && l.date === filterDate);
    return { ...tank, fedCount: fedToday.length, isFed: fedToday.length > 0 };
  });

  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'tank_name', label: 'Tank', sortable: true },
    { key: 'food_type', label: 'Food Type' },
    { key: 'amount_grams', label: 'Amount (g)', render: v => v ? `${v}g` : '-' },
    { key: 'fed_by', label: 'Fed By' },
    { key: 'notes', label: 'Notes', render: v => <span className="text-xs text-gray-500">{v || '-'}</span> },
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
        <div><h1 className="text-2xl font-bold text-gray-900">Feeding Logs</h1><p className="text-gray-500 text-sm">Daily feeding schedule and records</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Log Feeding
        </button>
      </div>

      {/* Feeding Status Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Feeding Status</h2>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tankSummary.map(t => (
            <div key={t.id} className={`rounded-lg p-3 border text-center
              ${t.isFed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm font-medium text-gray-800">{t.name}</p>
              <p className={`text-xs mt-1 ${t.isFed ? 'text-green-700' : 'text-red-600'}`}>
                {t.isFed ? `✓ ${t.fedCount}x fed` : '⚠ Not fed'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filterTank} onChange={e => setFilterTank(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">All Tanks</option>
          {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => { setFilterDate(''); setFilterTank(''); }}
          className="text-sm text-blue-600 hover:underline">Clear filters</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={logs} emptyMessage="No feeding logs found" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Feeding Log' : 'Log Feeding'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tank <span className="text-red-500">*</span></label>
            <select value={form.tank_id} onChange={e => setForm(f => ({...f, tank_id: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select tank...</option>
              {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Food Type <span className="text-red-500">*</span></label>
              <input type="text" value={form.food_type} onChange={e => setForm(f => ({...f, food_type: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (g)</label>
              <input type="number" step="0.1" value={form.amount_grams} onChange={e => setForm(f => ({...f, amount_grams: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Fed By</label>
            <input type="text" value={form.fed_by} onChange={e => setForm(f => ({...f, fed_by: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900">Save</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
