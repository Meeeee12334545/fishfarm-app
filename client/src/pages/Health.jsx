import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Filter } from 'lucide-react';
import { healthRecords, tanks } from '../api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import { useToast } from '../components/Toast';
import { format, isPast, parseISO } from 'date-fns';

const EMPTY = { tank_id: '', date: new Date().toISOString().split('T')[0], observation_type: 'routine', description: '', treatment: '', treated_by: '', follow_up_date: '', resolved: false };

export default function Health() {
  const [records, setRecords] = useState([]);
  const [tankList, setTankList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState({ tank_id: '', observation_type: '', resolved: '' });
  const toast = useToast();

  const load = async () => {
    try {
      const params = {};
      if (filters.tank_id) params.tank_id = filters.tank_id;
      if (filters.observation_type) params.observation_type = filters.observation_type;
      if (filters.resolved !== '') params.resolved = filters.resolved;
      const [recs, tks] = await Promise.all([healthRecords.getAll(params), tanks.getAll()]);
      setRecords(recs.data);
      setTankList(tks.data);
    } catch { toast('Failed to load health records', 'error'); }
  };

  useEffect(() => { load(); }, [filters]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r, resolved: !!r.resolved }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) await healthRecords.update(editing.id, form);
      else await healthRecords.create(form);
      toast(editing ? 'Record updated' : 'Record added');
      setModalOpen(false); load();
    } catch { toast('Failed to save record', 'error'); }
  };

  const handleResolve = async (id) => {
    try {
      const rec = records.find(r => r.id === id);
      await healthRecords.update(id, { ...rec, resolved: true });
      toast('Record resolved'); load();
    } catch { toast('Failed to update', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await healthRecords.delete(id); toast('Record deleted'); load(); }
    catch { toast('Failed to delete', 'error'); }
  };

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: v => v },
    { key: 'tank_name', label: 'Tank', sortable: true },
    { key: 'observation_type', label: 'Type', render: v => <StatusBadge status={v} type="healthType" /> },
    { key: 'description', label: 'Description', render: v => <span className="line-clamp-2 max-w-xs text-xs">{v}</span> },
    { key: 'follow_up_date', label: 'Follow-up', render: (v) => {
      if (!v) return '-';
      const overdue = isPast(parseISO(v));
      return <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>{v}{overdue ? ' ⚠️' : ''}</span>;
    }},
    { key: 'resolved', label: 'Status', render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${v ? 'text-green-600' : 'text-orange-600'}`}>{v ? 'Resolved' : 'Open'}</span>
        {!v && <button onClick={e => { e.stopPropagation(); handleResolve(row.id); }} className="text-green-500 hover:text-green-700"><CheckCircle size={14} /></button>}
      </div>
    )},
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
        <div><h1 className="text-2xl font-bold text-gray-900">Health Records</h1><p className="text-gray-500 text-sm">Fish health monitoring and treatment logs</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filters.tank_id} onChange={e => setFilters(f => ({...f, tank_id: e.target.value}))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Tanks</option>
          {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filters.observation_type} onChange={e => setFilters(f => ({...f, observation_type: e.target.value}))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {['routine','illness','treatment','mortality'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.resolved} onChange={e => setFilters(f => ({...f, resolved: e.target.value}))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="false">Open</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={records} emptyMessage="No health records found" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Health Record' : 'Add Health Record'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tank <span className="text-red-500">*</span></label>
              <select value={form.tank_id} onChange={e => setForm(f => ({...f, tank_id: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select tank...</option>
                {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Observation Type</label>
              <select value={form.observation_type} onChange={e => setForm(f => ({...f, observation_type: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['routine','illness','treatment','mortality'].map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Treated By</label>
              <input type="text" value={form.treated_by} onChange={e => setForm(f => ({...f, treated_by: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
            <input type="text" value={form.treatment} onChange={e => setForm(f => ({...f, treatment: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <input type="date" value={form.follow_up_date} onChange={e => setForm(f => ({...f, follow_up_date: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.resolved} onChange={e => setForm(f => ({...f, resolved: e.target.checked}))} className="rounded" />
            <span className="text-sm text-gray-700">Mark as resolved</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900">Save</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
