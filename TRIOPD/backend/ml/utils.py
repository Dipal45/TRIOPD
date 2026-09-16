import os
import joblib

def save_model(model, filepath):
    """Save a trained model to disk."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model saved to {filepath}")

def load_model(filepath):
    """Load a model from disk."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Model not found at {filepath}")
    return joblib.load(filepath)

def ensure_dir(filepath):
    """Ensure directory exists for a file path."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
