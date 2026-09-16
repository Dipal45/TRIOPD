import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

FEATURE_COLS = ['total_path_length', 'completion_time_ms', 'mean_velocity', 'velocity_var', 'mean_jerk', 'pause_count', 'mean_pressure']

def train_handwriting_model():
    data_dir = "ml/datasets/handwriting"
    data_file = os.path.join(data_dir, "trajectory_data.csv")

    if not os.path.exists(data_file):
        raise FileNotFoundError("Handwriting dataset not found. Please place 'trajectory_data.csv' in ml/datasets/handwriting/")

    df = pd.read_csv(data_file)
    
    missing_cols = [col for col in FEATURE_COLS if col not in df.columns]
    if missing_cols and 'target' not in df.columns:
        raise ValueError(f"Missing feature columns in dataset: {missing_cols}. Ensure data is pre-extracted.")

    if 'target' not in df.columns:
        raise ValueError("Dataset must have 'target' column (0 for control, 1 for PD)")

    X = df[FEATURE_COLS]
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = {
        'scaler': StandardScaler(),
        'model': RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    }

    pipeline['model'].fit(pipeline['scaler'].fit_transform(X_train), y_train)
    y_prob = pipeline['model'].predict_proba(pipeline['scaler'].transform(X_test))[:, 1]
    
    print(f"Handwriting Model ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(f"Handwriting Model Accuracy: {accuracy_score(y_test, pipeline['model'].predict(pipeline['scaler'].transform(X_test))):.4f}")
    
    os.makedirs("ml/models/saved", exist_ok=True)
    joblib.dump(pipeline, "ml/models/saved/handwriting_pipeline.joblib")
    print("Model saved to ml/models/saved/handwriting_pipeline.joblib")

if __name__ == "__main__":
    train_handwriting_model()