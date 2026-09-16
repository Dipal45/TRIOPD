import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib
import os

def train_handwriting_model():
    print("="*60)
    print("Starting Handwriting Model Training")
    print("="*60)
    
    dataset_path = os.path.join('ml', 'datasets', 'Spiral_HandPD.csv')
    
    if not os.path.exists(dataset_path):
        print(f"ERROR: Dataset not found at {dataset_path}")
        return
    
    print(f"Loading dataset: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # Identify target column (usually 'CLASS_TYPE' or the last column)
    target_col = 'CLASS_TYPE'
    if target_col not in df.columns:
        target_col = df.columns[-1] # Fallback to last column
        
    y = df[target_col]
    X = df.drop(columns=[target_col, 'ID'] if 'ID' in df.columns else [target_col], errors='ignore')
    
    # Ensure all data is numeric
    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)
    
    print(f"Total samples: {len(X)}")
    print(f"Features: {len(X.columns)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train_scaled, y_train)
    
    # Calculate BOTH accuracies
    train_accuracy = accuracy_score(y_train, model.predict(X_train_scaled))
    test_accuracy = accuracy_score(y_test, model.predict(X_test_scaled))
    
    print(f"\nTraining Accuracy: {train_accuracy * 100:.2f}%")
    print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")
    
    # Save everything
    model_dir = os.path.join('ml', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'handwriting_model.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'handwriting_scaler.pkl'))
    
    # Save the info file with the correct training accuracy
    model_info = {
        'train_accuracy': train_accuracy,
        'test_accuracy': test_accuracy,
        'total_samples': len(X)
    }
    joblib.dump(model_info, os.path.join(model_dir, 'handwriting_model_info.pkl'))
    
    print("\nModel and Accuracy Info Saved Successfully!")

if __name__ == '__main__':
    train_handwriting_model()