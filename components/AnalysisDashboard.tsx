
import React, { useState } from 'react';
import { MarketResearchResponse, ContentPiece, AdVariation } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateImageForContent } from '../services/geminiService';

interface Props {
  analysis: MarketResearchResponse;
  productName: string;
}

type TabType = 'strategy' | 'market' | 'cold' | 'warm' | 'hot' | 'retargeting' | 'retention';

const AnalysisDashboard: React.FC<Props> = ({ analysis, productName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('strategy');
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [localAnalysis, setLocalAnalysis] = useState<MarketResearchResponse>(analysis);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const { 
    product_market_fit: pmf, 
    competition_analysis: comp, 
    customer_avatars: avatars,
    ad_copies: copies,
    final_decision: decision
  } = localAnalysis;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleGenerateImage = async (pieceId: string, prompt: string, category: keyof typeof copies) => {
    setGeneratingImages(prev => ({ ...prev, [pieceId]: true }));
    try {
      const imageUrl = await generateImageForContent(prompt);
      const updatedCopies = { ...localAnalysis.ad_copies };
      const list = updatedCopies[category];
      const index = list.findIndex(p => p.id === pieceId);
      if (index !== -1) {
        list[index].generatedImageUrl = imageUrl;
      }
      setLocalAnalysis({ ...localAnalysis, ad_copies: updatedCopies });
    } catch (err) {
      console.error(err);
      alert("ছবি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setGeneratingImages(prev => ({ ...prev, [pieceId]: false }));
    }
  };

  const tabs: { id: TabType; label: string; icon: string; color: string }[] = [
    { id: 'strategy', label: 'সিদ্ধান্ত', icon: 'fa-gavel', color: 'bg-slate-900' },
    { id: 'market', label: 'মার্কেট ও কাস্টমার', icon: 'fa-users', color: 'bg-blue-600' },
    { id: 'cold', label: 'কোল্ড অডিয়েন্স', icon: 'fa-snowflake', color: 'bg-indigo-500' },
    { id: 'warm', label: 'ওয়ার্ম অডিয়েন্স', icon: 'fa-fire-alt', color: 'bg-orange-500' },
    { id: 'hot', label: 'হট অডিয়েন্স', icon: 'fa-bolt', color: 'bg-rose-500' },
    { id: 'retargeting', label: 'রি-টার্গেটিং', icon: 'fa-redo', color: 'bg-emerald-500' },
    { id: 'retention', label: 'রিটেনশন', icon: 'fa-heart', color: 'bg-pink-500' },
  ];

  const renderAdVariationCard = (v: AdVariation, index: number, themeColor: string) => {
    const fullAd = `Headline: ${v.headline}\n\n${v.hook}\n\n${v.body}\n\nCTA: ${v.cta}`;
    return (
      <div key={index} className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden mb-6 group relative">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready-to-Publish Variation {index + 1}</span>
           <button 
             onClick={() => handleCopy(fullAd, `Variation ${index + 1}`)}
             className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md border border-emerald-500/30 hover:bg-emerald-500/30 transition-all font-bold"
           >
             {copyFeedback === `Variation ${index + 1}` ? 'Copied!' : 'Copy Full Ad'}
           </button>
        </div>
        <div className="p-5 text-white space-y-4">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Headline</p>
            <p className="text-lg font-black text-emerald-400 leading-tight">{v.headline}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Hook</p>
            <p className="text-sm font-bold text-slate-200 leading-relaxed italic border-l-2 border-emerald-500 pl-3">"{v.hook}"</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Body</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{v.body}</p>
          </div>
          <div className="pt-2">
            <button 
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
              style={{ backgroundColor: themeColor.replace('bg-', '#') }}
            >
              {v.cta}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContentPiece = (piece: ContentPiece, themeColor: string, category: keyof typeof copies) => (
    <div key={piece.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-12 max-w-5xl mx-auto">
      <div className={`${themeColor} px-6 py-4 flex justify-between items-center text-white`}>
        <div className="flex items-center gap-3">
          <i className="fas fa-bullhorn"></i>
          <h4 className="font-bold text-lg">{piece.title}</h4>
        </div>
        <span className="text-[10px] font-black uppercase bg-black/20 px-3 py-1 rounded-full border border-white/20">
          {piece.recommended_format}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Col: Visuals & Variations */}
        <div className="lg:col-span-7 p-6 border-r border-slate-50">
          <div className="mb-8 aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 relative group">
            {piece.generatedImageUrl ? (
              <img src={piece.generatedImageUrl} alt="AI Visual" className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <i className={`fas ${generatingImages[piece.id] ? 'fa-spinner fa-spin' : 'fa-image'} text-4xl text-slate-300 mb-4`}></i>
                <p className="text-slate-500 font-bold text-sm mb-4">এই সেকশনের জন্য AI ছবি প্রয়োজন?</p>
                <button 
                  onClick={() => handleGenerateImage(piece.id, piece.title + " for " + productName, category)}
                  disabled={generatingImages[piece.id]}
                  className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {generatingImages[piece.id] ? 'Generating...' : 'Generate AI Image'}
                </button>
              </div>
            )}
          </div>

          <h5 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-rocket text-emerald-500"></i>
            Ready to Publish Ads (তৈরি বিজ্ঞাপন)
          </h5>
          <div className="space-y-4">
            {piece.variations.map((v, i) => renderAdVariationCard(v, i, themeColor))}
          </div>
        </div>

        {/* Right Col: Inspiration & Hooks */}
        <div className="lg:col-span-5 p-6 bg-slate-50/50">
          <div className="mb-8">
            <h5 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-anchor text-blue-500"></i>
              ৫টি স্ক্রল-স্টপিং হুক (Hooks)
            </h5>
            <div className="space-y-2">
              {piece.hooks.map((hook, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                   <div className="w-5 h-5 bg-blue-50 text-blue-500 rounded flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</div>
                   <p className="text-xs font-bold text-slate-600 leading-snug italic">"{hook}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-lightbulb text-amber-500"></i>
              ৫টি কন্টেন্ট আইডিয়া (Ideas)
            </h5>
            <div className="space-y-2">
              {piece.ideas.map((idea, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                   <div className="w-5 h-5 bg-amber-50 text-amber-500 rounded flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</div>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">{idea}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-brain text-indigo-600 text-sm"></i>
              <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">সাইকোলজি (Connection)</h5>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed font-bold">{piece.connection_psychology}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
              <div className={`shrink-0 w-48 h-48 rounded-full flex flex-col items-center justify-center text-white shadow-2xl ${decision.verdict === 'YES' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <span className="text-xs uppercase tracking-widest font-bold opacity-80">সিদ্ধান্ত (Verdict)</span>
                <span className="text-6xl font-black">{decision.verdict}</span>
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-black text-slate-800 mb-2">স্ট্র্যাটেজিক সিদ্ধান্ত</h2>
                <p className="text-slate-600 mb-6 leading-relaxed text-xl font-bold italic">"{decision.decision_reasoning}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 block uppercase font-black tracking-tighter">প্রস্তাবিত বাজেট (Test Budget)</span>
                    <span className="text-3xl font-black text-slate-800">৳{decision.starting_budget_bdt.toLocaleString()}</span>
                  </div>
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-xs text-emerald-600 block uppercase font-black tracking-tighter">মার্কেট ফিট স্কোর</span>
                    <span className="text-3xl font-black text-emerald-700">{pmf.market_fit_score}/10</span>
                  </div>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <i className="fas fa-rocket text-emerald-500 mr-3"></i>
                  সফল হওয়ার টিপস (Optimization)
                </h3>
                <div className="space-y-4">
                  {decision.optimization_requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-700 text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0 font-bold">
                      <i className="fas fa-check-circle text-emerald-400"></i>
                      <p>{req}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <i className="fas fa-shield-alt text-rose-500 mr-3"></i>
                  সম্ভাব্য ঝুঁকি (Major Risks)
                </h3>
                <div className="space-y-4">
                  {decision.major_risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shrink-0 font-black">!</div>
                      <p className="text-sm text-rose-900 font-bold">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">মার্কেট অ্যানালাইসিস</h3>
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-black text-slate-400 mb-1 uppercase">প্রধান সমস্যা (Core Problem)</p>
                    <p className="text-slate-800 font-bold text-lg">{pmf.core_problem}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold mb-1 uppercase">প্রয়োজনীয়তা (Urgency)</p>
                      <p className="text-slate-800 font-black">{pmf.urgency_level}</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold mb-1 uppercase">চাহিদা (Demand Type)</p>
                      <p className="text-slate-800 font-black">{pmf.demand_type}</p>
                    </div>
                  </div>
                  <div className="p-5 border-l-4 border-blue-500 bg-blue-50/30 rounded-r-2xl">
                    <p className="text-xs font-black text-blue-600 mb-1 uppercase">সাংস্কৃতিক প্রাসঙ্গিকতা</p>
                    <p className="text-slate-700 text-sm font-bold leading-relaxed">{pmf.cultural_relevance}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">অ্যাড স্যাচুরেশন ও কম্পিটিশন</h3>
                <div className="h-56 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'FB/IG', value: comp.ad_saturation.facebook_instagram },
                      { name: 'Google', value: comp.ad_saturation.google_ads },
                      { name: 'Market', value: comp.ad_saturation.marketplaces },
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fontWeight: 700 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">এন্ট্রি ডিফিকাল্টি</p>
                    <p className="font-black text-slate-800">{comp.entry_difficulty}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">মার্কেট প্রাইস রেঞ্জ</p>
                    <p className="font-black text-slate-800">৳{comp.price_range_bdt}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {avatars.map((avatar, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-2xl text-slate-800">{avatar.avatar_name}</h4>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{avatar.age_range} • {avatar.gender} • {avatar.location}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <i className="fas fa-user-tag text-xl"></i>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 rounded-2xl">
                      <h5 className="text-[10px] font-black text-rose-600 uppercase mb-2">প্রধান পেইন পয়েন্টসমূহ</h5>
                      <ul className="text-xs space-y-1 font-bold text-slate-700">
                        {avatar.pain_points.slice(0, 3).map((p, i) => <li key={i}>• {p}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                      <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-1">প্রত্যাশিত পরিবর্তন</h5>
                      <p className="text-xs text-slate-800 font-bold">{avatar.desired_transformation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cold':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">কোল্ড অডিয়েন্স (ToFU)</h3>
              <p className="text-slate-500 font-bold">নতুন কাস্টমারদের মনোযোগ কাড়ার জন্য ৫টি হুক ও রেডি-টু-পাবলিশ বিজ্ঞাপন।</p>
            </div>
            {copies.cold_audience.map((piece) => renderContentPiece(piece, 'bg-indigo-600', 'cold_audience'))}
          </div>
        );

      case 'warm':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-3xl mx-auto mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">ওয়ার্ম অডিয়েন্স (MoFU)</h3>
              <p className="text-slate-500 font-bold">পণ্য নিয়ে যারা ভাবছে, তাদের বিশ্বাস অর্জন করার কন্টেন্ট এবং বিজ্ঞাপন।</p>
            </div>
            {copies.warm_audience.map((piece) => renderContentPiece(piece, 'bg-orange-600', 'warm_audience'))}
          </div>
        );

      case 'hot':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">হট অডিয়েন্স (BoFU)</h3>
              <p className="text-slate-500 font-bold">সরাসরি বিক্রির জন্য অফার এবং রিস্ক রিভার্সাল রেডি বিজ্ঞাপন।</p>
            </div>
            {copies.hot_audience.map((piece) => renderContentPiece(piece, 'bg-rose-600', 'hot_audience'))}
          </div>
        );

      case 'retargeting':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">রি-টার্গেটিং স্ট্র্যাটেজি</h3>
              <p className="text-slate-500 font-bold">যারা কেনাকাটা অসমাপ্ত রেখে চলে গেছে তাদের ফিরিয়ে আনার বিজ্ঞাপন।</p>
            </div>
            {copies.retargeting.map((piece) => renderContentPiece(piece, 'bg-emerald-600', 'retargeting'))}
          </div>
        );

      case 'retention':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto mb-10 text-center">
              <h3 className="text-3xl font-black text-slate-800 mb-2">রিটেনশন ও লয়্যালটি</h3>
              <p className="text-slate-500 font-bold">পুরনো কাস্টমারদের বারবার কেনাকাটা করতে উৎসাহিত করার কন্টেন্ট।</p>
            </div>
            {copies.retention.map((piece) => renderContentPiece(piece, 'bg-pink-600', 'retention'))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Dynamic Tabs Navigation */}
      <nav className="flex flex-wrap justify-center gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-20 z-40 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-black transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-lg`
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Dynamic Content Rendering */}
      <div className="min-h-[600px] pt-4 px-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalysisDashboard;
