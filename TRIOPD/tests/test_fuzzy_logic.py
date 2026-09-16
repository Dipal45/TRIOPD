import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from TRIOPD.backend.ml.fusion.fuzzy_fusion import calculate_fused_risk

def test_fuzzy_logic_high_risk():
    # If all are high, overall should be high
    result = calculate_fused_risk(85.0, 90.0, 80.0)
    assert result['category'] == "High"
    assert result['score'] > 70

def test_fuzzy_logic_low_risk():
    # If all are low, overall should be low
    result = calculate_fused_risk(10.0, 15.0, 20.0)
    assert result['category'] == "Low"
    assert result['score'] < 40

def test_fuzzy_logic_moderate_risk():
    # Mixed moderate inputs
    result = calculate_fused_risk(50.0, 55.0, 45.0)
    assert result['category'] == "Moderate"