import os
import joblib

def load_models(models_dir="models"):
    models = {}
    horizons = ["1h", "3h", "6h", "9h", "12h", "24h", "48h", "72h", "96h", "120h", "144h", "168h"]
    
    print("Loading CatBoost horizon models...")
    for horizon in horizons:
        h_str = "h" + horizon[:-1]
        model_path = os.path.join(models_dir, f"catboost_{h_str}.pkl")
        if os.path.exists(model_path):
            models[horizon] = joblib.load(model_path)
            print(f"Loaded {horizon} model.")
        else:
            print(f"Warning: {model_path} not found.")
    return models
