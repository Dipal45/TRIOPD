import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

def setup_fuzzy_system():
    # Antecedents (Inputs)
    handwriting_risk = ctrl.Antecedent(np.arange(0, 101, 1), 'handwriting_risk')
    gait_risk = ctrl.Antecedent(np.arange(0, 101, 1), 'gait_risk')
    voice_risk = ctrl.Antecedent(np.arange(0, 101, 1), 'voice_risk')

    # Consequent (Output)
    overall_risk = ctrl.Consequent(np.arange(0, 101, 1), 'overall_risk')

    # Membership functions
    for var in [handwriting_risk, gait_risk, voice_risk]:
        var['low'] = fuzz.trimf(var.universe, [0, 0, 50])
        var['medium'] = fuzz.trimf(var.universe, [0, 50, 100])
        var['high'] = fuzz.trimf(var.universe, [50, 100, 100])

    overall_risk['low'] = fuzz.trimf(overall_risk.universe, [0, 0, 50])
    overall_risk['moderate'] = fuzz.trimf(overall_risk.universe, [0, 50, 100])
    overall_risk['high'] = fuzz.trimf(overall_risk.universe, [50, 100, 100])

    # Rules
    rule1 = ctrl.Rule(handwriting_risk['high'] & gait_risk['high'] & voice_risk['high'], overall_risk['high'])
    rule2 = ctrl.Rule(handwriting_risk['high'] & gait_risk['high'], overall_risk['high'])
    rule3 = ctrl.Rule(voice_risk['high'] & gait_risk['high'], overall_risk['high'])
    rule4 = ctrl.Rule(handwriting_risk['high'] & voice_risk['high'], overall_risk['high'])
    rule5 = ctrl.Rule(handwriting_risk['medium'] & gait_risk['medium'] & voice_risk['medium'], overall_risk['moderate'])
    rule6 = ctrl.Rule(handwriting_risk['low'] & gait_risk['low'] & voice_risk['low'], overall_risk['low'])
    rule7 = ctrl.Rule(handwriting_risk['medium'] | gait_risk['medium'] | voice_risk['medium'], overall_risk['moderate'])

    fuzzy_system = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7])
    return ctrl.ControlSystemSimulation(fuzzy_system)

def calculate_fused_risk(hw_score: float, gait_score: float, voice_score: float) -> dict:
    """
    Scores should be 0-100 probability/risk scores.
    """
    sim = setup_fuzzy_system()
    sim.input['handwriting_risk'] = hw_score
    sim.input['gait_risk'] = gait_score
    sim.input['voice_risk'] = voice_score
    
    try:
        sim.compute()
        overall = sim.output['overall_risk']
    except ValueError:
        overall = 50.0 # Fallback

    if overall < 40:
        category = "Low"
    elif overall < 70:
        category = "Moderate"
    else:
        category = "High"

    return {"score": round(float(overall), 2), "category": category}