// TRIOPD/frontend/src/utils/api.js

// ✅ PRODUCTION URL - Points to your live Render backend
const API_BASE = 'https://triopd.onrender.com/api';

/**
 * Analyze Handwriting Spiral
 * @param {Array} trajectory - Array of {x, y, t} points from canvas
 */
export const analyzeHandwriting = async (trajectory) => {
  const res = await fetch(`${API_BASE}/handwriting/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trajectory }),
  });
  
  if (!res.ok) throw new Error(`Handwriting analysis failed: ${res.status}`);
  return res.json();
};

/**
 * Analyze Voice Recording
 * @param {FormData} formData - Contains audio file blob
 */
export const analyzeVoice = async (formData) => {
  const res = await fetch(`${API_BASE}/voice/analyze`, {
    method: 'POST',
    // ⚠️ DO NOT set Content-Type header for FormData - browser sets it automatically
    body: formData,
  });
  
  if (!res.ok) throw new Error(`Voice analysis failed: ${res.status}`);
  return res.json();
};

/**
 * Analyze Walking/Gait Video
 * @param {Array} trajectory - Array of pose keypoints or video metadata
 */
export const analyzeWalking = async (trajectory) => {
  const res = await fetch(`${API_BASE}/gait/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trajectory }),
  });
  
  if (!res.ok) throw new Error(`Gait analysis failed: ${res.status}`);
  return res.json();
};

/**
 * Save Assessment Results to Backend
 * @param {Object} data - Patient info + test results
 */
export const saveResults = async (data) => {
  const res = await fetch(`${API_BASE}/results/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error(`Failed to save results: ${res.status}`);
  return res.json();
};