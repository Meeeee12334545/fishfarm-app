import React from 'react';
import { Thermometer, Droplets, Activity } from 'lucide-react';

function Indicator({ label, value, unit, min, max, decimals = 1 }) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  const outOfRange = (min !== undefined && num < min) || (max !== undefined && num > max);
  return (
    <div className={`flex items-center justify-between py-1 border-b border-gray-100 last:border-0
      ${outOfRange ? 'text-red-600' : 'text-gray-700'}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${outOfRange ? 'text-red-600' : 'text-gray-800'}`}>
        {num.toFixed(decimals)} {unit}
        {outOfRange && <span className="ml-1 text-xs">⚠️</span>}
      </span>
    </div>
  );
}

export default function WaterQualityCard({ reading, tankName }) {
  if (!reading) return (
    <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 flex items-center justify-center h-36">
      <p className="text-gray-400 text-sm">No readings yet</p>
    </div>
  );
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{tankName || reading.tank_name}</h3>
        <span className="text-xs text-gray-400">{reading.date} {reading.time}</span>
      </div>
      <Indicator label="Temperature" value={reading.temperature_c} unit="°C" />
      <Indicator label="pH" value={reading.ph} unit="" min={6.0} max={8.5} />
      <Indicator label="Ammonia" value={reading.ammonia_ppm} unit="ppm" max={0.05} decimals={2} />
      <Indicator label="Nitrite" value={reading.nitrite_ppm} unit="ppm" max={0.1} decimals={2} />
      <Indicator label="Nitrate" value={reading.nitrate_ppm} unit="ppm" max={40} decimals={1} />
      {reading.dissolved_oxygen && <Indicator label="DO" value={reading.dissolved_oxygen} unit="mg/L" />}
    </div>
  );
}
