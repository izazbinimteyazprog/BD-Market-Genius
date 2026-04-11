import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

interface AuthModalProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMethod = 'select' | 'email' | 'phone';
type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ isDarkMode, onClose, onSuccess }) => {
  const [method, setMethod] = useState<AuthMethod>('select');
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (method === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [method]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: Name is not automatically saved to profile here, but can be added via updateProfile
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Email auth error:", err);
      setError(err.message || "Failed to authenticate with email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+880${phoneNumber.replace(/^0+/, '')}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      console.error("Phone auth error:", err);
      setError(err.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError('');
    setIsLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      onSuccess();
    } catch (err: any) {
      console.error("Code verification error:", err);
      setError("Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-circle text-2xl"></i>
          </div>
          <h3 className="text-2xl font-black">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
          <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {mode === 'login' ? 'Sign in to your account' : 'Sign up to access strategy reports'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-100 text-rose-700 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {method === 'select' && (
          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-black rounded-2xl transition-all border-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            
            <button 
              onClick={() => setMethod('email')}
              disabled={isLoading}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-black rounded-2xl transition-all border-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <i className="fas fa-envelope text-lg"></i>
              Continue with Email
            </button>

            <button 
              onClick={() => setMethod('phone')}
              disabled={isLoading}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 font-black rounded-2xl transition-all border-2 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <i className="fas fa-phone text-lg"></i>
              Continue with Phone
            </button>
          </div>
        )}

        {method === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="Uddokta Name" />
              </div>
            )}
            <div>
              <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="email@example.com" />
            </div>
            <div>
              <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className={`w-full py-5 text-white font-black rounded-2xl transition-all shadow-xl mt-4 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
        )}

        {method === 'phone' && (
          <div className="space-y-4">
            <div id="recaptcha-container"></div>
            {!confirmationResult ? (
              <form onSubmit={handleSendPhoneCode}>
                <div>
                  <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number</label>
                  <input required type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="017XXXXXXXX" />
                </div>
                <button type="submit" disabled={isLoading} className={`w-full py-5 text-white font-black rounded-2xl transition-all shadow-xl mt-4 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {isLoading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneCode}>
                <div>
                  <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Verification Code</label>
                  <input required type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} placeholder="123456" />
                </div>
                <button type="submit" disabled={isLoading} className={`w-full py-5 text-white font-black rounded-2xl transition-all shadow-xl mt-4 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 text-center space-y-4">
          {method !== 'select' && (
            <button onClick={() => { setMethod('select'); setError(''); }} className={`text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <i className="fas fa-arrow-left mr-2"></i> Back to options
            </button>
          )}
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMethod('select'); setError(''); }} className="text-emerald-500 hover:text-emerald-600">
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>

          <button onClick={onClose} className={`w-full py-3 font-bold ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
