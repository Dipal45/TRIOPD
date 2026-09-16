import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import glob

def extract_features(file_path):
    """Extract statistical features from gait data file."""
    try:
        # Read tab-separated data (19 columns)
        df = pd.read_csv(file_path, sep='\t', header=None)
        
        features = []
        # Extract stats for all 19 columns
        for col in range(df.shape[1]):
            col_data = pd.to_numeric(df[col], errors='coerce').dropna()
            
            if len(col_data) > 0:
                # Calculate 5 statistical features per column
                features.extend([
                    col_data.mean(),
                    col_data.std(),
                    col_data.min(),
                    col_data.max(),
                    col_data.median()
                ])
            else:
                features.extend([0, 0, 0, 0, 0])
        
        return np.array(features)
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def get_label(filename):
    """Determine label: Co=Control(0), Pt=Patient(1)"""
    if 'Co' in filename:
        return 0  # Control/Healthy
    elif 'Pt' in filename:
        return 1  # Patient/PD
    return None

def train_gait_model():
    print("="*60)
    print("Starting Gait Model Training")
    print("="*60)
    
    # Find all data files
    data_dir = os.path.join('ml', 'datasets')
    if not os.path.exists(data_dir):
        print(f"ERROR: Dataset directory not found at {data_dir}")
        return
    
    files = glob.glob(os.path.join(data_dir, '*.txt'))
    
    if len(files) == 0:
        print("ERROR: No .txt files found in datasets directory")
        return
    
    print(f"\nFound {len(files)} data files")
    
    # Extract features and labels
    X = []
    y = []
    
    for file_path in files:
        filename = os.path.basename(file_path)
        label = get_label(filename)
        
        if label is None:
            print(f"Skipping {filename} (cannot determine label)")
            continue
        
        features = extract_features(file_path)
        
        if features is not None:
            X.append(features)
            y.append(label)
            label_str = 'PD' if label == 1 else 'Control'
            print(f"Processed {filename} -> Label: {label_str}")
    
    if len(X) == 0:
        print("ERROR: No valid features extracted")
        return
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"\n{'='*60}")
    print("Dataset Summary")
    print(f"{'='*60}")
    print(f"Total samples: {len(X)}")
    print(f"Feature dimensions: {X.shape[1]}")
    print(f"Control (Healthy): {sum(y == 0)}")
    print(f"Patient (PD): {sum(y == 1)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Testing set: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print(f"\n{'='*60}")
    print("Training Random Forest Model...")
    print(f"{'='*60}")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_scaled, y_train)
    print("Model training completed!")
    
    # Evaluate
    print(f"\n{'='*60}")
    print("Model Evaluation")
    print(f"{'='*60}")
    
    train_accuracy = model.score(X_train_scaled, y_train)
    print(f"\nTraining Accuracy: {train_accuracy * 100:.2f}%")
    
    test_accuracy = model.score(X_test_scaled, y_test)
    print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")
    
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nOverall Accuracy: {accuracy * 100:.2f}%")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Control', 'PD']))
    
    # Save model
    print(f"\n{'='*60}")
    print("Saving Model")
    print(f"{'='*60}")
    
    model_dir = os.path.join('ml', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'gait_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")
    
    scaler_path = os.path.join(model_dir, 'gait_scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to: {scaler_path}")
    
    print(f"\n{'='*60}")
    print("Training Complete!")
    print(f"{'='*60}")
    print(f"Final Test Accuracy: {accuracy * 100:.2f}%")
    print(f"Files Processed: {len(files)}")
    print("="*60)

if __name__ == '__main__':
    train_gait_model()