import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Droplets } from 'lucide-react';
import { tanks as tanksApi, fishStock, waterQuality } from '../api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import WaterQualityCard from '../components/WaterQualityCard';
import { useToast } from '../components/Toast';

const EMPTY_TANK = { name: '', type: 'breeding', capacity_liters: '', status: 'active', notes: '' };
const EMPTY_WQ = { tank_id: '', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5), temperature_c: '', ph: '', ammonia_ppm: '', nitrite_ppm: '', nitrate_ppm: '', dissolved_oxygen: '', salinity: '', recorded_by: '', notes: '' };

export default function Tanks() {
  const [tanks, setTanks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [wqModalOpen, setWqModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_TANK);
  const [wqForm, setWqForm] = useState(EMPTY_WQ);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const load = async () => {
    try { setTanks((await tanksApi.getAll()).data); }
    catch { toast('Failed to load tanks', 'error'); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_TANK); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, type: t.type, capacity_liters: t.capacity_liters || '', status: t.status, notes: t.notes || '' }); setModalOpen(true); };

  const openDetail = async (t) => {
    try {
      const res = await tanksApi.getById(t.id);
      setSelected(res.data);
      setDetailOpen(true);
    } catch { toast('Failed to load tank details', 'error'); }
  };

  const openWQ = (t) => {
    setWqForm({ ...EMPTY_WQ, tank_id: t.id, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5) });
    setDetailOpen(false);
    setWqModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) await tanksApi.update(editing.id, form);
      else await tanksApi.create(form);
      toast(editing ? 'Tank updated' : 'Tank added');
      setModalOpen(false); load();
    } catch { toast('Failed to save tank', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tank?')) return;
    try { await tanksApi.delete(id); toast('Tank deleted'); load(); }
    catch { toast('Failed to delete tank', 'error'); }
  };

  const handleWQSave = async () => {
    try {
      await waterQuality.create(wqForm);
      toast('Water quality logged'); setWqModalOpen(false);
    } catch { toast('Failed to save reading', 'error'); }
  };

  const typeColors = { breeding: 'border-l-pink-400', 'grow-out': 'border-l-blue-400', quarantine: 'border-l-orange-400', display: 'border-l-purple-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Tanks</h1><p className="text-gray-500 text-sm">Manage all fish tanks</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Add Tank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tanks.map(tank => (
          <div key={tank.id} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${typeColors[tank.type] || 'border-l-gray-300'} shadow-sm p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{tank.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={tank.type} type="tankType" />
                  <StatusBadge status={tank.status} type="tank" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openDetail(tank)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Eye size={16} /></button>
                <button onClick={() => openEdit(tank)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(tank.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div><span className="text-gray-400">Capacity:</span> {tank.capacity_liters ? `${tank.capacity_liters}L` : '-'}</div>
              <div><span className="text-gray-400">Stock:</span> {tank.current_stock || 0} fish</div>
            </div>
            {tank.notes && <p className="mt-2 text-xs text-gray-400 line-clamp-2">{tank.notes}</p>}
            <button onClick={() => openWQ(tank)} className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-[#0891b2] border border-[#0891b2] rounded-lg py-1.5 hover:bg-cyan-50">
              <Droplets size={14} /> Log Water Quality
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tank' : 'Add Tank'}>
        <div className="space-y-4">
          {[['name','Tank Name','text',true],['capacity_liters','Capacity (Litres)','number',false]].map(([field, label, type, req]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && <span className="text-red-500 ml-1">*</span>}</label>
              <input type={type} value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['breeding','grow-out','quarantine','display'].map(t => <option key={t} value={t}>{t}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['active','maintenance','empty'].map(s => <option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900">Save</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Tank Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={selected?.name} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2"><StatusBadge status={selected.type} type="tankType" /><StatusBadge status={selected.status} type="tank" /></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Capacity:</span> <span className="font-medium">{selected.capacity_liters ? `${selected.capacity_liters}L` : '-'}</span></div>
              <div><span className="text-gray-500">Current Stock:</span> <span className="font-medium">{selected.current_stock || 0} fish</span></div>
            </div>
            {selected.notes && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.notes}</p>}
            {selected.stock?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Fish Stock</h4>
                <div className="space-y-1">
                  {selected.stock.map(s => (
                    <div key={s.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-800">{s.species_name}</span>
                      <span className="font-medium text-gray-600">{s.quantity} fish</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.latestWQ && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Latest Water Quality</h4>
                <WaterQualityCard reading={selected.latestWQ} tankName={selected.name} />
              </div>
            )}
            <button onClick={() => openWQ(selected)} className="w-full flex items-center justify-center gap-2 bg-[#0891b2] text-white py-2 rounded-lg text-sm font-medium hover:bg-cyan-700">
              <Droplets size={16} /> Log Water Quality
            </button>
          </div>
        )}
      </Modal>

      {/* WQ Quick Log Modal */}
      <Modal isOpen={wqModalOpen} onClose={() => setWqModalOpen(false)} title="Log Water Quality">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['date','Date','date'],['time','Time','time'],['temperature_c','Temperature (°C)','number'],['ph','pH','number'],['ammonia_ppm','Ammonia (ppm)','number'],['nitrite_ppm','Nitrite (ppm)','number'],['nitrate_ppm','Nitrate (ppm)','number'],['dissolved_oxygen','Dissolved O₂','number'],['salinity','Salinity','number'],['recorded_by','Recorded By','text']].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} step="any" value={wqForm[field]} onChange={e => setWqForm(f => ({...f, [field]: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={wqForm.notes} onChange={e => setWqForm(f => ({...f, notes: e.target.value}))} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleWQSave} className="flex-1 bg-[#0891b2] text-white py-2 rounded-lg text-sm font-medium hover:bg-cyan-700">Save Reading</button>
            <button onClick={() => setWqModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
