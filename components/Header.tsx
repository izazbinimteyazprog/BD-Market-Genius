
import React from 'react';
import { UserTier } from '../App';

interface Props {
  userTier: UserTier;
  onSignUpClick: () => void;
  onSettingsClick: () => void;
  onAccountClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: 'en' | 'bn';
  toggleLanguage: () => void;
}

const Header: React.FC<Props> = ({ userTier, onSignUpClick, onSettingsClick, onAccountClick, isDarkMode, toggleDarkMode, language, toggleLanguage }) => {
  const isGuest = userTier === 'guest';
  const isPro = userTier.startsWith('pro_');
  const isAdmin = userTier === 'admin';

  return (
    <header className={`backdrop-blur-lg border-b sticky top-0 z-[60] h-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/20 rotate-3">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <span className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            BD Market <span className="text-emerald-600">Genius</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className={`hidden lg:flex items-center space-x-8 text-[13px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <a href="#" className="hover:text-emerald-600 transition-colors">{language === 'en' ? 'How it works' : 'কিভাবে কাজ করে'}</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">{language === 'en' ? 'Resources' : 'রিসোর্স'}</a>
          </nav>

          <div className={`flex items-center gap-4 border-l pl-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button 
              onClick={toggleLanguage}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {language === 'en' ? 'BN' : 'EN'}
            </button>
            <button 
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button 
              onClick={onSettingsClick}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <i className="fas fa-cog"></i>
            </button>
            {isGuest ? (
              <>
                <button onClick={onSignUpClick} className={`hidden sm:block text-sm font-black hover:text-emerald-600 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Login</button>
                <button 
                  onClick={onSignUpClick}
                  className={`px-6 py-3 text-white text-sm font-black rounded-2xl transition-all shadow-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 shadow-slate-900/50' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                >
                  Sign Up Free
                </button>
              </>
            ) : (
              <button 
                onClick={onAccountClick}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all hover:scale-105 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}
              >
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                  {isPro ? <i className="fas fa-crown"></i> : <i className="fas fa-user"></i>}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">My Account</p>
                  <p className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {isPro ? userTier.replace('pro_', '') : 'Free Plan'}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
