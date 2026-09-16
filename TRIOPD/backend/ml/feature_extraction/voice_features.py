import librosa
import numpy as np
import os

def extract_voice_features(audio_path: str) -> dict:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    # Load audio, resample to 22050 Hz for consistency
    y, sr = librosa.load(audio_path, sr=22050)
    
    # Fundamental frequency (F0)
    f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    f0 = f0[~np.isnan(f0)]
    
    # MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfccs, axis=1)
    
    # Spectral features
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
    
    features = {
        'mean_f0': float(np.mean(f0)) if len(f0) > 0 else 0.0,
        'std_f0': float(np.std(f0)) if len(f0) > 0 else 0.0,
        'mfcc_1_mean': float(mfcc_mean[0]),
        'mfcc_2_mean': float(mfcc_mean[1]),
        'spectral_centroid': float(spectral_centroid),
        'spectral_rolloff': float(spectral_rolloff),
        'duration_sec': float(len(y) / sr)
    }
    return features