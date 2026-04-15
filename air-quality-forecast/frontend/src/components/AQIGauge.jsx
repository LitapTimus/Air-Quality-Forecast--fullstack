import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const getAQIColor = (pm25) => {
  if (pm25 <= 12) return '#10B981'; // Good (Green)
  if (pm25 <= 35.4) return '#F59E0B'; // Moderate (Yellow)
  if (pm25 <= 55.4) return '#F97316'; // Unhealthy for Sensitive (Orange)
  if (pm25 <= 150.4) return '#EF4444'; // Unhealthy (Red)
  if (pm25 <= 250.4) return '#8B5CF6'; // Very Unhealthy (Purple)
  return '#9F1239'; // Hazardous (Maroon)
};

const getAQILabel = (pm25) => {
  if (pm25 <= 12) return 'Good';
  if (pm25 <= 35.4) return 'Moderate';
  if (pm25 <= 55.4) return 'Sensitive';
  if (pm25 <= 150.4) return 'Unhealthy';
  if (pm25 <= 250.4) return 'Very Unhealthy';
  return 'Hazardous';
};

const AQIGauge = ({ pm25 }) => {
  const color = getAQIColor(pm25);
  const label = getAQILabel(pm25);
  
  // Cap at 300 for gauge visualization purposes
  const percentage = Math.min((pm25 / 300) * 100, 100);
  
  const data = [
    { name: 'AQI', value: percentage, fill: color }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full relative">
      <h3 className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-2 absolute top-4 left-6">Overview</h3>
      <div className="relative w-48 h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="95%" 
            barSize={14} 
            data={data} 
            startAngle={210} 
            endAngle={-30}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              minAngle={15}
              background={{ fill: '#1F2937' }}
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-white text-glow" style={{ textShadow: `0 0 20px ${color}` }}>
            {Math.round(pm25)}
          </span>
          <span className="text-xs text-gray-400 font-medium tracking-wide mt-1">PM2.5 µg/m³</span>
        </div>
      </div>
      <div className="mt-4 px-4 py-1.5 rounded-full border" style={{ borderColor: color, backgroundColor: `${color}20` }}>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
    </div>
  );
};

export default AQIGauge;
