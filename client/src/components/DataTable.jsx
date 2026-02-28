import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey ? [...data].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  }) : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map(col => (
              <th key={col.key} className={`text-left py-3 px-4 font-semibold text-gray-600 ${col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-8 text-center text-gray-400">{emptyMessage}</td></tr>
          ) : sorted.map((row, i) => (
            <tr key={row.id || i}
              className={`border-b border-gray-100 ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
              onClick={() => onRowClick && onRowClick(row)}>
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
