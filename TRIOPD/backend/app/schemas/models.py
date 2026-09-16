from pydantic import BaseModel
from typing import List, Dict, Any

class HandwritingPoint(BaseModel):
    x: float
    y: float
    timestamp: float
    pressure: float

class HandwritingPayload(BaseModel):
    trajectory: List[HandwritingPoint]

class AssessmentResult(BaseModel):
    modality: str
    risk_score: float
    risk_category: str
    features_used: Dict[str, Any]
    message: str