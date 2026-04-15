import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Droplets, CloudFog, CloudLightning, Sun, Factory } from 'lucide-react';

const pollutantsContext = {
    pm25: { name: 'PM2.5', limit: 15, unit: 'µg/m³', icon: CloudFog, colors: 'from-blue-500 to-indigo-500' },
    pm10: { name: 'PM10', limit: 45, unit: 'µg/m³', icon: Wind, colors: 'from-cyan-500 to-blue-500' },
    no2: { name: 'NO2', limit: 25, unit: 'ppb', icon: Factory, colors: 'from-orange-500 to-red-500' },
    so2: { name: 'SO2', limit: 40, unit: 'ppb', icon: CloudLightning, colors: 'from-yellow-400 to-orange-500' },
    co: { name: 'CO', limit: 4, unit: 'ppm', icon: Droplets, colors: 'from-emerald-400 to-teal-500' },
    o3: { name: 'O3', limit: 50, unit: 'ppb', icon: Sun, colors: 'from-blue-400 to-sky-400' }
};

const PollutantCards = ({ forecast }) => {
    // using +1h forecast values
    const currentValues = forecast['+1h'] || {};
    // grab latest values to compute "trends" if we wanted. But here we just compare to limits
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(pollutantsContext).map(([key, info], index) => {
                const value = Math.round(currentValues[key] || 0);
                const limit = info.limit;
                const status = value > limit * 1.5 ? 'Critical' : value > limit ? 'Warning' : 'Normal';
                const statusColor = status === 'Critical' ? 'text-red-400' : status === 'Warning' ? 'text-yellow-400' : 'text-emerald-400';
                
                const Icon = info.icon;
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        key={key}
                        className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-gray-600 transition-colors"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${info.colors} opacity-[0.08] blur-2xl group-hover:opacity-[0.15] transition-opacity rounded-full transform translate-x-8 -translate-y-8`}></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Icon size={18} strokeWidth={1.5} />
                                <span className="font-semibold">{info.name}</span>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded border border-gray-700 bg-gray-800/80 ${statusColor}`}>
                                {status}
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                                <span className="text-sm font-medium text-gray-500">{info.unit}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((value / (limit * 2)) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                    className={`h-full ${status === 'Normal' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default PollutantCards;
