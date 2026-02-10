
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <i className="fas fa-brain"></i>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            BD Market <span className="text-emerald-600">Genius</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-emerald-600 transition-colors">How it works</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Resources</a>
          <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
            Saved Reports
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
