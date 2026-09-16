import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

# Ensure consistent feature order
FEATURE_COLS = ['left_ankle_var', 'right_ankle_var', 'hip_symmetry_mean', 'arm_swing_asymmetry', 'total_frames']

def train_gait_model():
    data_dir = "ml/datasets/gait"
    pd_file = os.path.join(data_dir, "gait_pd.csv")
    control_file = os.path.join(data_dir, "gait_control.csv")

    if not os.path.exists(pd_file) or not os.path.exists(control_file):
        raise FileNotFoundError(
            "Gait datasets not found. Please place 'gait_pd.csv' and 'gait_control.csv' "
            "in ml/datasets/gait/ as described in the README."
        )

    df_pd = pd.read_csv(pd_file)
    df_pd['target'] = 1
    
    df_control = pd.read_csv(control_file)
    df_control['target'] = 0

    df = pd.concat([df_pd, df_control], ignore_index=True)
    
    # Ensure all feature columns exist (mocking extraction if raw data is just placeholders for this script structure)
    # In a real scenario, this CSV would be pre-extracted features, or we iterate raw files.
    # For robustness, we check:
    missing_cols = [col for col in FEATURE_COLS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing feature columns in dataset: {missing_cols}. Ensure data is pre-extracted or update pipeline.")

    X = df[FEATURE_COLS]
    y = df['target']

    # Subject-level split simulation (using random state for reproducibility in this template)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = {
        'scaler': StandardScaler(),
        'model': RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    }

    X_train_scaled = pipeline['scaler'].fit_transform(X_train)
    X_test_scaled = pipeline['scaler'].transform(X_test)

    pipeline['model'].fit(X_train_scaled, y_train)
    
    y_pred = pipeline['model'].predict(X_test_scaled)
    y_prob = pipeline['model'].predict_proba(X_test_scaled)[:, 1]

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'roc_auc': roc_auc_score(y_test, y_prob),
        'classification_report': classification_report(y_test, y_pred)
    }

    print("Gait Model Metrics:")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
    print(metrics['classification_report'])

    # Save model
    os.makedirs("ml/models/saved", exist_ok=True)
    joblib.dump(pipeline, "ml/models/saved/gait_pipeline.joblib")
    print("Model saved to ml/models/saved/gait_pipeline.joblib")

if __name__ == "__main__":
    train_gait_model()