from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ForecastResponse, StationData
from model_loader import load_models
from predictor import AirQualityPredictor
import logging
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Air Quality Forecasting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models = {}
predictor = None

@app.on_event("startup")
async def startup_event():
    global models, predictor
    models = load_models("models")
    predictor = AirQualityPredictor(models, "features.json", "mumbai_air_quality_selected_features_catboost_shap.csv")

@app.get("/stations", response_model=List[StationData])
async def get_stations():
    try:
        return predictor.get_stations()
    except Exception as e:
        logger.error(f"Error fetching stations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/forecast/{station_id}", response_model=ForecastResponse)
async def get_forecast(station_id: str):
    try:
        return predictor.predict_for_station(station_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error predicting for station {station_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
