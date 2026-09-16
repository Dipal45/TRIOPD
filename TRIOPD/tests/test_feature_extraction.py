import sys
import os
import tempfile
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from TRIOPD.backend.ml.feature_extraction.handwriting_features import extract_handwriting_features

def test_handwriting_feature_extraction():
    dummy_trajectory = [
        {"x": 10, "y": 10, "timestamp": 1000, "pressure": 0.5},
        {"x": 20, "y": 15, "timestamp": 1050, "pressure": 0.6},
        {"x": 30, "y": 20, "timestamp": 1100, "pressure": 0.5},
        {"x": 40, "y": 25, "timestamp": 1150, "pressure": 0.7},
        {"x": 50, "y": 30, "timestamp": 1200, "pressure": 0.5}
    ]
    features = extract_handwriting_features(dummy_trajectory)
    assert 'total_path_length' in features
    assert 'mean_velocity' in features
    assert 'pause_count' in features
    assert features['total_path_length'] > 0