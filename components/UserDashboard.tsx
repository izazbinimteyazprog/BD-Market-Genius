import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MarketResearchResponse } from '../types';

interface UserDashboardProps {
  currentUser: User | null;
  userTier: string;
  userName: string;
  isDarkMode: boolean;
  onClose: () => void;
  onViewReport: (productName: string, analysisData: MarketResearchResponse) => void;
  onLogout: () => void;
  onUpgradeClick: () => void;
  onAdminClick?: () => void;
}

interface SavedReport {
  id: string;
  productName: string;
  analysisData: string;
  createdAt: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  currentUser, 
  userTier, 
  userName, 
  isDarkMode, 
  onClose, 
  onViewReport,
  onLogout,
  onUpgradeClick,
  onAdminClick
}) => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedReports: SavedReport[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() } as SavedReport);
        });
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [currentUser]);

  const handleViewReport = (report: SavedReport) => {
    try {
      const parsedData = JSON.parse(report.analysisData);
      onViewReport(report.productName, parsedData);
      onClose();
    } catch (e) {
      console.error("Failed to parse report data", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className={`rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner overflow-hidden">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <i className="fas fa-user-circle"></i>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-black">My Dashboard</h3>
              <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your account & reports</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Plan</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xl font-black text-indigo-500 uppercase">
                  {userTier === 'guest' ? 'Guest' : userTier === 'free' ? 'Free Plan' : userTier.replace('pro_', 'Pro ')}
                </p>
              </div>
              {userTier !== 'pro_exclusive' && (
                <button 
                  onClick={onUpgradeClick}
                  className="w-full py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            <div>
              <p className={`text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Details</p>
              <div className={`space-y-4 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Name</span>
                  <span className="text-sm font-black">{userName || currentUser?.displayName || 'Uddokta User'}</span>
                </div>
                <div>
                  <span className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</span>
                  <span className="text-sm font-black break-all">{currentUser?.email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {userTier === 'admin' && (
              <button 
                onClick={onAdminClick}
                className="w-full py-4 font-black rounded-2xl transition-all border-2 bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
              >
                <i className="fas fa-shield-alt mr-2"></i> Admin Gateway
              </button>
            )}

            <button 
              onClick={onLogout}
              className={`w-full py-4 font-black rounded-2xl transition-all border-2 ${isDarkMode ? 'border-rose-900/50 text-rose-400 hover:bg-rose-900/20' : 'border-rose-100 text-rose-600 hover:bg-rose-50'}`}
            >
              Log Out
            </button>
          </div>

          {/* Right Column: Saved Reports */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-black mb-4 flex items-center gap-2">
              <i className="fas fa-history text-indigo-500"></i> Saved Reports
            </h4>
            
            <div className={`rounded-2xl border min-h-[400px] p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <i className="fas fa-circle-notch fa-spin text-3xl mb-4 text-indigo-500"></i>
                  <p className="font-bold">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-folder-open text-3xl text-slate-400 dark:text-slate-500"></i>
                  </div>
                  <h5 className="text-lg font-black mb-2">No Reports Yet</h5>
                  <p className={`text-sm font-medium max-w-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generate your first market research report to see it saved here.
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all"
                  >
                    Create a Report
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-400'}`}
                      onClick={() => handleViewReport(report)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-lg mb-1 group-hover:text-indigo-500 transition-colors">{report.productName}</h5>
                          <p className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <i className="far fa-calendar-alt"></i>
                            {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            }) : 'Recently'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
