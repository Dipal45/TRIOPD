import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_handwriting_analysis_invalid_data():
    response = client.post("/api/handwriting/analyze", json={"trajectory": []})
    assert response.status_code == 400

def test_walking_analysis_wrong_file_type():
    with open("test.txt", "w") as f:
        f.write("test")
    with open("test.txt", "rb") as f:
        response = client.post("/api/walking/analyze", files={"file": ("test.txt", f, "text/plain")})
    assert response.status_code == 400
    os.remove("test.txt")