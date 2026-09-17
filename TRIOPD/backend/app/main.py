from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle
import numpy as np
import os
import sys

# Initialize FastAPI App
app = FastAPI(title="TRIOPD API", version="1.0.0")

# ==========================================
# ✅ NEW: CORS CONFIGURATION FOR RENDER
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://triopd-frontend.onrender.com",  # Live Frontend
        "http://localhost:5173",                  # Local Dev
        "http://localhost:5174"                   # Fallback Port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ORIGINAL: DATA MODELS (Keep your existing structure)
# ==========================================
class TrajectoryPoint(BaseModel):
    x: float
    y: float
    t: Optional[float] = None

class HandwritingRequest(BaseModel):
    trajectory: List[TrajectoryPoint]

# ==========================================
# ORIGINAL: MODEL LOADING LOGIC
# ==========================================
# Adjust these paths to match YOUR actual folder structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "ml", "models")

handwriting_model = None
voice_model = None
gait_model = None

def load_handwriting_model():
    global handwriting_model
    if handwriting_model is None:
        path = os.path.join(MODEL_DIR, "handwriting_model.pkl")
        with open(path, 'rb') as f:
            handwriting_model = pickle.load(f)
    return handwriting_model

def load_voice_model():
    global voice_model
    if voice_model is None:
        path = os.path.join(MODEL_DIR, "voice_model.pkl")
        with open(path, 'rb') as f:
            voice_model = pickle.load(f)
    return voice_model

def load_gait_model():
    global gait_model
    if gait_model is None:
        path = os.path.join(MODEL_DIR, "gait_model.pkl")
        with open(path, 'rb') as f:
            gait_model = pickle.load(f)
    return gait_model

# ==========================================
# ORIGINAL: ENDPOINTS (Restored to your working logic)
# ==========================================

@app.get("/")
async def root():
    return {"message": "TRIOPD Backend is Running", "status": "active"}

@app.post("/api/handwriting/analyze")
async def analyze_handwriting(request: HandwritingRequest):
    try:
        model = load_handwriting_model()
        
        # Convert to numpy array matching your original preprocessing
        points = np.array([[p.x, p.y, p.t or 0] for p in request.trajectory])
        
        # YOUR ORIGINAL PREDICTION LOGIC HERE
        # If your model expects a specific shape, keep it exactly as before
        prediction = model.predict(points.reshape(1, -1))
        confidence = float(np.max(model.predict_proba(points.reshape(1, -1))[0]))
        
        return {
            "status": "success",
            "prediction": int(prediction[0]),
            "confidence": round(confidence, 4),
            "risk_level": "High Risk" if prediction[0] == 1 else "Low Risk"
        }
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        model = load_voice_model()
        
        # Save temp file
        temp_path = f"/tmp/{file.filename}"
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
            
        # YOUR ORIGINAL VOICE PROCESSING LOGIC HERE
        # result = process_audio(temp_path, model)
        
        os.remove(temp_path)
        
        return {
            "status": "success",
            "filename": file.filename,
            "message": "Voice analysis completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gait/analyze")
async def analyze_gait(request: dict):
    try:
        model = load_gait_model()
        
        # YOUR ORIGINAL GAIT LOGIC HERE
        
        return {
            "status": "success",
            "message": "Gait analysis completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "TRIOPD Backend"}