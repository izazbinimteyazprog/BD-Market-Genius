import React from 'react';
import { UserTier } from '../App';

interface PricingModalProps {
  isDarkMode: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isDarkMode, onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className={`rounded-[3rem] p-8 md:p-12 max-w-5xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200 relative ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <button onClick={onClose} className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-4">Upgrade to Pro</h3>
          <p className={`font-bold max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Get full access to competitor tracking, budget planning, and exclusive business insights.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'pro_basic' as UserTier, name: 'Basic', price: '৳৯৯৯', icon: 'fa-seedling', features: ['Competitor Ads', 'Basic Market Research', 'Standard Copies'] },
            { id: 'pro_premium' as UserTier, name: 'Premium', price: '৳২৪৯৯', icon: 'fa-gem', features: ['All Basic features', 'Full Competitor Data', 'Budget Allocation', 'AI Image Gen'], popular: true },
            { id: 'pro_exclusive' as UserTier, name: 'Exclusive', price: '৳৪৯৯৯', icon: 'fa-crown', features: ['All Premium features', '1-on-1 Consultation', 'Secret Success Tips', 'Priority Support'] },
          ].map((pkg) => (
            <div key={pkg.id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative ${pkg.popular ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-2xl z-10 text-white' : isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              {pkg.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-6 py-1 rounded-full text-[10px] font-black uppercase">Most Popular</span>}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${pkg.popular ? 'bg-white/20' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <i className={`fas ${pkg.icon} text-2xl ${pkg.popular ? 'text-white' : 'text-indigo-500'}`}></i>
                </div>
                <h4 className="text-2xl font-black mb-2">{pkg.name}</h4>
                <p className="text-4xl font-black">{pkg.price}</p>
                <p className={`text-xs font-bold mt-2 ${pkg.popular ? 'text-indigo-200' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lifetime Access</p>
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm font-bold ${pkg.popular ? 'opacity-90' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <i className={`fas fa-check-circle ${pkg.popular ? 'text-emerald-300' : 'text-emerald-500'}`}></i> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onUpgrade(pkg.id)}
                className={`w-full py-4 rounded-[1.5rem] font-black transition-all ${pkg.popular ? 'bg-white text-indigo-600 hover:bg-slate-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                Choose {pkg.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
