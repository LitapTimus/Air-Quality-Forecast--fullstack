import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Automatically adjust map view when selected station changes
const MapUpdater = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom(), { animate: true });
    return null;
};

const getPM25Color = (pm25) => {
    if (pm25 <= 12) return '#10B981'; // Good
    if (pm25 <= 35.4) return '#F59E0B'; // Moderate
    if (pm25 <= 55.4) return '#F97316'; // Sensitive
    if (pm25 <= 150.4) return '#EF4444'; // Unhealthy
    if (pm25 <= 250.4) return '#8B5CF6'; // Very Unhealthy
    return '#9F1239'; // Hazardous
};

const MapView = ({ stations, selectedStation, onSelectStation }) => {
    // Default to Mumbai center if no station selected
    const centerLat = selectedStation ? selectedStation.lat : 19.0760;
    const centerLon = selectedStation ? selectedStation.lon : 72.8777;

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-inner border border-gray-800">
            <MapContainer 
                center={[centerLat, centerLon]} 
                zoom={11} 
                style={{ height: '100%', width: '100%', background: '#111827' }}
                zoomControl={false}
            >
                {/* Premium Dark Map Style (CartoDB Dark Matter) */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <MapUpdater center={[centerLat, centerLon]} />

                {stations.map(station => {
                    const color = getPM25Color(station.current_aqi_pm25);
                    const isSelected = selectedStation && selectedStation.station_id === station.station_id;
                    
                    return (
                        <CircleMarker
                            key={station.station_id}
                            center={[station.lat, station.lon]}
                            radius={isSelected ? 10 : 6}
                            pathOptions={{
                                color: isSelected ? '#FFFFFF' : color,
                                fillColor: color,
                                fillOpacity: isSelected ? 0.9 : 0.7,
                                weight: isSelected ? 3 : 1
                            }}
                            eventHandlers={{
                                click: () => onSelectStation(station)
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="text-gray-800 p-1">
                                    <h4 className="font-bold text-sm border-b pb-1 mb-1">{station.station_name}</h4>
                                    <p className="text-xs flex justify-between">
                                        <span>Current PM2.5:</span> 
                                        <span className="font-bold ml-4" style={{color}}>{Math.round(station.current_aqi_pm25)}</span>
                                    </p>
                                    <button 
                                        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
                                        onClick={(e) => { e.stopPropagation(); onSelectStation(station); }}
                                    >
                                        View Forecast
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
