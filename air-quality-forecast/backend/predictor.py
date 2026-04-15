import json
import logging
import math
import pandas as pd
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def calculate_idw(target_lat, target_lon, coords_values, p=2):
    sum_wv = 0.0
    sum_w = 0.0
    for lat, lon, val in coords_values:
        d = haversine(target_lat, target_lon, lat, lon)
        if d < 0.001: # If distance is very small, assume it's the same point
            return val
        w = 1.0 / (d ** p)
        sum_wv += w * val
        sum_w += w
    return sum_wv / sum_w if sum_w > 0 else 0.0

class AirQualityPredictor:
    def __init__(self, models_dict: Dict, features_file="features.json", dataset_path="dataset_with_future_weather.csv"):
        self.models = models_dict
        self.dataset_path = dataset_path
        
        # Load expected features
        with open(features_file, "r") as f:
            self.expected_features = json.load(f)
            
        self.latest_data = {}
        self.load_latest_data()
        
    def load_latest_data(self):
        logger.info("Loading latest dataset into memory...")
        # Since CSV is 263MB, we read it
        df = pd.read_csv(self.dataset_path)
        # Assuming there is a "Timestamp" column
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        
        # Get latest row per station
        idx = df.groupby('station_id')['Timestamp'].idxmax()
        latest_df = df.loc[idx]
        
        for _, row in latest_df.iterrows():
            station_id = str(row['station_id'])
            self.latest_data[station_id] = row.to_dict()
        
        # Prepare active coordinates for IDW
        active_pm25_coords = []
        for s_id, row in self.latest_data.items():
            active_pm25_coords.append((float(row.get('lat', 0.0)), float(row.get('lon', 0.0)), float(row.get('pm25', 0.0))))

        # Load all stations from metadata
        self.all_stations = []
        self.metadata = {}
        try:
            meta_df = pd.read_csv("station_metadata_enriched.csv")
            for _, row in meta_df.iterrows():
                s_id = str(row['station_id'])
                s_lat = float(row.get("station_lat", 0.0))
                s_lon = float(row.get("station_lon", 0.0))
                self.metadata[s_id] = {"lat": s_lat, "lon": s_lon, "name": str(row.get("station_name", s_id))}
                
                if s_id in self.latest_data:
                    current_pm25 = self.latest_data[s_id].get('pm25', 0.0)
                else:
                    # IDW Interpolation for missing current PM2.5
                    current_pm25 = calculate_idw(s_lat, s_lon, active_pm25_coords)
                    
                self.all_stations.append({
                    "station_id": s_id,
                    "station_name": self.metadata[s_id]["name"],
                    "lat": s_lat,
                    "lon": s_lon,
                    "current_aqi_pm25": float(current_pm25)
                })
        except Exception as e:
            logger.error(f"Error loading metadata: {e}")
            # Fallback if metadata fails
            for station_id, row in self.latest_data.items():
                self.all_stations.append({
                    "station_id": station_id,
                    "station_name": str(row.get("station_name", station_id)),
                    "lat": float(row.get("lat", 0.0)),
                    "lon": float(row.get("lon", 0.0)),
                    "current_aqi_pm25": float(row.get("pm25", 0.0))
                })

        logger.info(f"Loaded {len(self.all_stations)} stations.")

    def get_stations(self):
        return self.all_stations

    def predict_for_active_station(self, station_id: str):
        if station_id not in self.latest_data:
            raise ValueError(f"Station {station_id} not found in active data.")
            
        row = self.latest_data[station_id]
        
        # Extract features vector matching exactly what the model expects
        # Any missing feature is filled with 0.0
        X = []
        for f in self.expected_features:
            val = row.get(f, 0.0)
            try:
                X.append(float(val))
            except ValueError:
                # Fallback for unexpected strings (e.g., label-encoded station_id missing its encoder)
                X.append(0.0)
                
        forecasts = {}
        target_names = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3']
        # Our target order is typically: PM2.5, PM10, NO2, SO2, CO, O3 based on target columns in dataset file
        for horizon, model in self.models.items():
            preds = model.predict([X])[0]
            # Since the model predicts 6 targets simultaneously, map them:
            forecasts[f"+{horizon}"] = {
                t: float(max(0, p)) for t, p in zip(target_names, preds)
            }
        return forecasts

    def predict_for_station(self, station_id: str):
        if station_id in self.latest_data:
            row = self.latest_data[station_id]
            start_time = str(row.get('Timestamp'))
            station_name = str(row.get('station_name', station_id))
            forecasts = self.predict_for_active_station(station_id)
            return {
                "station_id": station_id,
                "station_name": station_name,
                "start_time": start_time,
                "forecast": forecasts
            }
            
        if station_id not in self.metadata:
            raise ValueError(f"Station ID {station_id} not found in metadata or active data.")
            
        # Generate forecast via IDW for missing stations
        target_lat = self.metadata[station_id]["lat"]
        target_lon = self.metadata[station_id]["lon"]
        station_name = self.metadata[station_id]["name"]
        
        # Pull baseline predictions for all ACTIVE stations
        active_forecasts = {}
        active_coords = {}
        for act_id, act_row in self.latest_data.items():
            act_lat = float(act_row.get('lat', 0.0))
            act_lon = float(act_row.get('lon', 0.0))
            active_coords[act_id] = (act_lat, act_lon)
            active_forecasts[act_id] = self.predict_for_active_station(act_id)
            
        interpolated_forecasts = {}
        target_names = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3']
        horizons = list(self.models.keys())
        
        # Use the timestamp from an arbitrary active station as a placeholder
        # In a real system, this might be the current time or a specific forecast start time
        start_time = str(list(self.latest_data.values())[0].get('Timestamp')) if self.latest_data else "N/A"

        for horizon in horizons:
            h_key = f"+{horizon}"
            interpolated_forecasts[h_key] = {}
            for t in target_names:
                coords_values = []
                for act_id in self.latest_data.keys():
                    lat, lon = active_coords[act_id]
                    val = active_forecasts[act_id][h_key][t]
                    coords_values.append((lat, lon, val))
                
                interpolated_forecasts[h_key][t] = float(max(0, calculate_idw(target_lat, target_lon, coords_values)))
                
        return {
            "station_id": station_id,
            "station_name": station_name,
            "start_time": start_time,
            "forecast": interpolated_forecasts
        }
