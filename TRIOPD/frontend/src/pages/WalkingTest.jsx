import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WalkingTest() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);

  const [mode, setMode] = useState('record'); // 'record' or 'upload'
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, [videoUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      mediaRecorderRef.current = new MediaRecorder(stream);
      videoChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob); setVideoUrl(url);
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      };
      mediaRecorderRef.current.start(); setRecording(true);
    } catch (err) { setError('Camera access denied. Please allow camera access.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) { mediaRecorderRef.current.stop(); setRecording(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { setError('Please upload a valid video file.'); return; }
    const url = URL.createObjectURL(file);
    setVideoBlob(file); setVideoUrl(url); setError(null);
  };

  const submitAnalysis = async () => {
    if (!videoBlob) { setError('Please record or upload a video first.'); return; }
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', videoBlob, 'gait_recording.webm');
      const response = await fetch('http://localhost:8000/api/gait/upload-video', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResult(data);
      localStorage.setItem('gaitResult', JSON.stringify(data));
    } catch (err) { setError(err.message || 'Failed to analyze gait.'); } finally { setLoading(false); }
  };

  const clearVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; }
    setVideoBlob(null); setVideoUrl(null); setResult(null); setError(null);
  };

  const finalizeAssessment = async () => {
    if (!result) return;
    if (!patientName || !patientAge) { setError('Please enter Patient Name and Age before finalizing.'); return; }
    const handwritingResult = JSON.parse(localStorage.getItem('handwritingResult') || 'null');
    const voiceResult = JSON.parse(localStorage.getItem('voiceResult') || 'null');
    try {
      const response = await fetch('http://localhost:8000/api/assessment/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handwriting_score: handwritingResult?.risk_score || null,
          voice_score: voiceResult?.risk_score || null,
          gait_score: result.risk_score,
          patient_name: patientName, patient_age: parseInt(patientAge)
        }),
      });
      if (!response.ok) throw new Error('Failed to finalize');
      navigate('/results');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Walking / Gait Analysis</h1>
        
        {/* CLINICAL INSTRUCTIONS FOR VIDEO RECORDING */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2"> Instructions for Video Recording</h3>
          <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
            <li>Set up the camera at hip-level, 3-5 meters away from the walking path.</li>
            <li>Record from the SIDE VIEW (profile), capturing the full body from head to toe.</li>
            <li>Patient should walk at their normal, comfortable pace across the frame.</li>
            <li>Ensure good lighting and avoid obstructions in the walking path.</li>
            <li>Record for at least 10-15 seconds of continuous walking.</li>
          </ul>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-gray-200 p-1 rounded-lg mb-6 w-fit shadow-sm">
          <button onClick={() => { setMode('record'); clearVideo(); }} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'record' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>📹 Record Video</button>
          <button onClick={() => { setMode('upload'); clearVideo(); }} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>📁 Upload Video</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {mode === 'record' ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">{recording ? 'Recording in progress...' : 'Camera Preview'}</h2>
                {recording && <span className="flex items-center gap-2 text-red-600 font-semibold"><span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span> LIVE</span>}
              </div>
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                {!recording && !videoUrl && <p className="absolute text-gray-400 text-lg">Click Start to turn on camera</p>}
              </div>
              <div className="flex justify-center gap-4">
                {!recording ? (
                  <button onClick={startRecording} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md flex items-center gap-2"><span>🔴</span> Start Recording</button>
                ) : (
                  <button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-md flex items-center gap-2"><span>️</span> Stop Recording</button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-8xl mb-6 text-gray-400">📹</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Walking Video</h2>
              <p className="text-gray-500 mb-8">Supported formats: MP4, MOV, WEBM</p>
              <input type="file" ref={fileInputRef} accept="video/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md">Choose Video File</button>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Video Preview</h3>
              <button onClick={clearVideo} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear & Reset</button>
            </div>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <video controls src={videoUrl} className="w-full h-full object-contain" />
            </div>
            {!result && (
              <button onClick={submitAnalysis} disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50 flex justify-center items-center gap-2">
                {loading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Analyzing Gait...</>) : 'Analyze Gait'}
              </button>
            )}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Risk Score</p><p className="text-3xl font-bold text-blue-600">{result.risk_score}%</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Category</p><p className={`text-3xl font-bold ${result.risk_category === 'High' ? 'text-red-600' : result.risk_category === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{result.risk_category}</p></div>
            </div>
            {result.message && <p className="text-gray-600 mb-6">{result.message}</p>}
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Patient Details for Final Report</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. John Doe" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Age</label>
                  <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="e.g. 65" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button onClick={finalizeAssessment} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition shadow-md">View Final Assessment →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}