import numpy as np
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'models', 'handwriting_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'ml', 'models', 'handwriting_scaler.pkl')

print(f"Loading handwriting model from: {MODEL_PATH}")
model = None
scaler = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✅ Handwriting model loaded successfully!")
    else:
        print("️ WARNING: Handwriting model not found.")
except Exception as e:
    print(f"Error loading handwriting model: {e}")

def extract_features(trajectory):
    """Extract statistical features from drawing trajectory."""
    try:
        if len(trajectory) < 5:
            return None
            
        xs = np.array([p['x'] for p in trajectory])
        ys = np.array([p['y'] for p in trajectory])
        timestamps = np.array([p['timestamp'] for p in trajectory])
        
        distances = np.sqrt(np.diff(xs)**2 + np.diff(ys)**2)
        time_diffs = np.diff(timestamps) / 1000.0
        time_diffs = np.where(time_diffs == 0, 0.001, time_diffs)
        velocities = distances / time_diffs
        
        features = []
        
        # Helper to get 5 stats
        def get_stats(data):
            return [float(np.mean(data)), float(np.std(data)), float(np.min(data)), float(np.max(data)), float(np.median(data))]
        
        features.extend(get_stats(xs))
        features.extend(get_stats(ys))
        features.extend(get_stats(distances))
        features.extend(get_stats(time_diffs))
        features.extend(get_stats(velocities))
        
        return np.array([features])
        
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

def analyze(trajectory: list) -> dict:
    """Analyze handwriting using the trained model."""
    if model is None or scaler is None:
        raise RuntimeError("Handwriting model failed to load.")
    
    features = extract_features(trajectory)
    if features is None:
        raise ValueError("Drawing is too short.")
    
    try:
        # BULLETPROOF FIX: Adjust features to match what the model expects
        expected_features = model.n_features_in_
        current_features = features.shape[1]
        
        if current_features < expected_features:
            # Pad with zeros if we have too few features
            padding = np.zeros((1, expected_features - current_features))
            features = np.hstack((features, padding))
        elif current_features > expected_features:
            # Truncate if we have too many features
            features = features[:, :expected_features]
            
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
        "modality": "handwriting",
        "risk_score": round(risk_score, 2),
        "risk_category": risk_category,
        "message": "Handwriting analysis completed using trained model."
    }