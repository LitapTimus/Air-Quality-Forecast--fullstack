// Indian National Air Quality Index (NAQI) Breakpoints
const AQI_CATEGORIES = [
    { label: 'Good', color: '#10B981', I_low: 0, I_high: 50, advisory: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' },
    { label: 'Satisfactory', color: '#14b8a6', I_low: 51, I_high: 100, advisory: 'Minor breathing discomfort to sensitive people.' },
    { label: 'Moderate', color: '#F59E0B', I_low: 101, I_high: 200, advisory: 'Breathing discomfort to the people with lungs, asthma and heart diseases.' },
    { label: 'Poor', color: '#F97316', I_low: 201, I_high: 300, advisory: 'Breathing discomfort to most people on prolonged exposure.' },
    { label: 'Very Poor', color: '#EF4444', I_low: 301, I_high: 400, advisory: 'Respiratory illness on prolonged exposure.' },
    { label: 'Severe', color: '#9F1239', I_low: 401, I_high: 500, advisory: 'Affects healthy people and seriously impacts those with existing diseases.' }
];

const POLLUTANT_BREAKPOINTS = {
    pm25: [
        { C_low: 0, C_high: 30 },
        { C_low: 30.1, C_high: 60 },
        { C_low: 60.1, C_high: 90 },
        { C_low: 90.1, C_high: 120 },
        { C_low: 120.1, C_high: 250 },
        { C_low: 250.1, C_high: 1000 }
    ],
    pm10: [
        { C_low: 0, C_high: 50 },
        { C_low: 50.1, C_high: 100 },
        { C_low: 100.1, C_high: 250 },
        { C_low: 250.1, C_high: 350 },
        { C_low: 350.1, C_high: 430 },
        { C_low: 430.1, C_high: 1500 }
    ],
    no2: [
        { C_low: 0, C_high: 40 },
        { C_low: 40.1, C_high: 80 },
        { C_low: 80.1, C_high: 180 },
        { C_low: 180.1, C_high: 280 },
        { C_low: 280.1, C_high: 400 },
        { C_low: 400.1, C_high: 1000 }
    ],
    so2: [
        { C_low: 0, C_high: 40 },
        { C_low: 40.1, C_high: 80 },
        { C_low: 80.1, C_high: 380 },
        { C_low: 380.1, C_high: 800 },
        { C_low: 800.1, C_high: 1600 },
        { C_low: 1600.1, C_high: 4000 }
    ],
    co: [
        { C_low: 0, C_high: 1.0 },
        { C_low: 1.1, C_high: 2.0 },
        { C_low: 2.1, C_high: 10 },
        { C_low: 10.1, C_high: 17 },
        { C_low: 17.1, C_high: 34 },
        { C_low: 34.1, C_high: 100 }
    ],
    o3: [
        { C_low: 0, C_high: 50 },
        { C_low: 50.1, C_high: 100 },
        { C_low: 100.1, C_high: 168 },
        { C_low: 168.1, C_high: 208 },
        { C_low: 208.1, C_high: 748 },
        { C_low: 748.1, C_high: 2000 }
    ]
};

export const calculateSubIndex = (pollutant, concentration) => {
    const breakpoints = POLLUTANT_BREAKPOINTS[pollutant.toLowerCase()];
    if (!breakpoints) return 0; // Unknown pollutant

    let index = 0;
    for (let i = 0; i < breakpoints.length; i++) {
        if (concentration >= breakpoints[i].C_low && concentration <= breakpoints[i].C_high) {
            const I_high = AQI_CATEGORIES[i].I_high;
            const I_low = AQI_CATEGORIES[i].I_low;
            const C_high = breakpoints[i].C_high;
            const C_low = breakpoints[i].C_low;
            
            // Linear interpolation
            index = ((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low;
            break;
        } else if (i === breakpoints.length - 1 && concentration > breakpoints[i].C_high) {
            // Out of bounds, cap at 500
            index = 500;
        }
    }
    
    return Math.round(index);
};

export const calculateOverallAQI = (pollutantMeasurements) => {
    let maxAQI = 0;
    let dominantPollutant = 'pm25';

    for (const [pollutant, concentration] of Object.entries(pollutantMeasurements)) {
        if (pollutant === 'time') continue; // Not a pollutant
        
        const subIndex = calculateSubIndex(pollutant, concentration);
        if (subIndex > maxAQI) {
            maxAQI = subIndex;
            dominantPollutant = pollutant;
        }
    }

    // Determine category based on NAQI scale
    let category = AQI_CATEGORIES[0];
    for (const cat of AQI_CATEGORIES) {
        if (maxAQI >= cat.I_low && maxAQI <= cat.I_high) {
            category = cat;
            break;
        }
    }
    
    if (maxAQI > 500) category = AQI_CATEGORIES[AQI_CATEGORIES.length - 1];

    return { aqi: maxAQI, dominantPollutant, category };
};

export const analyzeForecastHealth = (forecast) => {
    // Look ahead 24 to 48 hours for actionable insights.
    if (!forecast || Object.keys(forecast).length === 0) return null;

    let peakAQI = 0;
    let peakCategory = null;
    let peakHour = '';

    Object.entries(forecast).forEach(([hourStr, measurements]) => {
        // Assume hourStr is +1h, +2h, etc.
        const { aqi, category } = calculateOverallAQI(measurements);
        if (aqi > peakAQI) {
            peakAQI = aqi;
            peakCategory = category;
            peakHour = hourStr.replace('+', '').replace('h', ' hours');
        }
    });

    const currentAQI = calculateOverallAQI(forecast['+1h'] || {}).aqi;
    let advisoryStr = '';
    
    if (peakAQI <= 100) {
        advisoryStr = `Ideal outdoor conditions for the next 7 days. Peak NAQI is expected to remain satisfactory at ${peakAQI}.`;
    } else if (peakAQI > currentAQI + 50) {
        advisoryStr = `Trend Warning: Air quality is degrading. It will reach "${peakCategory?.label}" levels within ${peakHour}. Ensure standard precautions.`;
    } else if (peakAQI > 300) {
        advisoryStr = `Critical Alert: Peak pollution expected in ${peakHour}. Try to minimize prolonged outdoor exertion.`;
    } else {
        advisoryStr = peakCategory?.advisory || 'Conditions generally stable.';
    }

    return {
        peakAQI,
        peakCategory,
        peakHour,
        advisoryMessage: advisoryStr
    };
};
