import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { calculateOverallAQI } from '../utils/aqiCalculator';

const AQIGauge = ({ forecast }) => {
  // Use the +1h forecast for current gauge
  const currentValues = forecast && forecast['+1h'] ? forecast['+1h'] : {};
  const pm25 = currentValues.pm25 || 0;
  
  // Calculate NAQI
  const { aqi, category, dominantPollutant } = calculateOverallAQI(currentValues);
  
  const color = category?.color || '#10B981';
  const label = category?.label || 'Good';
  
  // Cap at 500 for gauge visualization purposes
  const percentage = Math.min((aqi / 500) * 100, 100);
  
  const data = [
    { name: 'AQI', value: percentage, fill: color }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full relative">
      <h3 className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-2 absolute top-4 left-6 border-b border-gray-700 pb-1">
        Current NAQI
      </h3>
      
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
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-4xl font-bold text-white text-glow tracking-tighter" style={{ textShadow: `0 0 20px ${color}` }}>
            {aqi}
          </span>
          <span className="text-xs text-gray-400 font-medium tracking-wide mt-1">Index Value</span>
        </div>
      </div>
      
      <div className="mt-2 w-full flex flex-col items-center gap-3">
        <div className="px-4 py-1.5 rounded-full border shadow-sm" style={{ borderColor: color, backgroundColor: `${color}20` }}>
          <span className="text-sm font-bold tracking-wide" style={{ color }}>{label}</span>
        </div>
        
        {/* Raw PM2.5 display that the user asked to retain */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700 w-full justify-between">
           <div>
               <span className="text-gray-500 block text-[10px] uppercase">Raw PM2.5</span>
               <span className="text-white font-bold">{Math.round(pm25)} µg/m³</span>
           </div>
           <div className="text-right">
               <span className="text-gray-500 block text-[10px] uppercase">Primary Pollutant</span>
               <span className="text-white font-bold uppercase">{dominantPollutant}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AQIGauge;
