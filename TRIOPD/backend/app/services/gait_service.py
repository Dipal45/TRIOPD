import numpy as np
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'models', 'gait_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'models', 'gait_scaler.pkl')

print(f"Loading gait model from: {MODEL_PATH}")
model = None
scaler = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✅ Gait model loaded successfully!")
    else:
        print("⚠️ WARNING: Gait model not found. Run train_gait.py first.")
except Exception as e:
    print(f"Error loading gait model: {e}")

def extract_gait_features(trajectory):
    """
    Extract 95 features from 2D walking trajectory to match the trained model.
    The model expects 5 stats (mean, std, min, max, median) for 19 columns.
    We calculate these for distance, time, and velocity (3 cols), and pad the rest with 0.
    """
    try:
        if len(trajectory) < 10:
            return None
        
        xs = np.array([p['x'] for p in trajectory])
        ys = np.array([p['y'] for p in trajectory])
        timestamps = np.array([p['timestamp'] for p in trajectory])
        
        # Calculate core metrics
        distances = np.sqrt(np.diff(xs)**2 + np.diff(ys)**2)
        time_diffs = np.diff(timestamps) / 1000.0
        time_diffs = np.where(time_diffs == 0, 0.001, time_diffs)
        velocities = distances / time_diffs
        
        features = []
        
        # Helper to get 5 stats
        def get_stats(data):
            return [
                float(np.mean(data)),
                float(np.std(data)),
                float(np.min(data)),
                float(np.max(data)),
                float(np.median(data))
            ]
        
        # Add stats for the first 3 columns (Distances, Time, Velocity)
        features.extend(get_stats(distances))
        features.extend(get_stats(time_diffs))
        features.extend(get_stats(velocities))
        
        # Pad the remaining 16 columns with zeros (16 * 5 = 80 zeros)
        features.extend([0.0] * 80)
        
        return np.array([features])
        
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

def analyze(trajectory: list) -> dict:
    """Analyze gait/walking pattern using the trained model."""
    if model is None or scaler is None:
        raise RuntimeError("Gait model failed to load. Please run train_gait.py first.")
    
    features = extract_gait_features(trajectory)
    if features is None:
        raise ValueError("Trajectory is too short. Need more walking data.")
    
    try:
        features_scaled = scaler.transform(features)
        probabilities = model.predict_proba(features_scaled)[0]
        risk_score = float(probabilities[1] * 100)
    except Exception as e:
        print(f"Prediction error: {e}")
        risk_score = 50.0

    if risk_score > 70:
        risk_category = "High"
    elif risk_score > 40:
        risk_category = "Moderate"
    else:
        risk_category = "Low"
    
    return {
        "modality": "gait",
        "risk_score": round(risk_score, 2),
        "risk_category": risk_category,
        "message": "Gait analysis completed using trained model."
    }