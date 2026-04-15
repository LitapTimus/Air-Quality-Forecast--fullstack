import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudFog, MapPin, Loader2, CalendarClock } from 'lucide-react';
import AQIGauge from '../components/AQIGauge';
import PollutantCards from '../components/PollutantCards';
import ForecastChart from '../components/ForecastChart';
import ForecastTable from '../components/ForecastTable';
import MapView from '../components/MapView';
import { getStations, getForecast } from '../api/forecastAPI';

const Dashboard = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const stationsData = await getStations();
                setStations(stationsData);
                
                if (stationsData.length > 0) {
                    handleStationSelect(stationsData[0]);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleStationSelect = async (station) => {
        setSelectedStation(station);
        setLoading(true);
        try {
            const data = await getForecast(station.station_id);
            setForecastData(data);
        } catch (error) {
            console.error("Failed to load forecast", error);
            setForecastData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !forecastData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center text-blue-500">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-gray-400 font-medium">Loading Atmospheric Models...</p>
                </div>
            </div>
        );
    }

    // Fallback if no forecast data is available
    const forecast = forecastData?.forecast || {};
    const startTime = forecastData?.start_time || "N/A";
    const currentPM25 = forecast['+1h']?.pm25 || 0;

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Hero Section */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 glass-panel p-6 rounded-2xl border-b-4 border-b-blue-500 bg-gradient-to-r from-blue-900/20 to-purple-900/10"
            >
                <div>
                    <div className="flex items-center gap-3 text-blue-400 mb-2">
                        <CloudFog size={32} />
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Multi Pollutant Multi Horizon Air Quality Forecasting System</h1>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl">
                        AI-powered predictions for the next 168 hours driven by CatBoost Horizon Models.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <MapPin size={16} />
                        <span className="font-medium text-sm truncate max-w-[200px]">{selectedStation?.station_name || 'Select Station'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800">
                        <CalendarClock size={14} />
                        <span>START: {startTime}</span>
                    </div>
                </div>
            </motion.header>

            {/* Top Grid: Gauge + Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AQI Gauge Area */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-4 glass-card rounded-3xl overflow-hidden min-h-[300px]"
                >
                    <AQIGauge pm25={currentPM25} />
                </motion.div>

                {/* Pollutant Cards Area */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8"
                >
                    <PollutantCards forecast={forecast} />
                </motion.div>
                
            </div>

            {/* Middle Grid: Map + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="h-full glass-card rounded-3xl p-1 shadow-2xl relative z-0"
                >
                    <MapView 
                        stations={stations} 
                        selectedStation={selectedStation} 
                        onSelectStation={handleStationSelect} 
                    />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="h-full glass-card rounded-3xl p-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">7-Day Projection</h3>
                        {loading && <Loader2 className="animate-spin text-blue-500" size={18} />}
                    </div>
                    <div className="h-[calc(100%-3rem)]">
                        <ForecastChart forecast={forecast} />
                    </div>
                </motion.div>
            </div>

            {/* Bottom: Table */}
            {(!forecast || Object.keys(forecast).length === 0) ? null : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-4"
                >
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-8 h-1 bg-blue-500 rounded-full inline-block"></span>
                            Forecast Matrix
                        </h3>
                    </div>
                    <div className="glass-card rounded-2xl overflow-hidden p-1">
                        <ForecastTable forecast={forecast} />
                    </div>
                </motion.div>
            )}

        </div>
    );
};

export default Dashboard;
