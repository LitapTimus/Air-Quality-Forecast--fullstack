import React from 'react';

const horizonOrder = ["1h", "3h", "6h", "12h", "24h", "48h", "72h", "96h", "120h", "144h", "168h"];

const ForecastTable = ({ forecast }) => {
    if (!forecast) return null;

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-surface/50">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-gray-800/80 text-gray-400 border-b border-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold">Horizon</th>
                        <th scope="col" className="px-6 py-4 font-semibold">PM2.5</th>
                        <th scope="col" className="px-6 py-4 font-semibold">PM10</th>
                        <th scope="col" className="px-6 py-4 font-semibold">NO2</th>
                        <th scope="col" className="px-6 py-4 font-semibold">SO2</th>
                        <th scope="col" className="px-6 py-4 font-semibold">CO</th>
                        <th scope="col" className="px-6 py-4 font-semibold">O3</th>
                    </tr>
                </thead>
                <tbody>
                    {horizonOrder.map((horizon, idx) => {
                        const data = forecast[`+${horizon}`];
                        if (!data) return null;
                        
                        return (
                            <tr key={horizon} className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/20'}`}>
                                <td className="px-6 py-3 font-medium text-blue-400">+{horizon}</td>
                                <td className="px-6 py-3">{Math.round(data.pm25)}</td>
                                <td className="px-6 py-3">{Math.round(data.pm10)}</td>
                                <td className="px-6 py-3">{Math.round(data.no2)}</td>
                                <td className="px-6 py-3">{Math.round(data.so2)}</td>
                                <td className="px-6 py-3">{Math.round(data.co * 10) / 10}</td>
                                <td className="px-6 py-3">{Math.round(data.o3)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ForecastTable;
