import React from 'react';

export default function StatusBadge({ status, type = 'tank' }) {
  const tankStatus = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    empty: 'bg-gray-100 text-gray-600',
  };
  const tankType = {
    breeding: 'bg-pink-100 text-pink-800',
    'grow-out': 'bg-blue-100 text-blue-800',
    quarantine: 'bg-orange-100 text-orange-800',
    display: 'bg-purple-100 text-purple-800',
  };
  const healthType = {
    routine: 'bg-green-100 text-green-800',
    illness: 'bg-yellow-100 text-yellow-800',
    treatment: 'bg-blue-100 text-blue-800',
    mortality: 'bg-red-100 text-red-800',
  };
  const priorityType = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  const taskStatus = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };
  const severityType = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  const maps = { tank: tankStatus, tankType, healthType, priority: priorityType, taskStatus, severity: severityType };
  const map = maps[type] || tankStatus;
  const cls = map[status] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
