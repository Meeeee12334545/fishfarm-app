import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { alerts as alertsApi } from '../api';

export default function AlertBanner({ alertsList, onResolve }) {
  if (!alertsList || alertsList.length === 0) return null;
  const critical = alertsList.filter(a => a.severity === 'critical');
  const warnings = alertsList.filter(a => a.severity === 'warning');
  const displayed = [...critical, ...warnings].slice(0, 3);
  if (displayed.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {displayed.map(alert => (
        <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border text-sm
          ${alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
            alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'}`}>
          {alert.severity === 'critical' ? <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> :
           alert.severity === 'warning' ? <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> :
           <Info size={16} className="mt-0.5 flex-shrink-0" />}
          <span className="flex-1">{alert.message}</span>
          {onResolve && (
            <button onClick={() => onResolve(alert.id)}
              className="text-xs font-medium underline opacity-70 hover:opacity-100 flex-shrink-0">
              Resolve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
