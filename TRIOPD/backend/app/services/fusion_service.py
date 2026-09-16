def fuse(hw_score: float, gait_score: float, voice_score: float) -> dict:
    """Fuse scores from three modalities using simple averaging (placeholder for fuzzy logic)."""
    
    # Simple average (in production, would use scikit-fuzzy)
    fused_score = (hw_score + gait_score + voice_score) / 3
    
    risk_category = "High" if fused_score > 70 else "Moderate" if fused_score > 40 else "Low"
    
    return {
        "category": risk_category,
        "score": round(fused_score, 2),
        "method": "simple_average",
        "message": "Fusion completed. Note: Using simple average - implement fuzzy logic for better results."
    }