import { Link } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';

export default function Assessment() {
  const hw = sessionStorage.getItem('hw_result');
  const gait = sessionStorage.getItem('gait_result');
  const voice = sessionStorage.getItem('voice_result');

  const steps = [
    { name: 'Handwriting Test', path: '/assessment/handwriting', done: !!hw },
    { name: 'Walking Test', path: '/assessment/walking', done: !!gait },
    { name: 'Voice Test', path: '/assessment/voice', done: !!voice },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Assessment Progress</h2>
      <div className="space-y-4 mb-8">
        {steps.map((step, i) => (
          <Link key={i} to={step.path} className="flex items-center p-4 bg-white rounded-lg shadow border border-slate-200 hover:border-blue-400 transition">
            {step.done ? <CheckCircle className="w-6 h-6 text-green-500 mr-4" /> : <Circle className="w-6 h-6 text-slate-400 mr-4" />}
            <span className="font-semibold text-lg">{step.name}</span>
            <span className="ml-auto text-sm text-slate-500">{step.done ? 'Completed' : 'Click to start'}</span>
          </Link>
        ))}
      </div>
      {hw && gait && voice && (
        <Link to="/results" className="block w-full text-center px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
          View Final Results
        </Link>
      )}
    </div>
  );
}