
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeProduct } from './services/geminiService';
import { MarketResearchResponse } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import AdminDashboard from './components/AdminDashboard';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type UserTier = 'guest' | 'free' | 'pro_basic' | 'pro_premium' | 'pro_exclusive' | 'admin';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  link: string;
}

const App: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState<UserTier>('guest');
  const [userName, setUserName] = useState<string>('');
  
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([
    { id: '1', title: 'Meta Ads Guide BD', description: 'Learn how to run profitable ads in Bangladesh.', link: '#' },
    { id: '2', title: 'Local Courier Integration', description: 'Connect Steadfast, Pathao, and RedX easily.', link: '#' },
    { id: '3', title: 'Sourcing Secrets', description: 'Find the best wholesale markets in Dhaka.', link: '#' },
    { id: '4', title: 'Scaling to 100 Orders/Day', description: 'Advanced strategies for e-commerce growth.', link: '#' }
  ]);
  const [apiKey, setApiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'deepseek'>('gemini');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResources = async () => {
      const path = 'appContent/resources';
      try {
        const docRef = doc(db, 'appContent', 'resources');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items) {
          setResources(docSnap.data().items);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.GET, path);
        }
        console.error("Failed to fetch resources", err);
      }
    };
    fetchResources();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserTier(data.userTier as UserTier || 'free');
            setUserName(data.name || user.displayName || 'Uddokta User');
            if (data.openaiKey) setOpenaiKey(data.openaiKey);
            if (data.deepseekKey) setDeepseekKey(data.deepseekKey);
          } else {
            // Create new user profile
            const newUserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'Uddokta User',
              userTier: 'free',
              createdAt: serverTimestamp()
            };
            await setDoc(userDocRef, newUserProfile);
            setUserTier('free');
            setUserName(newUserProfile.name);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setUserTier('guest');
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() && !imageFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            // Extract base64 part
            const base64 = result.split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(imageFile);
        imageBase64 = await base64Promise;
        mimeType = imageFile.type;
      }

      const result = await analyzeProduct(productName, imageBase64, mimeType, {
        provider: selectedProvider,
        geminiKey: apiKey,
        openaiKey: openaiKey,
        deepseekKey: deepseekKey
      });
      setAnalysis(result);

      // Save report to Firestore if user is logged in
      if (currentUser) {
        try {
          await addDoc(collection(db, 'reports'), {
            userId: currentUser.uid,
            productName: productName || 'Image Analysis',
            analysisData: JSON.stringify(result),
            createdAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Failed to save report to Firestore", err);
          // We don't throw here because the analysis was successful, we just failed to save it.
        }
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong while analyzing the product.');
    } finally {
      setIsLoading(false);
    }
  }, [productName, imageFile, selectedProvider, apiKey, openaiKey, deepseekKey]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAccount(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const saveSettings = async () => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
          openaiKey,
          deepseekKey
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      <Header 
        userTier={userTier} 
        onSignUpClick={() => setShowSignUp(true)} 
        onSettingsClick={() => setShowSettings(true)}
        onAccountClick={() => setShowAccount(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        language={language}
        toggleLanguage={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
      />
      
      <main className="flex-grow">
        {/* Search Hero Section */}
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-black mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {language === 'en' ? 'Bangladesh E-commerce ' : 'বাংলাদেশ ই-কমার্স '}
              <span className="text-emerald-600">{language === 'en' ? 'Strategy Engine' : 'স্ট্র্যাটেজি ইঞ্জিন'}</span>
            </h1>
            <p className={`text-lg mb-10 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'en' ? 'Get instant market research, consumer personas, and high-converting ad frameworks.' : 'তাৎক্ষণিক মার্কেট রিসার্চ, কাস্টমার পারসোনা এবং হাই-কনভার্টিং অ্যাড ফ্রেমওয়ার্ক পান।'}
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <i className="fas fa-search text-slate-400"></i>
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-14 pr-36 py-5 border rounded-[2rem] shadow-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-lg transition-all outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                    placeholder={language === 'en' ? "Enter product name (e.g., Organic Honey...)" : "পণ্যের নাম লিখুন (যেমন: খাঁটি মধু...)"}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || (!productName.trim() && !imageFile)}
                    className="absolute inset-y-2 right-2 px-8 bg-emerald-600 text-white font-black rounded-[1.5rem] hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200/20"
                  >
                    {isLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <><span>{language === 'en' ? 'Analyze' : 'বিশ্লেষণ করুন'}</span> <i className="fas fa-arrow-right text-xs"></i></>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-6 py-3 border font-bold rounded-2xl transition-all flex items-center gap-2 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <i className="fas fa-image text-emerald-600"></i>
                    {imageFile ? (language === 'en' ? 'Change Image' : 'ছবি পরিবর্তন করুন') : (language === 'en' ? 'Upload Product Image' : 'পণ্যের ছবি আপলোড করুন')}
                  </button>
                  
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-xl border border-slate-200" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
            
            {error && (
              <div className={`mt-4 p-4 rounded-2xl border animate-bounce ${isDarkMode ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}
          </div>
        </div>

        {!analysis && !isLoading && (
          <div className="container mx-auto px-4 py-12">
            {/* How it Works Section */}
            <section id="how-it-works" className="max-w-5xl mx-auto mb-24">
              <div className="text-center mb-12">
                <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How It Works</h2>
                <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Three simple steps to launch your product in Bangladesh.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className={`p-8 rounded-[2rem] border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 font-black">1</div>
                  <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Input Product</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Enter your product name or upload an image. Our engine understands the local context.</p>
                </div>
                <div className={`p-8 rounded-[2rem] border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 font-black">2</div>
                  <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Analysis</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>We analyze competitors, market fit, and sourcing costs specifically for the BD market.</p>
                </div>
                <div className={`p-8 rounded-[2rem] border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 font-black">3</div>
                  <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Get Strategy</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Receive ready-to-use ad copies, targeting logic, and a final verdict on profitability.</p>
                </div>
              </div>
            </section>

            {/* How to Use Section */}
            <section id="how-to-use" className="max-w-5xl mx-auto mb-24">
              <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1">
                    <h2 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How to Use the Free API</h2>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><i className="fas fa-key"></i></div>
                        <div>
                          <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1. Get Your Free Key</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Go to Google AI Studio and generate a free Gemini API key. It takes 30 seconds.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><i className="fas fa-cog"></i></div>
                        <div>
                          <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2. Open Settings</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Click the gear icon in the top right corner of this app to open the settings menu.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><i className="fas fa-paste"></i></div>
                        <div>
                          <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3. Paste & Save</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Paste your key into the Gemini API Key field. Your key is stored locally and securely.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
                      <h4 className={`text-sm font-black uppercase mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Supported Providers</h4>
                      <div className="space-y-3">
                        <div className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                          <span className="font-bold flex items-center gap-2"><i className="fas fa-sparkles text-emerald-500"></i> Gemini (Free Tier)</span>
                          <span className="text-xs font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Recommended</span>
                        </div>
                        <div className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                          <span className="font-bold flex items-center gap-2"><i className="fas fa-robot text-indigo-500"></i> ChatGPT</span>
                          <span className="text-xs font-black px-2 py-1 bg-slate-200 text-slate-700 rounded-md">BYOK</span>
                        </div>
                        <div className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                          <span className="font-bold flex items-center gap-2"><i className="fas fa-brain text-blue-500"></i> DeepSeek</span>
                          <span className="text-xs font-black px-2 py-1 bg-slate-200 text-slate-700 rounded-md">BYOK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'en' ? 'Resources for Uddoktas' : 'উদ্যোক্তাদের জন্য রিসোর্স'}
                </h2>
                <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {language === 'en' ? 'Everything you need to scale your business in Bangladesh.' : 'বাংলাদেশে আপনার ব্যবসা প্রসারিত করার জন্য প্রয়োজনীয় সবকিছু।'}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {resources.map((res, i) => (
                  <a key={res.id} href={res.link} className={`p-6 rounded-2xl border flex items-start gap-4 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-xl'}`}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                      <i className="fas fa-book-open"></i>
                    </div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{res.title}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{res.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 container mx-auto">
            <div className="relative">
              <div className={`w-24 h-24 border-8 rounded-full ${isDarkMode ? 'border-emerald-900/50' : 'border-emerald-100'}`}></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Analyzing BD Market...</h2>
              <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Scanning competitor ads and localization trends.</p>
            </div>
          </div>
        )}

        {analysis && !isLoading && (
          <AnalysisDashboard 
            analysis={analysis} 
            productName={productName || 'Uploaded Product'} 
            userTier={userTier}
            onUpgrade={(tier) => setUserTier(tier)}
            isDarkMode={isDarkMode}
            apiKeyConfig={{
              provider: selectedProvider,
              geminiKey: apiKey,
              openaiKey: openaiKey,
              deepseekKey: deepseekKey
            }}
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cog text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black">Settings</h3>
              <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Configure your API keys</p>
              {!currentUser && (
                <div className="mt-3 text-xs font-bold px-3 py-2 bg-amber-100 text-amber-800 rounded-lg inline-block">
                  <i className="fas fa-info-circle mr-1"></i> Keys are saved locally. Log in to sync.
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-black uppercase mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI Provider</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button onClick={() => setSelectedProvider('gemini')} className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedProvider === 'gemini' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>Gemini</button>
                  <button onClick={() => setSelectedProvider('openai')} className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedProvider === 'openai' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>ChatGPT</button>
                  <button onClick={() => setSelectedProvider('deepseek')} className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedProvider === 'deepseek' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>DeepSeek</button>
                </div>
              </div>

              {selectedProvider === 'gemini' && (
                <div>
                  <div className="flex justify-between items-end mb-2 ml-1">
                    <label className={`block text-xs font-black uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gemini API Key</label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                      Get Free Key <i className="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                  </div>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                    placeholder="AIzaSy..." 
                  />
                  <p className={`text-xs mt-2 ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Leave blank to use the default server key (if configured).</p>
                </div>
              )}

              {selectedProvider === 'openai' && (
                <div>
                  <div className="flex justify-between items-end mb-2 ml-1">
                    <label className={`block text-xs font-black uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>OpenAI API Key</label>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                      Get Key <i className="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                  </div>
                  <input 
                    type="password" 
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                    placeholder="sk-..." 
                  />
                </div>
              )}

              {selectedProvider === 'deepseek' && (
                <div>
                  <div className="flex justify-between items-end mb-2 ml-1">
                    <label className={`block text-xs font-black uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DeepSeek API Key</label>
                    <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                      Get Key <i className="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                  </div>
                  <input 
                    type="password" 
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                    placeholder="sk-..." 
                  />
                </div>
              )}

              <button onClick={saveSettings} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl mt-4">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal / Dashboard */}
      {showAccount && (
        <UserDashboard
          currentUser={currentUser}
          userTier={userTier}
          userName={userName}
          isDarkMode={isDarkMode}
          onClose={() => setShowAccount(false)}
          onLogout={handleLogout}
          onViewReport={(name, data) => {
            setProductName(name);
            setAnalysis(data);
          }}
          onUpgradeClick={() => {
            setShowAccount(false);
            setShowPricing(true);
          }}
          onAdminClick={() => {
            setShowAccount(false);
            setShowAdmin(true);
          }}
        />
      )}

      {/* Admin Dashboard */}
      {showAdmin && (
        <AdminDashboard 
          isDarkMode={isDarkMode}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Auth Modal */}
      {showSignUp && (
        <AuthModal 
          isDarkMode={isDarkMode} 
          onClose={() => setShowSignUp(false)} 
          onSuccess={() => setShowSignUp(false)} 
        />
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal 
          isDarkMode={isDarkMode} 
          onClose={() => setShowPricing(false)} 
          onUpgrade={(tier) => {
            // Update user tier in Firestore and state
            if (currentUser) {
              const userDocRef = doc(db, 'users', currentUser.uid);
              setDoc(userDocRef, { userTier: tier }, { merge: true });
              setUserTier(tier);
            }
            setShowPricing(false);
          }} 
        />
      )}

      <footer className={`py-12 text-center text-sm mt-20 border-t ${isDarkMode ? 'bg-slate-950 text-slate-500 border-slate-900' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center text-emerald-500">
              <i className="fas fa-brain"></i>
            </div>
            <span className="text-lg font-bold text-white">
              BD Market <span className="text-emerald-500">Genius</span>
            </span>
          </div>
          <p className="mb-4">Designed for Performance Marketers in Bangladesh.</p>
          <p className="opacity-50">&copy; 2024 BD Market Genius. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
