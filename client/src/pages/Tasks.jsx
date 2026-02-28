import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { tasks as tasksApi, tanks, staff } from '../api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const EMPTY = { title: '', description: '', priority: 'medium', status: 'pending', due_date: '', assigned_to: '', tank_id: '' };
const STATUSES = ['pending', 'in_progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const priorityBorder = { critical: 'border-l-red-500', high: 'border-l-orange-400', medium: 'border-l-yellow-400', low: 'border-l-green-400' };
  const today = new Date().toISOString().split('T')[0];
  const overdue = task.status !== 'completed' && task.due_date && task.due_date < today;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${priorityBorder[task.priority]} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-800 text-sm leading-snug">{task.title}</h4>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={() => onDelete(task.id)} className="text-xs text-red-500 hover:underline ml-1">Del</button>
        </div>
      </div>
      {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <StatusBadge status={task.priority} type="priority" />
        {task.tank_name && <span className="text-xs text-gray-400">📦 {task.tank_name}</span>}
        {task.assigned_to && <span className="text-xs text-gray-400">👤 {task.assigned_to}</span>}
        {task.due_date && <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>📅 {task.due_date}{overdue ? ' ⚠' : ''}</span>}
      </div>
      {task.status !== 'completed' && (
        <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
          className="mt-2 w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50">
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      )}
      {task.status === 'completed' && <p className="mt-2 text-xs text-green-600">✓ Completed</p>}
    </div>
  );
}

export default function Tasks() {
  const [taskList, setTaskList] = useState([]);
  const [tankList, setTankList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterAssigned) params.assigned_to = filterAssigned;
      const [t, tks, s] = await Promise.all([tasksApi.getAll(params), tanks.getAll(), staff.getAll()]);
      setTaskList(t.data);
      setTankList(tks.data);
      setStaffList(s.data);
    } catch { toast('Failed to load tasks', 'error'); }
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority, filterAssigned]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ title: r.title, description: r.description || '', priority: r.priority, status: r.status, due_date: r.due_date || '', assigned_to: r.assigned_to || '', tank_id: r.tank_id || '' }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) await tasksApi.update(editing.id, form);
      else await tasksApi.create(form);
      toast(editing ? 'Task updated' : 'Task created');
      setModalOpen(false); load();
    } catch { toast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksApi.delete(id); toast('Deleted'); load(); }
    catch { toast('Failed to delete', 'error'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const task = taskList.find(t => t.id === id);
      await tasksApi.update(id, { ...task, status });
      load();
    } catch { toast('Failed to update', 'error'); }
  };

  // Kanban columns
  const kanban = STATUSES.map(s => ({ status: s, tasks: taskList.filter(t => t.status === s) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Tasks</h1><p className="text-gray-500 text-sm">Manage farm tasks and assignments</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All Staff</option>
          {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kanban.map(col => (
          <div key={col.status} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 capitalize">{col.status.replace('_', ' ')}</h3>
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{col.tasks.length}</span>
            </div>
            <div className="space-y-3">
              {col.tasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
              {col.tasks.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No tasks</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Add Task'} size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select value={form.assigned_to} onChange={e => setForm(f => ({...f, assigned_to: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Unassigned</option>
                {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Related Tank</label>
            <select value={form.tank_id} onChange={e => setForm(f => ({...f, tank_id: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No specific tank</option>
              {tankList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900">Save</button>
            <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
