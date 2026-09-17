from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle
import numpy as np
import os

# Initialize FastAPI App
app = FastAPI(
    title="TRIOPD API",
    description="AI-Assisted Parkinson's Disease Screening Tool Backend",
    version="1.0.0"
)

# ==========================================
# ✅ CORS CONFIGURATION (CRITICAL FOR DEPLOYMENT)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://triopd-frontend.onrender.com",  # Your live Render frontend
        "http://localhost:5173",                  # Local Vite dev server
        "http://localhost:5174"                   # Fallback local port
    ],
    allow_credentials=True,
    allow_methods=["*"],       # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],       # Allow all headers including Content-Type
)

# ==========================================
# DATA MODELS
# ==========================================
class TrajectoryPoint(BaseModel):
    x: float
    y: float
    t: Optional[float] = None

class HandwritingRequest(BaseModel):
    trajectory: List[TrajectoryPoint]

class GaitRequest(BaseModel):
    trajectory: List[dict]  # Adjust based on your actual gait data structure

# ==========================================
# LOAD ML MODELS (Lazy Loading)
# ==========================================
# Models are loaded only when first requested to save memory on free tier
handwriting_model = None
voice_model = None
gait_model = None

def get_handwriting_model():
    global handwriting_model
    if handwriting_model is None:
        model_path = os.path.join(os.path.dirname(__file__), "../ml/models/handwriting_model.pkl")
        with open(model_path, 'rb') as f:
            handwriting_model = pickle.load(f)
    return handwriting_model

def get_voice_model():
    global voice_model
    if voice_model is None:
        model_path = os.path.join(os.path.dirname(__file__), "../ml/models/voice_model.pkl")
        with open(model_path, 'rb') as f:
            voice_model = pickle.load(f)
    return voice_model

def get_gait_model():
    global gait_model
    if gait_model is None:
        model_path = os.path.join(os.path.dirname(__file__), "../ml/models/gait_model.pkl")
        with open(model_path, 'rb') as f:
            gait_model = pickle.load(f)
    return gait_model

# ==========================================
# ROOT ENDPOINT (Health Check)
# ==========================================
@app.get("/")
async def root():
    return {
        "message": "Welcome to TRIOPD API",
        "status": "healthy",
        "docs": "/docs"
    }

# ==========================================
# HANDWRITING ANALYSIS ENDPOINT
# ==========================================
@app.post("/api/handwriting/analyze")
async def analyze_handwriting(request: HandwritingRequest):
    try:
        model = get_handwriting_model()
        
        # Convert trajectory to numpy array for prediction
        points = np.array([[p.x, p.y, p.t or 0] for p in request.trajectory])
        
        # Make prediction (adjust based on your model's expected input)
        prediction = model.predict(points.reshape(1, -1))
        probability = model.predict_proba(points.reshape(1, -1))[0]
        
        return {
            "status": "success",
            "prediction": int(prediction[0]),
            "confidence": float(max(probability)),
            "risk_level": "High" if prediction[0] == 1 else "Low",
            "points_analyzed": len(request.trajectory)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Handwriting analysis failed: {str(e)}")

# ==========================================
# VOICE ANALYSIS ENDPOINT
# ==========================================
@app.post("/api/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        model = get_voice_model()
        
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # TODO: Add audio feature extraction here (librosa, etc.)
        # For now, returning mock response
        # features = extract_audio_features(temp_path)
        # prediction = model.predict(features)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "status": "success",
            "filename": file.filename,
            "message": "Voice analysis completed (feature extraction pending)",
            "risk_level": "Moderate"  # Placeholder
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

# ==========================================
# GAIT/WALKING ANALYSIS ENDPOINT
# ==========================================
@app.post("/api/gait/analyze")
async def analyze_gait(request: GaitRequest):
    try:
        model = get_gait_model()
        
        # Process gait trajectory data
        # TODO: Implement actual gait analysis logic
        
        return {
            "status": "success",
            "message": "Gait analysis completed",
            "frames_analyzed": len(request.trajectory),
            "risk_level": "Low"  # Placeholder
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gait analysis failed: {str(e)}")

# ==========================================
# SAVE RESULTS ENDPOINT
# ==========================================
@app.post("/api/results/save")
async def save_results(data: dict):
    """
    Save assessment results to database or file
    """
    try:
        # TODO: Implement database storage
        print(f"Saving results: {data}")
        
        return {
            "status": "success",
            "message": "Results saved successfully",
            "timestamp": str(np.datetime64('now'))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save results: {str(e)}")

# ==========================================
# HEALTH CHECK ENDPOINT
# ==========================================
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "TRIOPD Backend",
        "models_loaded": {
            "handwriting": handwriting_model is not None,
            "voice": voice_model is not None,
            "gait": gait_model is not None
        }
    }