import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fish, Waves, UtensilsCrossed, CheckSquare, AlertTriangle, Heart, Plus } from 'lucide-react';
import { dashboard as dashboardApi, alerts as alertsApi } from '../api';
import StatsCard from '../components/StatsCard';
import AlertBanner from '../components/AlertBanner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await dashboardApi.get();
      setData(res.data);
    } catch (e) {
      toast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolveAlert = async (id) => {
    try {
      await alertsApi.resolve(id);
      toast('Alert resolved');
      load();
    } catch {
      toast('Failed to resolve alert', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const { stats, alerts, recentHealth, todayTasks, latestWaterQuality } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Wide Bay Aquatics Farm Overview</p>
        </div>
        <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <AlertBanner alertsList={alerts} onResolve={handleResolveAlert} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tanks" value={stats?.totalTanks || 0} icon={Waves} color="blue" subtitle={`${stats?.activeTanks} active`} />
        <StatsCard title="Total Fish" value={stats?.totalFish || 0} icon={Fish} color="teal" />
        <StatsCard title="Today's Feedings" value={stats?.todayFeedings || 0} icon={UtensilsCrossed} color="green" />
        <StatsCard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={CheckSquare} color={stats?.pendingTasks > 5 ? 'orange' : 'blue'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Active Alerts
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{alerts?.length || 0}</span>
          </div>
          {alerts?.length === 0 ? (
            <p className="text-green-600 text-sm">✓ No active alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts?.slice(0, 5).map(alert => (
                <div key={alert.id} className={`p-2.5 rounded-lg text-xs border
                  ${alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                    alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  <div className="flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5">{alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵'}</span>
                    <span>{alert.message}</span>
                  </div>
                  {alert.tank_name && <span className="mt-1 block text-xs opacity-60">{alert.tank_name}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckSquare size={16} className="text-blue-500" /> Today's Tasks
            </h2>
            <Link to="/tasks" className="text-blue-600 text-xs hover:underline">View all</Link>
          </div>
          {todayTasks?.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks due today</p>
          ) : (
            <div className="space-y-2">
              {todayTasks?.slice(0, 6).map(task => (
                <div key={task.id} className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
                  <StatusBadge status={task.priority} type="priority" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{task.title}</p>
                    {task.assigned_to && <p className="text-xs text-gray-400">{task.assigned_to}</p>}
                  </div>
                  <StatusBadge status={task.status} type="taskStatus" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Health Records */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Heart size={16} className="text-red-500" /> Health Alerts
            </h2>
            <Link to="/health" className="text-blue-600 text-xs hover:underline">View all</Link>
          </div>
          {recentHealth?.length === 0 ? (
            <p className="text-green-600 text-sm">✓ No active health issues</p>
          ) : (
            <div className="space-y-2">
              {recentHealth?.slice(0, 5).map(rec => (
                <div key={rec.id} className="py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={rec.observation_type} type="healthType" />
                    <span className="text-xs text-gray-500">{rec.tank_name}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/water-quality" className="flex items-center gap-2 bg-[#0891b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors">
            <Plus size={16} /> Log Water Quality
          </Link>
          <Link to="/feeding" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus size={16} /> Log Feeding
          </Link>
          <Link to="/health" className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            <Plus size={16} /> Health Record
          </Link>
          <Link to="/tasks" className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
            <Plus size={16} /> Add Task
          </Link>
        </div>
      </div>
    </div>
  );
}
