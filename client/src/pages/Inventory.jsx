import React, { useState, useEffect } from 'react';
import { Plus, Filter, AlertTriangle } from 'lucide-react';
import { inventory } from '../api';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

const EMPTY = { name: '', category: 'food', quantity: '', unit: '', reorder_level: '', supplier: '', cost_per_unit: '', notes: '' };
const CATEGORIES = ['food', 'medication', 'equipment', 'chemical'];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterCat, setFilterCat] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      const params = {};
      if (filterCat) params.category = filterCat;
      const res = await inventory.getAll(params);
      setItems(res.data);
    } catch { toast('Failed to load inventory', 'error'); }
  };

  useEffect(() => { load(); }, [filterCat]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, category: r.category, quantity: r.quantity, unit: r.unit, reorder_level: r.reorder_level || '', supplier: r.supplier || '', cost_per_unit: r.cost_per_unit || '', notes: r.notes || '' }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) await inventory.update(editing.id, form);
      else await inventory.create(form);
      toast(editing ? 'Item updated' : 'Item added');
      setModalOpen(false); load();
    } catch { toast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await inventory.delete(id); toast('Deleted'); load(); }
    catch { toast('Failed to delete', 'error'); }
  };

  const displayed = showLowOnly ? items.filter(i => i.reorder_level !== null && i.quantity <= i.reorder_level) : items;
  const lowCount = items.filter(i => i.reorder_level !== null && i.quantity <= i.reorder_level).length;

  const columns = [
    { key: 'name', label: 'Item', sortable: true },
    { key: 'category', label: 'Category', render: v => <StatusBadge status={v} type="tankType" /> },
    { key: 'quantity', label: 'Quantity', render: (v, row) => {
      const low = row.reorder_level !== null && v <= row.reorder_level;
      return <span className={low ? 'text-red-600 font-semibold' : ''}>{v} {row.unit}{low ? ' ⚠' : ''}</span>;
    }},
    { key: 'reorder_level', label: 'Reorder At', render: (v, row) => v ? `${v} ${row.unit}` : '-' },
    { key: 'supplier', label: 'Supplier', render: v => <span className="text-xs">{v || '-'}</span> },
    { key: 'cost_per_unit', label: 'Cost/Unit', render: (v, row) => v ? `$${parseFloat(v).toFixed(2)}/${row.unit}` : '-' },
    { key: 'last_updated', label: 'Updated', sortable: true },
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm">Manage supplies, food, and equipment</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {lowCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500" />
          <span className="text-red-700 text-sm font-medium">{lowCount} item{lowCount > 1 ? 's' : ''} below reorder level</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={showLowOnly} onChange={e => setShowLowOnly(e.target.checked)} className="rounded" />
          Show low stock only
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={displayed} emptyMessage="No inventory items found" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Inventory Item'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" step="any" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} placeholder="kg, L, units..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input type="number" step="any" value={form.reorder_level} onChange={e => setForm(f => ({...f, reorder_level: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost/Unit ($)</label>
              <input type="number" step="0.01" value={form.cost_per_unit} onChange={e => setForm(f => ({...f, cost_per_unit: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input type="text" value={form.supplier} onChange={e => setForm(f => ({...f, supplier: e.target.value}))}
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
