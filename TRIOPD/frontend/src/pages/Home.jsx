import { Link } from 'react-router-dom';
import { Pencil, Footprints, Mic } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">TRIOPD</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Multimodal AI-Assisted Parkinson's Risk & Severity Assessment</p>
        <Link to="/assessment" className="inline-block mt-6 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg">
          Start Assessment
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Pencil, title: "Handwriting Analysis", desc: "Interactive tracing to detect micro-movement anomalies and tremor patterns." },
          { icon: Footprints, title: "Walking/Gait Analysis", desc: "Computer vision pose estimation to evaluate stride, symmetry, and arm swing." },
          { icon: Mic, title: "Voice Analysis", desc: "Acoustic feature extraction to identify vocal cord irregularities and jitter." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow border border-slate-200 text-center">
            <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="font-bold text-blue-800 mb-2">Medical Disclaimer</h3>
        <p className="text-blue-700 text-sm">
          TRIOPD is an AI-assisted screening/research tool and is <strong>not a medical diagnosis</strong>. 
          Results should not be used as a substitute for evaluation by a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}