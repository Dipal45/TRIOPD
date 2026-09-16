import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VoiceTest() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('record');
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => { return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }; }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob); setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start(); setRecording(true);
    } catch (err) { setError('Microphone access denied. Please allow microphone access.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) { mediaRecorderRef.current.stop(); setRecording(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { setError('Please upload a valid audio file.'); return; }
    const url = URL.createObjectURL(file);
    setAudioBlob(file); setAudioUrl(url); setError(null);
  };

  const submitAnalysis = async () => {
    if (!audioBlob) { setError('Please record or upload audio first.'); return; }
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_sample.wav');
      const response = await fetch('http://localhost:8000/api/voice/analyze', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResult(data);
      localStorage.setItem('voiceResult', JSON.stringify(data));
    } catch (err) { setError(err.message || 'Failed to analyze voice.'); } finally { setLoading(false); }
  };

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null); setAudioUrl(null); setResult(null); setError(null);
  };

  const proceedToNext = () => { if (result) navigate('/assessment/walking'); };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Voice Analysis</h1>
        
        {/* CLINICAL INSTRUCTIONS */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">🎤 Instructions for Patient</h3>
          <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
            <li>Find a quiet room with minimal background noise.</li>
            <li>Sit comfortably and speak clearly into the microphone.</li>
            <li>Sustain the vowel sound "Ahhh" steadily for 3-5 seconds without taking a breath.</li>
            <li>Avoid coughing, throat clearing, or speaking during the recording.</li>
          </ul>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-gray-200 p-1 rounded-lg mb-6 w-fit shadow-sm">
          <button onClick={() => { setMode('record'); clearAudio(); }} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'record' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>🎤 Record Voice</button>
          <button onClick={() => { setMode('upload'); clearAudio(); }} className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>📁 Upload Audio</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
          {mode === 'record' ? (
            <div>
              <div className={`text-8xl mb-6 transition-all ${recording ? 'animate-pulse text-red-500' : 'text-blue-500'}`}>{recording ? '🔴' : '️'}</div>
              <h2 className="text-2xl font-bold mb-2">{recording ? 'Recording in progress...' : 'Ready to Record'}</h2>
              <p className="text-gray-500 mb-8">{recording ? 'Speak "Ahhh" steadily now.' : 'Click below to start recording.'}</p>
              {!recording ? (
                <button onClick={startRecording} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md">Start Recording</button>
              ) : (
                <button onClick={stopRecording} className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-md">Stop Recording</button>
              )}
            </div>
          ) : (
            <div>
              <div className="text-8xl mb-6 text-gray-400">📂</div>
              <h2 className="text-2xl font-bold mb-2">Upload Audio File</h2>
              <p className="text-gray-500 mb-8">Supported formats: WAV, MP3, M4A</p>
              <input type="file" ref={fileInputRef} accept="audio/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md">Choose Audio File</button>
            </div>
          )}
        </div>

        {audioUrl && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Audio Preview</h3>
              <button onClick={clearAudio} className="text-sm text-red-500 hover:text-red-700">Clear & Reset</button>
            </div>
            <audio controls src={audioUrl} className="w-full h-12" />
            {!result && (
              <button onClick={submitAnalysis} disabled={loading} className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition disabled:opacity-50">{loading ? 'Analyzing Voice...' : 'Analyze Voice'}</button>
            )}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Risk Score</p><p className="text-3xl font-bold text-blue-600">{result.risk_score}%</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-1">Category</p><p className={`text-3xl font-bold ${result.risk_category === 'High' ? 'text-red-600' : result.risk_category === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{result.risk_category}</p></div>
            </div>
            <button onClick={proceedToNext} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition shadow-md">Proceed to Walking Test →</button>
          </div>
        )}
      </div>
    </div>
  );
}