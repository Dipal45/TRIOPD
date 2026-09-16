const API_BASE = 'http://localhost:8000/api';

export const analyzeHandwriting = async (trajectory) => {
  const res = await fetch(`${API_BASE}/handwriting/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trajectory }),
  });
  if (!res.ok) throw new Error('Handwriting analysis failed');
  return res.json();
};

export const analyzeVoice = async (formData) => {
  const res = await fetch(`${API_BASE}/voice/analyze`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Voice analysis failed');
  return res.json();
};

export const analyzeWalking = async (trajectory) => {
  const res = await fetch(`${API_BASE}/gait/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trajectory }),
  });
  if (!res.ok) throw new Error('Walking analysis failed');
  return res.json();
};

export const saveResult = async (data) => {
  const res = await fetch(`${API_BASE}/results/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getResults = async () => {
  const res = await fetch(`${API_BASE}/results`);
  return res.json();
};