
import React, { useState } from 'react';
import { MarketResearchResponse, ContentPiece, AdVariation, CompetitorAd } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { generateImageForContent, ApiKeyConfig } from '../services/geminiService';
import { UserTier } from '../App';

interface Props {
  analysis: MarketResearchResponse;
  productName: string;
  userTier: UserTier;
  onUpgrade: (tier: UserTier) => void;
  isDarkMode: boolean;
  apiKeyConfig: ApiKeyConfig;
}

type TabType = 'strategy' | 'market' | 'competitors' | 'ads' | 'fb_ads';

const AnalysisDashboard: React.FC<Props> = ({ analysis, productName, userTier, onUpgrade, isDarkMode, apiKeyConfig }) => {
  const [activeTab, setActiveTab] = useState<TabType>('strategy');
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [localAnalysis, setLocalAnalysis] = useState<MarketResearchResponse>(analysis);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [activeAdStage, setActiveAdStage] = useState<'top_of_funnel' | 'middle_of_funnel' | 'bottom_of_funnel' | 'retention'>('top_of_funnel');

  const [isFbConnected, setIsFbConnected] = useState(false);
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [fbToken, setFbToken] = useState('');
  const [fbAccountId, setFbAccountId] = useState('');
  const [fbError, setFbError] = useState('');

  const handleConnectFb = () => {
    if (fbToken && fbAccountId) {
      setIsFbConnected(true);
      setIsConnectingFb(false);
      setFbError('');
    } else {
      setFbError("Please enter both Access Token and Ad Account ID.");
    }
  };

  const pmf = localAnalysis?.product_market_fit;
  const comp = localAnalysis?.competition_analysis;
  const compRes = localAnalysis?.competitor_research;
  const avatars = localAnalysis?.customer_avatars || [];
  const copies = localAnalysis?.ad_copies || {};
  const decision = localAnalysis?.final_decision;
  const sourcing = localAnalysis?.sourcing_information;

  const isGuest = userTier === 'guest';
  const isFree = userTier === 'free';
  const isPro = userTier.startsWith('pro_');

  const tabs = [
    { id: 'strategy' as TabType, label: 'Full Strategy', icon: 'fa-chess', color: 'bg-slate-900' },
    { id: 'market' as TabType, label: 'Market Research', icon: 'fa-microscope', color: 'bg-indigo-600' },
    { id: 'competitors' as TabType, label: 'Competitors', icon: 'fa-eye', color: 'bg-rose-600' },
    { id: 'ads' as TabType, label: 'Ad Funnel', icon: 'fa-bullhorn', color: 'bg-emerald-600' },
    { id: 'fb_ads' as TabType, label: 'Facebook Ads', icon: 'fa-facebook', color: 'bg-blue-600' },
  ];

  const handleGenerateImage = async (id: string, prompt: string, category: keyof typeof copies) => {
    setGeneratingImages(prev => ({ ...prev, [id]: true }));
    try {
      const url = await generateImageForContent(prompt, apiKeyConfig);
      setLocalAnalysis(prev => {
        const newCopies = { ...prev.ad_copies };
        const audience = [...newCopies[category]];
        const index = audience.findIndex(p => p.id === id);
        if (index !== -1) {
          audience[index] = { ...audience[index], generatedImageUrl: url };
        }
        newCopies[category] = audience;
        return { ...prev, ad_copies: newCopies };
      });
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const PricingSection = () => (
    <div className={`rounded-[4rem] p-12 lg:p-20 mt-12 mb-20 shadow-3xl ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'}`}>
      <div className="text-center mb-16">
        <h3 className="text-4xl font-black mb-4">Upgrade to Pro</h3>
        <p className="text-slate-400 font-bold max-w-xl mx-auto">Get full access to competitor tracking, budget planning, and exclusive business insights.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'pro_basic' as UserTier, name: 'Basic', price: '৳৯৯৯', icon: 'fa-seedling', features: ['Competitor Ads', 'Basic Market Research', 'Standard Copies'] },
          { id: 'pro_premium' as UserTier, name: 'Premium', price: '৳২৪৯৯', icon: 'fa-gem', features: ['All Basic features', 'Full Competitor Data', 'Budget Allocation', 'AI Image Gen'], popular: true },
          { id: 'pro_exclusive' as UserTier, name: 'Exclusive', price: '৳৪৯৯৯', icon: 'fa-crown', features: ['All Premium features', '1-on-1 Consultation', 'Secret Success Tips', 'Priority Support'] },
        ].map((pkg) => (
          <div key={pkg.id} className={`p-10 rounded-[3rem] border-2 transition-all relative ${pkg.popular ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-2xl z-10' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
            {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-6 py-1 rounded-full text-[10px] font-black uppercase">Most Popular</span>}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <i className={`fas ${pkg.icon} text-2xl`}></i>
              </div>
              <h4 className="text-2xl font-black mb-2">{pkg.name}</h4>
              <p className="text-4xl font-black">{pkg.price}</p>
              <p className="text-xs font-bold text-slate-400 mt-2">Lifetime Access</p>
            </div>
            <ul className="space-y-4 mb-10">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-80">
                  <i className="fas fa-check-circle text-emerald-400"></i> {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onUpgrade(pkg.id)}
              className={`w-full py-5 rounded-[1.5rem] font-black transition-all ${pkg.popular ? 'bg-white text-indigo-600 hover:bg-slate-50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
            >
              Choose {pkg.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const PremiumLock: React.FC<{ title: string; proOnly?: boolean; children: React.ReactNode }> = ({ children, title, proOnly = false }) => {
    // If Guest -> must sign up.
    // If Free -> can see Free features (Strategy/Success).
    // If Pro -> can see everything.
    
    // Gating logic:
    const isFreeSection = title === "VERDICT_HERO" || title === "SUCCESS_FACTORS";
    const canSee = isPro || (isFree && isFreeSection);

    if (canSee) return <>{children}</>;

    return (
      <div className="relative group mb-12">
        <div className="filter blur-md select-none pointer-events-none opacity-40 overflow-hidden max-h-96">
          {children}
        </div>
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-10 backdrop-blur-[4px] rounded-[3.5rem] border transition-all shadow-sm ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/40 border-white/50'}`}>
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-950 text-white'}`}>
            <i className={`fas ${isGuest ? 'fa-user-lock' : 'fa-lock'} text-2xl`}></i>
          </div>
          <h4 className={`text-2xl font-black mb-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
            {isGuest ? 'Sign Up to Unlock Strategy' : 'Upgrade to Pro'}
          </h4>
          <p className={`text-base font-bold mb-8 text-center max-w-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {isGuest 
              ? 'ব্যবসায়িক পর্যালোচনা ও পূর্ণাঙ্গ স্ট্র্যাটেজি দেখতে ফ্রিতে সাইন আপ করুন।' 
              : 'মার্কেট কম্পিটিশন, বাজেট বণ্টন এবং সিক্রেট টিপস দেখতে প্রিমিয়াম মেম্বার হোন।'}
          </p>
          {isGuest ? (
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-10 py-5 bg-emerald-600 text-white font-black rounded-[1.5rem] hover:bg-emerald-700 transition-all shadow-2xl">
              Sign Up Now (Free)
            </button>
          ) : (
            <button onClick={() => { setActiveTab('strategy'); setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className={`px-10 py-5 font-black rounded-[1.5rem] transition-all shadow-2xl ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              Upgrade Account
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContentPiece = (piece: ContentPiece, colorClass: string, category: keyof typeof copies) => (
    <div key={piece.id} className={`rounded-[3rem] p-8 md:p-12 shadow-xl border mb-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-lg`}>
              <i className="fas fa-lightbulb text-xl"></i>
            </div>
            <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{piece.title}</h4>
          </div>
          
          <div className="mb-8">
            <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Psychology</p>
            <p className={`font-medium leading-relaxed p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>{piece.connection_psychology}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hooks</p>
              <ul className="space-y-3">
                {(piece.hooks || []).map((hook, i) => (
                  <li key={i} className={`flex items-start gap-3 p-4 rounded-xl font-medium ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-900'}`}>
                    <i className="fas fa-quote-left text-emerald-400 mt-1"></i> {hook}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Visual Ideas</p>
              <ul className="space-y-3">
                {(piece.ideas || []).map((idea, i) => (
                  <li key={i} className={`flex items-start gap-3 p-4 rounded-xl font-medium ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-900'}`}>
                    <i className="fas fa-camera text-indigo-400 mt-1"></i> {idea}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className={`text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ad Variations</p>
            <div className="space-y-4">
              {(piece.variations || []).map((v, i) => (
                <div key={i} className={`p-6 border-2 rounded-2xl transition-colors relative group ${isDarkMode ? 'border-slate-800 hover:border-indigo-500/50' : 'border-slate-100 hover:border-indigo-200'}`}>
                  <button 
                    onClick={() => handleCopy(`${v.headline}\n\n${v.hook}\n\n${v.body}\n\n${v.cta}`, `copy-${piece.id}-${i}`)}
                    className={`absolute top-4 right-4 w-10 h-10 border rounded-xl flex items-center justify-center shadow-sm transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'}`}
                  >
                    {copyFeedback === `copy-${piece.id}-${i}` ? <i className="fas fa-check text-emerald-500"></i> : <i className="far fa-copy"></i>}
                  </button>
                  <p className={`font-black text-lg mb-2 pr-12 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{v.headline}</p>
                  <p className={`font-bold mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{v.hook}</p>
                  <p className={`mb-4 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{v.body}</p>
                  <p className={`font-black inline-block px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}>{v.cta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Format</p>
            <p className="font-black text-lg">{piece.recommended_format}</p>
          </div>
          
          <div className={`border rounded-[2rem] p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            {piece.generatedImageUrl ? (
              <img src={piece.generatedImageUrl} alt="Generated Ad Visual" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <i className={`fas fa-image text-4xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}></i>
                <p className={`font-bold text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Generate AI Visual for this ad concept</p>
                <button 
                  onClick={() => handleGenerateImage(piece.id, piece.ideas[0] || piece.title, category)}
                  disabled={generatingImages[piece.id] || !isPro}
                  className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all w-full flex items-center justify-center gap-2"
                >
                  {generatingImages[piece.id] ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                  {isPro ? 'Generate Image' : 'Pro Feature'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetitorAd = (ad: CompetitorAd, index: number) => (
    <div key={index} className={`rounded-[2.5rem] p-8 shadow-xl border flex flex-col md:flex-row gap-8 items-center group hover:shadow-2xl transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg shrink-0 transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
        <i className={`fab fa-${ad.platform.toLowerCase()}`}></i>
      </div>
      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
          <div>
            <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ad.brand_name}</h4>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{ad.ad_type} • {ad.estimated_duration}</p>
          </div>
          <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border shrink-0 ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {ad.performance_score}/10 Performance
          </div>
        </div>
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
           <p className={`text-sm font-bold leading-relaxed italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{ad.strategy_insight}"</p>
        </div>
      </div>
    </div>
  );

  const renderStrategyTab = () => {
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const pieData = (decision?.marketing_channels || []).map(c => ({ name: c.channel, value: c.allocation_percentage }));

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* FREE: Verdict Hero Banner */}
        <PremiumLock title="VERDICT_HERO">
          <section className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-12 lg:p-20 shadow-3xl">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
              <i className="fas fa-chess-king text-[20rem] transform translate-x-20 translate-y-20"></i>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className={`shrink-0 w-72 h-72 rounded-[4.5rem] rotate-3 flex flex-col items-center justify-center border-4 border-white/20 shadow-2xl backdrop-blur-sm ${decision?.verdict === 'YES' ? 'bg-emerald-500/90' : 'bg-rose-500/90'}`}>
                <div className="-rotate-3 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 mb-3">Strategy Verdict</span>
                  <span className="text-9xl font-black tracking-tighter">{decision?.verdict || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex-grow max-w-full lg:max-w-4xl">
                <h2 className="text-3xl lg:text-5xl font-black mb-10 leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">ব্যবসায়িক পর্যালোচনা ও <br/> <span className="text-emerald-400">পূর্ণাঙ্গ স্ট্র্যাটেজি</span></h2>
                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
                  <p className="text-xl lg:text-2xl font-bold italic text-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                    "{decision?.decision_reasoning || 'No reasoning provided.'}"
                  </p>
                </div>
              </div>
            </div>

             <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg"><i className="fas fa-chart-line text-2xl"></i></div>
                    <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">Niche Potential</p>
                  </div>
                  <p className="text-sm text-slate-300 font-bold leading-relaxed mb-6">{decision?.niche_potential_description || 'N/A'}</p>
                  <div className="text-4xl font-black text-white uppercase tracking-tighter">খুব ভালো</div>
                </div>
 
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg"><i className="fas fa-bullseye text-2xl"></i></div>
                    <p className="text-xs font-black uppercase text-blue-400 tracking-widest">Market Fit Score</p>
                  </div>
                  <p className="text-sm text-slate-300 font-bold leading-relaxed mb-6">{decision?.market_fit_detailed_reason || 'N/A'}</p>
                  <div className="text-5xl font-black text-white">{pmf?.market_fit_score || 0}<span className="text-2xl opacity-40 ml-2">/ 10</span></div>
                </div>
 
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg"><i className="fas fa-wallet text-2xl"></i></div>
                    <p className="text-xs font-black uppercase text-amber-400 tracking-widest">Starting Budget</p>
                  </div>
                  <p className="text-sm text-slate-300 font-bold leading-relaxed mb-6">{decision?.budget_breakdown_detail || 'N/A'}</p>
                  <div className="text-4xl font-black text-white tracking-tighter">৳{decision?.starting_budget_bdt?.toLocaleString() || '0'}</div>
                </div>
             </div>
          </section>
        </PremiumLock>

        {/* FREE: Success Factors */}
        <PremiumLock title="SUCCESS_FACTORS">
          <div className={`rounded-[3.5rem] p-12 lg:p-16 shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-3xl font-black mb-12 flex items-center gap-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100/20"><i className="fas fa-sliders-h text-xl"></i></div>
              মূল সফলতার নিয়ামকসমূহ (Success Factors)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {(decision?.decision_factors || []).map((f, i) => (
                <div key={i} className="space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-4 text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                       <div className={`w-4 h-4 rounded-full shadow-inner ${f.impact === 'Positive' ? 'bg-emerald-500' : f.impact === 'Negative' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                       {f.factor}
                    </span>
                    <span className={`text-lg font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{f.score}%</span>
                  </div>
                  <div className={`h-4 rounded-full overflow-hidden p-1 shadow-inner relative ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${f.impact === 'Positive' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : f.impact === 'Negative' ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-slate-400'}`} style={{ width: `${f.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumLock>

        {/* PRO GATED: Sourcing Info */}
        <PremiumLock title="সোর্সিং ইনফরমেশন">
          <div className={`rounded-[3.5rem] p-12 lg:p-16 shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-3xl font-black mb-12 flex items-center gap-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-100/20"><i className="fas fa-box-open text-xl"></i></div>
              সোর্সিং ইনফরমেশন (Sourcing Info)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className={`p-8 rounded-[2.5rem] border text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">আনুমানিক খরচ</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sourcing?.estimated_cost_bdt || 'N/A'}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] border text-center md:col-span-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">সম্ভাব্য সোর্সিং স্থান</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {sourcing?.potential_suppliers?.map((supplier, i) => (
                    <span key={i} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>{supplier}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">সোর্সিং স্ট্র্যাটেজি</p>
              <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sourcing?.sourcing_strategy || 'N/A'}</p>
            </div>
          </div>
        </PremiumLock>

        {/* PRO GATED: Competition */}
        <PremiumLock title="মার্কেট কম্পিটিশন স্ট্যাটাস">
          <div className={`rounded-[3.5rem] p-12 lg:p-16 shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-3xl font-black mb-12 flex items-center gap-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <div className="w-16 h-16 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-100/20"><i className="fas fa-shield-alt text-xl"></i></div>
              মার্কেট কম্পিটিশন স্ট্যাটাস
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { label: 'প্রতিযোগিতার ধরন', val: comp?.competition_type || 'N/A' },
                { label: 'প্রাইস লেভেল', val: comp?.price_range_bdt ? `৳${comp.price_range_bdt}` : 'N/A' },
                { label: 'এন্ট্রি লেভেল', val: comp?.entry_difficulty || 'N/A' },
                { label: 'গড় চাহিদা', val: pmf?.urgency_level || 'N/A' }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border text-center transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:shadow-xl' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{item.label}</p>
                  <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </PremiumLock>

        <PremiumLock title="বাজেট ও চ্যানেল বণ্টন">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className={`rounded-[3.5rem] p-12 shadow-xl border lg:col-span-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-2xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>বাজেট বণ্টন</h3>
              <div className="h-64 mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={10} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {(decision?.marketing_channels || []).map((c, i) => (
                  <div key={i} className={`flex flex-col gap-2 p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}>
                    <div className="flex items-center justify-between font-black text-xs">
                      <span className={`flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div> {c.channel}</span>
                      <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>{c.allocation_percentage}%</span>
                    </div>
                    <p className={`text-[10px] font-bold italic leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>"{c.reason}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-950 rounded-[3.5rem] p-16 text-white shadow-2xl lg:col-span-2 relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
              <h3 className="text-3xl font-black mb-12 flex items-center gap-6">
                 <div className="w-16 h-16 bg-white/10 text-white rounded-[2rem] flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md">
                    <i className="fas fa-graduation-cap text-xl"></i>
                 </div>
                 সফল উদ্যোক্তা হওয়ার সিক্রেট টিপস
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
                {(decision?.entrepreneur_advice || []).map((advice, i) => (
                  <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black mb-6 shadow-xl group-hover:scale-110 transition-transform">{i+1}</div>
                    <p className="text-lg font-bold leading-relaxed text-slate-200 italic">"{advice}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PremiumLock>

        <PremiumLock title="মার্কেট লিডার কম্পিটিটর">
          <div className={`rounded-[3.5rem] p-16 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="text-center mb-16">
              <h3 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>মার্কেট লিডার লিষ্ট (Top Competitors)</h3>
              <p className={`font-bold text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>এই ব্র্যান্ডগুলো বর্তমানে মার্কেটে ভালো করছে। আপনি আলাদাভাবে এদের রিসার্চ করতে পারেন।</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
              {(compRes?.top_competitors || []).map((brand, i) => (
                <div key={i} className={`p-10 rounded-[3rem] border flex flex-col items-center justify-center text-center group transition-all duration-500 transform hover:-translate-y-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:shadow-2xl' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
                  <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl flex items-center justify-center mb-8 text-white font-black text-4xl shadow-indigo-100/20">
                    {brand.name?.charAt(0) || '?'}
                  </div>
                  <p className={`text-xl font-black mb-6 break-words w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{brand.name || 'Unknown'}</p>
                  <div className="flex gap-4 items-center">
                     {brand.active_platforms?.includes('facebook') && <i className="fab fa-facebook text-slate-400 group-hover:text-blue-500 transition-colors"></i>}
                     {brand.active_platforms?.includes('instagram') && <i className="fab fa-instagram text-slate-400 group-hover:text-pink-500 transition-colors"></i>}
                     {brand.active_platforms?.includes('youtube') && <i className="fab fa-youtube text-slate-400 group-hover:text-red-500 transition-colors"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumLock>

        {/* Pricing for Non-Pro users */}
        {!isPro && <div id="pricing"><PricingSection /></div>}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy': return renderStrategyTab();
      case 'market':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className={`rounded-[3.5rem] p-12 shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-3xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>মার্কেট ফিট রিসার্চ</h3>
                <div className="space-y-10">
                  <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}><p className={`text-[10px] font-black mb-3 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>প্রধান সমস্যা</p><p className={`font-black text-2xl leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pmf?.core_problem || 'N/A'}</p></div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className={`p-8 border rounded-[2.5rem] text-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}><p className={`text-[10px] font-black mb-3 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>জরুরিতা</p><p className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pmf?.urgency_level || 'N/A'}</p></div>
                    <div className={`p-8 border rounded-[2.5rem] text-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}><p className={`text-[10px] font-black mb-3 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>চাহিদা</p><p className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pmf?.demand_type || 'N/A'}</p></div>
                  </div>
                </div>
              </div>
              <div className={`rounded-[3.5rem] p-12 shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-3xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>চ্যানেল স্যাচুরেশন</h3>
                <div className="h-72 mb-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'FB/IG', value: comp?.ad_saturation?.facebook_instagram || 0 },
                      { name: 'Google', value: comp?.ad_saturation?.google_ads || 0 },
                      { name: 'Markets', value: comp?.ad_saturation?.marketplaces || 0 },
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 14, fontWeight: 900, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                      <Bar dataKey="value" radius={[0, 15, 15, 0]} barSize={40}>
                        <Cell fill="#10b981" /><Cell fill="#3b82f6" /><Cell fill="#f59e0b" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      case 'competitors':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <PremiumLock title="মার্কেট লিডার কম্পিটিটর">
              <div className={`rounded-[3.5rem] p-16 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="text-center mb-16">
                  <h3 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>মার্কেট লিডার লিষ্ট (Top Competitors)</h3>
                  <p className={`font-bold text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>এই ব্র্যান্ডগুলো বর্তমানে মার্কেটে ভালো করছে। আপনি আলাদাভাবে এদের রিসার্চ করতে পারেন।</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {(compRes?.top_competitors || []).map((brand, i) => (
                    <div key={i} className={`p-10 rounded-[3rem] border flex flex-col items-center justify-center text-center group transition-all duration-500 transform hover:-translate-y-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:shadow-2xl' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
                      <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-xl flex items-center justify-center mb-8 text-white font-black text-4xl shadow-indigo-100/20">
                        {brand.name?.charAt(0) || '?'}
                      </div>
                      <p className={`text-xl font-black mb-4 break-words w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{brand.name || 'Unknown'}</p>
                      <div className={`px-4 py-2 rounded-xl border mb-6 w-full ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Sales Volume</p>
                        <p className="text-sm font-bold text-emerald-600">{brand.estimated_sales_volume || 'N/A'}</p>
                      </div>
                      <div className="flex gap-4 items-center">
                         {brand.active_platforms?.includes('facebook') && <i className="fab fa-facebook text-slate-400 group-hover:text-blue-500 transition-colors text-xl"></i>}
                         {brand.active_platforms?.includes('instagram') && <i className="fab fa-instagram text-slate-400 group-hover:text-pink-500 transition-colors text-xl"></i>}
                         {brand.active_platforms?.includes('youtube') && <i className="fab fa-youtube text-slate-400 group-hover:text-red-500 transition-colors text-xl"></i>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumLock>

             <div className="max-w-4xl mx-auto mb-16 text-center">
              <h3 className={`text-5xl font-black mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>লাইভ প্রতিযোগী রিসার্চ</h3>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>মার্কেটের অন্যান্য ব্র্যান্ডগুলো বর্তমানে কী ধরণের অ্যাড চালাচ্ছে তা এখানে দেখুন।</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               <div className="lg:col-span-2 space-y-10">
                  {(compRes?.live_ad_trends || []).map((ad, i) => renderCompetitorAd(ad, i))}
               </div>
               <div className="space-y-10">
                  <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl">
                    <h4 className="text-2xl font-black mb-10 flex items-center gap-4">Winning Elements</h4>
                    {(compRes?.winning_creative_elements || []).map((el, i) => (
                      <div key={i} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all mb-4">
                        <i className="fas fa-check-circle text-emerald-400 text-sm"></i><p className="text-base font-bold">{el}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        );

      case 'ads':
        const stages = [
          { id: 'top_of_funnel', label: 'Top of Funnel (Cold)', color: 'bg-indigo-600' },
          { id: 'middle_of_funnel', label: 'Middle of Funnel (Warm)', color: 'bg-orange-600' },
          { id: 'bottom_of_funnel', label: 'Bottom of Funnel (Hot)', color: 'bg-rose-600' },
          { id: 'retention', label: 'Retention', color: 'bg-pink-600' }
        ] as const;

        const currentStage = stages.find(s => s.id === activeAdStage)!;

        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveAdStage(stage.id)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${
                    activeAdStage === stage.id
                      ? `${stage.color} text-white shadow-lg`
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            <div className="space-y-10">
              {copies[activeAdStage]?.map((piece) => renderContentPiece(piece, currentStage.color, activeAdStage))}
            </div>
          </div>
        );
      case 'fb_ads':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <PremiumLock title="Facebook Ads Integration">
              {!isFbConnected ? (
                <div className={`rounded-[3.5rem] p-12 lg:p-16 shadow-xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl shadow-blue-600/20 mx-auto mb-8">
                    <i className="fab fa-facebook-f"></i>
                  </div>
                  <h3 className={`text-4xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Facebook Ads Integration</h3>
                  <p className={`text-xl font-bold max-w-2xl mx-auto mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Connect your Facebook Ad Account to analyze live campaigns, track ROAS, and get AI-driven optimization suggestions directly within BD Market Genius.
                  </p>
                  
                  {isConnectingFb ? (
                    <div className="max-w-md mx-auto space-y-6 text-left">
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Facebook Access Token</label>
                        <input 
                          type="password" 
                          value={fbToken}
                          onChange={(e) => setFbToken(e.target.value)}
                          placeholder="EAA..."
                          className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Ad Account ID</label>
                        <input 
                          type="text" 
                          value={fbAccountId}
                          onChange={(e) => setFbAccountId(e.target.value)}
                          placeholder="act_123456789"
                          className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                        />
                      </div>
                      {fbError && <p className="text-rose-500 text-sm font-bold">{fbError}</p>}
                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setIsConnectingFb(false)}
                          className={`flex-1 py-4 font-black rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleConnectFb}
                          className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsConnectingFb(true)}
                      className="px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-4 mx-auto"
                    >
                      <i className="fab fa-facebook"></i> Connect Facebook Account
                    </button>
                  )}
                  
                  <p className={`text-sm font-bold mt-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    * Requires Pro Exclusive Tier
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className={`p-8 rounded-[3rem] shadow-xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-600/20">
                        <i className="fab fa-facebook-f"></i>
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ad Account Connected</h4>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ID: {fbAccountId}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsFbConnected(false)}
                      className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-rose-400 hover:bg-slate-700' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Total Spend', value: '৳ ৪৫,০০০', icon: 'fa-money-bill-wave', color: 'text-emerald-500' },
                      { label: 'Impressions', value: '১.২M', icon: 'fa-eye', color: 'text-blue-500' },
                      { label: 'Avg. ROAS', value: '3.2x', icon: 'fa-chart-line', color: 'text-indigo-500' }
                    ].map((stat, i) => (
                      <div key={i} className={`p-8 rounded-[2.5rem] shadow-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <i className={`fas ${stat.icon} text-2xl ${stat.color}`}></i>
                          <p className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                        </div>
                        <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`p-10 rounded-[3rem] shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <h4 className={`text-2xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Campaigns (Mock Data)</h4>
                    <div className="space-y-4">
                      {[
                        { name: 'Retargeting - Product A', status: 'Active', spend: '৳ ১২,০০০', roas: '4.1x' },
                        { name: 'Cold Audience - Broad', status: 'Active', spend: '৳ ২৫,০০০', roas: '2.5x' },
                        { name: 'Lookalike 1% - Purchasers', status: 'Paused', spend: '৳ ৮,০০০', roas: '1.8x' }
                      ].map((camp, i) => (
                        <div key={i} className={`p-6 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div>
                            <p className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{camp.name}</p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${camp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}`}>
                              {camp.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{camp.spend}</p>
                            <p className={`text-sm font-bold ${camp.roas >= '3' ? 'text-emerald-500' : 'text-amber-500'}`}>ROAS: {camp.roas}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </PremiumLock>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 md:px-8">
      {/* Sticky Sub-Navigation */}
      <nav className={`flex flex-nowrap justify-start md:justify-center gap-2 p-2 backdrop-blur-xl rounded-2xl shadow-lg border sticky top-20 z-[50] overflow-x-auto no-scrollbar mb-8 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap shadow-sm border shrink-0 ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-md border-transparent scale-105 ring-2 ring-indigo-500/20`
                : isDarkMode ? 'text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-indigo-400 hover:border-indigo-500/50' : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-white hover:text-indigo-600 hover:border-indigo-200'
            }`}
          >
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'animate-bounce text-sm' : 'text-xs'}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="min-h-[700px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalysisDashboard;
