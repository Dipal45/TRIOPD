import { Link, Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-slate-800">TRIOPD</span>
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/assessment" className="text-slate-600 hover:text-blue-600 font-medium">Assessment</Link>
              <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium">About</Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* This is the magic part that shows your Home page content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <footer className="bg-slate-800 text-slate-300 py-6 text-center text-sm">
        <p>© 2026 TRIOPD. AI-Assisted Screening Tool. <Link to="/disclaimer" className="underline hover:text-white">Medical Disclaimer</Link></p>
      </footer>
    </div>
  );
}