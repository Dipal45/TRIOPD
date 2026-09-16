import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

def train_severity_model():
    data_dir = "ml/datasets/ppmi"
    data_file = os.path.join(data_dir, "clinical.csv")

    if not os.path.exists(data_file):
        raise FileNotFoundError("PPMI dataset not found. Please place 'clinical.csv' in ml/datasets/ppmi/")

    df = pd.read_csv(data_file)
    
    # Example features - adjust based on actual PPMI dataset structure
    feature_cols = ['baseline_updrs_total', 'age', 'disease_duration']
    target_col = 'updrs_severity_score'  # or MDS-UPDRS score
    
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in PPMI dataset")
    
    missing_cols = [col for col in feature_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing feature columns: {missing_cols}")

    X = df[feature_cols].dropna()
    y = df.loc[X.index, target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = {
        'scaler': StandardScaler(),
        'model': RandomForestRegressor(n_estimators=100, random_state=42)
    }

    pipeline['model'].fit(pipeline['scaler'].fit_transform(X_train), y_train)
    y_pred = pipeline['model'].predict(pipeline['scaler'].transform(X_test))
    
    print(f"Severity Model MAE: {mean_absolute_error(y_test, y_pred):.2f}")
    print(f"Severity Model R²: {r2_score(y_test, y_pred):.4f}")
    
    os.makedirs("ml/models/saved", exist_ok=True)
    joblib.dump(pipeline, "ml/models/saved/severity_pipeline.joblib")
    print("Model saved to ml/models/saved/severity_pipeline.joblib")

if __name__ == "__main__":
    train_severity_model()