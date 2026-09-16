import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HandwritingTest() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [mode, setMode] = useState('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Draw Spiral Guide
  const drawSpiralGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const turns = 3;

    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);

    for (let angle = 0; angle <= turns * 2 * Math.PI; angle += 0.1) {
      const radius = (maxRadius * angle) / (turns * 2 * Math.PI);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Trace the spiral above', centerX, height - 20);
  };

  useEffect(() => { drawSpiralGuide(); }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setTrajectory([{ x: coords.x, y: coords.y, timestamp: Date.now() }]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    setTrajectory(prev => [...prev, { x: coords.x, y: coords.y, timestamp: Date.now() }]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpiralGuide();
    setTrajectory([]);
    setResult(null);
    setError(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:8000/api/handwriting/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setResult(data);
      localStorage.setItem('handwritingResult', JSON.stringify(data));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const submitAnalysis = async () => {
    if (trajectory.length < 10) { setError('Please trace more of the spiral before analyzing.'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/handwriting/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trajectory }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResult(data);
      localStorage.setItem('handwritingResult', JSON.stringify(data));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const proceedToNext = () => { if (result) navigate('/assessment/voice'); };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Handwriting Analysis</h1>
        
        {/* CLINICAL INSTRUCTIONS */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"> Instructions for Patient</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>Use your dominant hand to hold the mouse or stylus.</li>
            <li>Start from the center dot and trace outward along the dashed spiral line.</li>
            <li>Try to maintain a steady speed and stay as close to the guide line as possible.</li>
            <li>If you make a mistake, click "Clear & Reset" and try again.</li>
          </ul>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-gray-200 p-1 rounded-lg mb-6 w-fit shadow-sm">
          <button onClick={() => setMode('draw')} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>✏️ Draw Spiral</button>
          <button onClick={() => setMode('upload')} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>️ Upload Image</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {mode === 'draw' ? (
            <div>
              <canvas ref={canvasRef} width={600} height={600} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="border-2 border-gray-200 rounded-lg cursor-crosshair bg-white mx-auto block touch-none" style={{ maxWidth: '100%' }} />
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={clearCanvas} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition">Clear & Reset</button>
                <button onClick={submitAnalysis} disabled={loading || trajectory.length < 10} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50">{loading ? 'Analyzing...' : 'Analyze Drawing'}</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">️</div>
              <p className="text-gray-600 mb-6 text-center">Upload a clear photo of a spiral drawing on white paper.</p>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">{loading ? 'Uploading...' : 'Choose Image'}</button>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Risk Score</p><p className="text-3xl font-bold text-blue-600">{result.risk_score}%</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Category</p><p className={`text-3xl font-bold ${result.risk_category === 'High' ? 'text-red-600' : result.risk_category === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{result.risk_category}</p></div>
            </div>
            <button onClick={proceedToNext} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition shadow-md">Proceed to Voice Test →</button>
          </div>
        )}
      </div>
    </div>
  );
}