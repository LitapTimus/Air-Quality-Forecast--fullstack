import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ThumbsUp, Activity, BellRing } from 'lucide-react';
import { analyzeForecastHealth } from '../utils/aqiCalculator';

const HealthAdvisory = ({ forecast }) => {
    const healthData = analyzeForecastHealth(forecast);
    
    if (!healthData) return null;

    const { peakAQI, peakCategory, peakHour, advisoryMessage } = healthData;
    
    // Determine the primary icon and color based on severity
    let PanelIcon = BellRing;
    let borderColor = 'border-blue-500/20';
    let iconColor = 'text-blue-400';
    let gradient = 'from-blue-900/20 to-purple-900/10';

    if (peakAQI <= 100) {
        PanelIcon = ThumbsUp;
        borderColor = 'border-emerald-500/30';
        iconColor = 'text-emerald-400';
        gradient = 'from-emerald-900/20 to-teal-900/10';
    } else if (peakAQI > 300) {
        PanelIcon = ShieldAlert;
        borderColor = 'border-red-500/50';
        iconColor = 'text-red-400';
        gradient = 'from-red-900/20 to-rose-900/10';
    } else if (peakAQI > 200) {
        PanelIcon = Activity;
        borderColor = 'border-orange-500/40';
        iconColor = 'text-orange-400';
        gradient = 'from-orange-900/20 to-amber-900/10';
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-5 rounded-2xl border-l-4 ${borderColor} bg-gradient-to-r ${gradient} mb-6 flex flex-col md:flex-row items-center gap-4`}
        >
            <div className={`p-3 rounded-xl bg-gray-900/50 shadow-inner ${iconColor}`}>
                <PanelIcon size={28} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-white font-bold text-lg mb-1 flex items-center justify-center md:justify-start gap-2">
                    Actionable Insights & Health Advisory
                    {peakAQI > 200 && <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>}
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {advisoryMessage}
                </p>
            </div>
            
            <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700/50 min-w-[140px] text-center">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Peak Forecast</div>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-white">{peakAQI}</span>
                    <span className="text-xs font-semibold" style={{ color: peakCategory?.color }}>NAQI</span>
                </div>
                <div className="text-xs font-medium mt-1 truncate" style={{ color: peakCategory?.color }}>
                    in {peakHour}
                </div>
            </div>
        </motion.div>
    );
};

export default HealthAdvisory;
