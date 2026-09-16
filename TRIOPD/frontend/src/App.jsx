import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your page components
import HandwritingTest from './pages/HandwritingTest';
import VoiceTest from './pages/VoiceTest';
import WalkingTest from './pages/WalkingTest';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-300 transition">
              TRIOPD
            </Link>
            <div className="flex flex-wrap gap-6 text-sm font-medium">
              <Link to="/" className="hover:text-blue-300 transition py-2">Home</Link>
              <Link to="/assessment/handwriting" className="hover:text-blue-300 transition py-2">Handwriting</Link>
              <Link to="/assessment/voice" className="hover:text-blue-300 transition py-2">Voice</Link>
              <Link to="/assessment/walking" className="hover:text-blue-300 transition py-2">Walking</Link>
              <Link to="/results" className="hover:text-blue-300 transition py-2">Results</Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow w-full">
          <Routes>
            
            {/* HOME PAGE WITH NEW SPECIFIC IMAGES */}
            <Route path="/" element={
              <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                  <div className="relative max-w-4xl mx-auto text-center z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Welcome to TRIOPD</h1>
                    <p className="text-xl md:text-2xl text-blue-200 mb-8 font-light">AI-Assisted Parkinson's Disease Screening Tool</p>
                    <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                      Our advanced multi-modal system analyzes handwriting, voice, and gait patterns using machine learning to provide early detection and risk assessment for Parkinson's Disease.
                    </p>
                  </div>
                </div>

                {/* Test Cards Section */}
                <div className="max-w-7xl mx-auto px-6 py-16 -mt-16 relative z-20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Handwriting Card - NEW SPIRAL DRAWING IMAGE */}
                    <div 
                      onClick={() => window.location.href='/assessment/handwriting'}
                      className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800" 
                          alt="Hand drawing spiral pattern for PD screening" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white font-bold text-lg flex items-center gap-2">
                          ✏️ Handwriting Analysis
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Spiral Drawing Test</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          Trace a spiral pattern to detect micro-graphia, tremor, and bradykinesia. Analyzes fine motor control deficits characteristic of early-stage PD.
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold text-sm">
                          Start Test <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Voice Card - NEW MICROPHONE RECORDING IMAGE */}
                    <div 
                      onClick={() => window.location.href='/assessment/voice'}
                      className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800" 
                          alt="Person speaking into microphone for voice analysis" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white font-bold text-lg flex items-center gap-2">
                           Voice Analysis
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Speech Pattern Test</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          Record sustained "ahhh" phonation to detect jitter, shimmer, and hypophonia. Identifies vocal cord stiffness and speech motor impairment.
                        </p>
                        <div className="flex items-center text-green-600 font-semibold text-sm">
                          Start Test <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>

                    {/* Walking Card - NEW ELDERLY WALKING SIDE-VIEW IMAGE */}
                    <div 
                      onClick={() => window.location.href='/assessment/walking'}
                      className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800" 
                          alt="Side profile of elderly person walking for gait analysis" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white font-bold text-lg flex items-center gap-2">
                          🚶 Gait Analysis
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Walking Pattern Test</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          Record side-view walking video to analyze stride length, cadence, arm swing, and shuffling. Detects postural instability and freezing of gait.
                        </p>
                        <div className="flex items-center text-purple-600 font-semibold text-sm">
                          Start Test <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Info Section */}
                  <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Multi-Modal Screening?</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          Parkinson's Disease affects multiple motor systems simultaneously. By combining three independent analyses, TRIOPD achieves higher diagnostic accuracy than single-modality tests.
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Early detection of subtle symptoms</li>
                          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Non-invasive and cost-effective</li>
                          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Comprehensive risk assessment</li>
                        </ul>
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-xl p-6">
                        <h3 className="font-bold text-blue-800 mb-2">How It Works</h3>
                        <ol className="space-y-3 text-sm text-blue-700">
                          <li className="flex gap-3"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> Complete all three motor tests</li>
                          <li className="flex gap-3"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> AI models analyze each modality</li>
                          <li className="flex gap-3"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> Receive comprehensive risk report</li>
                          <li className="flex gap-3"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> Download PDF for clinical review</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            {/* Existing Test Routes */}
            <Route path="/assessment/handwriting" element={<HandwritingTest />} />
            <Route path="/assessment/voice" element={<VoiceTest />} />
            <Route path="/assessment/walking" element={<WalkingTest />} />
            <Route path="/results" element={<Results />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;