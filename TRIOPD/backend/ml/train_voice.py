import os
import glob
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib
import librosa

def extract_audio_features(file_path):
    """Extract MFCC and statistical features from an audio file."""
    try:
        # Load audio file
        y, sr = librosa.load(file_path, duration=5)  # Load first 5 seconds
        
        # Extract MFCCs (Mel-Frequency Cepstral Coefficients)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs, axis=1)
        mfccs_std = np.std(mfccs, axis=1)
        
        # Extract additional features
        # Chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Spectral contrast
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        contrast_mean = np.mean(contrast, axis=1)
        
        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(y)
        zcr_mean = np.mean(zcr)
        zcr_std = np.std(zcr)
        
        # RMS energy
        rms = librosa.feature.rms(y=y)
        rms_mean = np.mean(rms)
        rms_std = np.std(rms)
        
        # Combine all features
        features = np.concatenate([
            mfccs_mean,      # 13 features
            mfccs_std,       # 13 features
            chroma_mean,     # 12 features
            contrast_mean,   # 6 features
            [zcr_mean, zcr_std, rms_mean, rms_std]  # 4 features
        ])
        
        return features
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def load_data_from_folder(folder_path, label):
    """Load all audio files from a specific folder and assign a label."""
    X = []
    y = []
    
    # Look for audio files
    audio_extensions = ['*.wav', '*.mp3', '*.flac', '*.m4a', '*.ogg']
    files = []
    for ext in audio_extensions:
        files.extend(glob.glob(os.path.join(folder_path, ext)))
    
    for file_path in files:
        print(f"Processing: {os.path.basename(file_path)}...")
        features = extract_audio_features(file_path)
        if features is not None:
            X.append(features)
            y.append(label)
            
    return X, y

def train_voice_model():
    print("="*60)
    print("Starting Voice Model Training")
    print("="*60)
    
    base_dir = os.path.join('ml', 'datasets')
    
    # Define paths to the healthy and Parkinsons folders
    healthy_dir = os.path.join(base_dir, 'healthy')
    parkinsons_dir = os.path.join(base_dir, 'Parkinsons')
    
    # Fallback for lowercase folder names
    if not os.path.exists(parkinsons_dir):
        parkinsons_dir = os.path.join(base_dir, 'parkinsons')

    if not os.path.exists(healthy_dir) or not os.path.exists(parkinsons_dir):
        print(f"ERROR: Folders not found!")
        print(f"Expected: {healthy_dir} and {parkinsons_dir}")
        return

    print(f"Loading Healthy audio files from: {healthy_dir}")
    X_healthy, y_healthy = load_data_from_folder(healthy_dir, label=0)
    print(f"Successfully processed {len(X_healthy)} healthy files.")

    print(f"\nLoading Parkinsons audio files from: {parkinsons_dir}")
    X_parkinsons, y_parkinsons = load_data_from_folder(parkinsons_dir, label=1)
    print(f"Successfully processed {len(X_parkinsons)} Parkinsons files.")

    # Combine data
    X = X_healthy + X_parkinsons
    y = y_healthy + y_parkinsons

    if len(X) == 0:
        print("ERROR: No valid audio files found in the folders.")
        print("Make sure your folders contain .wav or .mp3 files.")
        return

    X = np.array(X)
    y = np.array(y)

    print(f"\n{'='*60}")
    print("Dataset Summary")
    print(f"{'='*60}")
    print(f"Total samples: {len(X)}")
    print(f"Feature dimensions: {X.shape[1]}")
    print(f"Healthy (0): {sum(y == 0)}")
    print(f"Parkinsons (1): {sum(y == 1)}")

    # Split data (80% train, 20% test)
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

    # Evaluate on BOTH train and test sets
    print(f"\n{'='*60}")
    print("Model Evaluation")
    print(f"{'='*60}")

    train_predictions = model.predict(X_train_scaled)
    train_accuracy = accuracy_score(y_train, train_predictions)
    print(f"\nTraining Accuracy: {train_accuracy * 100:.2f}%")

    test_predictions = model.predict(X_test_scaled)
    test_accuracy = accuracy_score(y_test, test_predictions)
    print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")

    # Save model and scaler
    print(f"\n{'='*60}")
    print("Saving Model")
    print(f"{'='*60}")

    model_dir = os.path.join('ml', 'models')
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, 'voice_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")

    scaler_path = os.path.join(model_dir, 'voice_scaler.pkl')
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to: {scaler_path}")

    # Save model info WITH BOTH accuracies
    model_info = {
        'train_accuracy': train_accuracy,
        'test_accuracy': test_accuracy,
        'total_samples': len(X),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'feature_count': X.shape[1]
    }
    info_path = os.path.join(model_dir, 'voice_model_info.pkl')
    joblib.dump(model_info, info_path)
    print(f"Model info saved to: {info_path}")

    print(f"\n{'='*60}")
    print("Training Complete!")
    print(f"{'='*60}")
    print(f"Training Accuracy: {train_accuracy * 100:.2f}%")
    print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")
    print("="*60)

if __name__ == '__main__':
    train_voice_model()