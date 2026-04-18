import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateOverallAQI } from '../utils/aqiCalculator';

const pollutants = ['aqi', 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];
const formatPollutant = (p) => p === 'pm25' ? 'PM2.5' : p === 'pm10' ? 'PM10' : p.toUpperCase();

const ForecastChart = ({ forecast }) => {
    const [selectedPollutant, setSelectedPollutant] = useState('aqi');

    // Convert API forecast object to Recharts data array
    // { "1h": { pm25: 10, pm10: 20 }, "3h": { ... } } => [ { horizon: "1h", pm25: 10, ...} ]
    // We must sort by horizon correctly since dict order isn't guaranteed chronologically
    const horizonOrder = ["1h", "3h", "6h", "12h", "24h", "48h", "72h", "96h", "120h", "144h", "168h"];
    
    const chartData = horizonOrder.map(h => {
        const data = forecast[`+${h}`] || {};
        let val = 0;
        if (selectedPollutant === 'aqi') {
            val = calculateOverallAQI(data).aqi;
        } else {
            val = data[selectedPollutant] || 0;
        }
        return {
            name: `+${h}`,
            value: val,
        };
    });

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                {pollutants.map((p) => (
                    <button
                        key={p}
                        onClick={() => setSelectedPollutant(p)}
                        className={`flex-1 py-1.5 px-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                            selectedPollutant === p 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                    >
                        {formatPollutant(p)}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-[250px] relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedPollutant}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6B7280" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#6B7280" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1F2937', 
                                        border: '1px solid #374151',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                                    formatter={(val) => [Math.round(val), formatPollutant(selectedPollutant)]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorGradient)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ForecastChart;
