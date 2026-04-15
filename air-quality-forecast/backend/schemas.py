from typing import Dict, Optional, List
from pydantic import BaseModel

class PollutantForecast(BaseModel):
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    o3: float

class ForecastResponse(BaseModel):
    station_id: str
    station_name: str
    start_time: str
    forecast: Dict[str, PollutantForecast]

class StationData(BaseModel):
    station_id: str
    station_name: str
    lat: float
    lon: float
    current_aqi_pm25: float
