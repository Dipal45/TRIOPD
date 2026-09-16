import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def sample_handwriting_trajectory():
    return [
        {"x": 10, "y": 10, "timestamp": 1000, "pressure": 0.5},
        {"x": 20, "y": 15, "timestamp": 1050, "pressure": 0.6},
        {"x": 30, "y": 20, "timestamp": 1100, "pressure": 0.5},
        {"x": 40, "y": 25, "timestamp": 1150, "pressure": 0.7},
        {"x": 50, "y": 30, "timestamp": 1200, "pressure": 0.5}
    ]

@pytest.fixture
def sample_voice_features():
    return {
        'mean_f0': 120.5,
        'std_f0': 15.2,
        'mfcc_1_mean': -500.3,
        'mfcc_2_mean': 30.1,
        'spectral_centroid': 1500.0,
        'spectral_rolloff': 800.0,
        'duration_sec': 5.0
    }

@pytest.fixture
def sample_gait_features():
    return {
        'left_ankle_var': 0.05,
        'right_ankle_var': 0.06,
        'hip_symmetry_mean': 0.02,
        'arm_swing_asymmetry': 0.03,
        'total_frames': 150
    }