@echo off
echo Starting TRIOPD Backend...
start cmd /k "cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo Starting TRIOPD Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting! You can close this window.
timeout /t 5