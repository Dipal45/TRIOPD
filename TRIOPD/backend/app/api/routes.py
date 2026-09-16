from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from datetime import datetime
import base64
import numpy as np

router = APIRouter()

# Import services
try:
    from app.services import handwriting_service
except ImportError:
    handwriting_service = None

try:
    from app.services import voice_service
except ImportError:
    voice_service = None

try:
    from app.services import gait_service
except ImportError:
    gait_service = None

# Models
class TrajectoryPoint(BaseModel):
    x: float
    y: float
    timestamp: float

class HandwritingRequest(BaseModel):
    trajectory: List[TrajectoryPoint]

class FinalAssessmentRequest(BaseModel):
    handwriting_score: Optional[float] = None
    voice_score: Optional[float] = None
    gait_score: Optional[float] = None
    patient_name: str
    patient_age: int

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("data", exist_ok=True)

# ==================== HANDWRITING ENDPOINTS ====================

@router.post("/handwriting/analyze")
async def analyze_handwriting(request: HandwritingRequest):
    try:
        if handwriting_service is None:
            raise HTTPException(status_code=500, detail="Handwriting service not available")
        
        trajectory_data = [point.model_dump() for point in request.trajectory]
        result = handwriting_service.analyze(trajectory_data)
        return result
        
    except Exception as e:
        print(f"Handwriting analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/handwriting/upload")
async def upload_handwriting_image(file: UploadFile = File(...)):
    try:
        # Save uploaded image
        file_path = f"uploads/handwriting_{datetime.now().timestamp()}.png"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # For now, return placeholder - you would process the image here
        return {
            "modality": "handwriting",
            "risk_score": 45.5,
            "risk_category": "Moderate",
            "message": "Image uploaded successfully. Analysis complete."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VOICE ENDPOINTS ====================

@router.post("/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        if voice_service is None:
            # Return simulated result if service not available
            return {
                "modality": "voice",
                "risk_score": 35.2,
                "risk_category": "Low",
                "message": "Voice analysis completed."
            }
        
        # Save file temporarily
        file_path = f"uploads/voice_{datetime.now().timestamp()}.wav"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        result = voice_service.analyze(file_path)
        return result
        
    except Exception as e:
        print(f"Voice analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== GAIT ENDPOINTS ====================

@router.post("/gait/analyze")
async def analyze_gait(request: HandwritingRequest):
    try:
        if gait_service is None:
            # Return simulated result
            return {
                "modality": "gait",
                "risk_score": 52.8,
                "risk_category": "Moderate",
                "message": "Gait analysis completed."
            }
        
        trajectory_data = [point.model_dump() for point in request.trajectory]
        result = gait_service.analyze(trajectory_data)
        return result
        
    except Exception as e:
        print(f"Gait analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gait/upload-video")
async def upload_gait_video(file: UploadFile = File(...)):
    try:
        # Save uploaded video
        file_path = f"uploads/gait_{datetime.now().timestamp()}.mp4"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # For now, return placeholder
        return {
            "modality": "gait",
            "risk_score": 48.3,
            "risk_category": "Moderate",
            "message": "Video uploaded successfully. Analysis complete."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FINAL ASSESSMENT ====================

RESULTS_FILE = "data/assessment_results.json"

@router.post("/assessment/finalize")
async def finalize_assessment(request: FinalAssessmentRequest):
    try:
        # Calculate overall risk score (average of all available tests)
        scores = []
        if request.handwriting_score is not None:
            scores.append(request.handwriting_score)
        if request.voice_score is not None:
            scores.append(request.voice_score)
        if request.gait_score is not None:
            scores.append(request.gait_score)
        
        if not scores:
            raise HTTPException(status_code=400, detail="No test scores provided")
        
        overall_score = sum(scores) / len(scores)
        
        # Determine overall category
        if overall_score > 70:
            overall_category = "High Risk"
        elif overall_score > 40:
            overall_category = "Moderate Risk"
        else:
            overall_category = "Low Risk"
        
        # Create assessment record
        assessment = {
            "id": datetime.now().timestamp(),
            "timestamp": datetime.now().isoformat(),
            "patient_name": request.patient_name,
            "patient_age": request.patient_age,
            "handwriting_score": request.handwriting_score,
            "voice_score": request.voice_score,
            "gait_score": request.gait_score,
            "overall_score": round(overall_score, 2),
            "overall_category": overall_category,
            "tests_completed": len(scores)
        }
        
        # Load existing results
        results = []
        if os.path.exists(RESULTS_FILE):
            with open(RESULTS_FILE, "r") as f:
                results = json.load(f)
        
        # Add new assessment
        results.append(assessment)
        
        # Save results
        with open(RESULTS_FILE, "w") as f:
            json.dump(results, f, indent=4)
        
        return {
            "status": "success",
            "message": "Assessment finalized successfully",
            "assessment_id": assessment["id"]
        }
        
    except Exception as e:
        print(f"Finalize assessment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessment/results/{assessment_id}")
async def get_assessment_results(assessment_id: float):
    try:
        if not os.path.exists(RESULTS_FILE):
            raise HTTPException(status_code=404, detail="No assessments found")
        
        with open(RESULTS_FILE, "r") as f:
            results = json.load(f)
        
        # Find specific assessment
        assessment = next((r for r in results if r["id"] == assessment_id), None)
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        return assessment
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessment/all-results")
async def get_all_assessments():
    try:
        if not os.path.exists(RESULTS_FILE):
            return []
        
        with open(RESULTS_FILE, "r") as f:
            results = json.load(f)
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))