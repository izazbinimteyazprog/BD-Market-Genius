import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  isDarkMode: boolean;
  onClose: () => void;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  link: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'users'>('resources');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'resources') {
        const docRef = doc(db, 'appContent', 'resources');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResources(docSnap.data().items || []);
        } else {
          // Default resources
          setResources([
            { id: '1', title: 'Meta Ads Guide BD', description: 'Learn how to run profitable ads in Bangladesh.', link: '#' },
            { id: '2', title: 'Local Courier Integration', description: 'Connect Steadfast, Pathao, and RedX easily.', link: '#' },
            { id: '3', title: 'Sourcing Secrets', description: 'Find the best wholesale markets in Dhaka.', link: '#' },
            { id: '4', title: 'Scaling to 100 Orders/Day', description: 'Advanced strategies for e-commerce growth.', link: '#' }
          ]);
        }
      } else if (activeTab === 'users') {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: any[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      if (error instanceof Error && error.message.includes('permission')) {
        handleFirestoreError(error, OperationType.GET, activeTab === 'resources' ? 'appContent/resources' : 'users');
      }
      setSaveMessage("Error fetching data. Check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceChange = (index: number, field: keyof ResourceItem, value: string) => {
    const newResources = [...resources];
    newResources[index] = { ...newResources[index], [field]: value };
    setResources(newResources);
  };

  const handleSaveResources = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await setDoc(doc(db, 'appContent', 'resources'), { items: resources });
      setSaveMessage('Resources updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error("Error saving resources:", error);
      if (error instanceof Error && error.message.includes('permission')) {
        handleFirestoreError(error, OperationType.WRITE, 'appContent/resources');
      }
      setSaveMessage('Failed to save resources.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
      <div className={`rounded-[2rem] p-8 max-w-5xl w-full shadow-2xl my-8 animate-in zoom-in-95 duration-200 relative min-h-[600px] flex flex-col ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black">Admin Gateway</h3>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage App Content & Users</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'resources' ? 'bg-rose-600 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="fas fa-book-open mr-2"></i> Edit Resources
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="fas fa-users mr-2"></i> View Users
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <i className="fas fa-circle-notch fa-spin text-4xl text-rose-500"></i>
            </div>
          ) : activeTab === 'resources' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-black">Resources for Entrepreneurs</h4>
                <button 
                  onClick={handleSaveResources}
                  disabled={isSaving}
                  className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                  Save Changes
                </button>
              </div>
              
              {saveMessage && (
                <div className={`p-4 rounded-xl text-sm font-bold text-center ${saveMessage.includes('Error') || saveMessage.includes('Failed') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {saveMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource, index) => (
                  <div key={resource.id} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase mb-2 opacity-70">Title</label>
                      <input 
                        type="text" 
                        value={resource.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase mb-2 opacity-70">Description</label>
                      <textarea 
                        value={resource.description}
                        onChange={(e) => handleResourceChange(index, 'description', e.target.value)}
                        rows={2}
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500 resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 opacity-70">Link URL</label>
                      <input 
                        type="text" 
                        value={resource.link}
                        onChange={(e) => handleResourceChange(index, 'link', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xl font-black mb-6">Registered Users ({users.length})</h4>
              <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <table className="w-full text-left text-sm">
                  <thead className={`text-xs uppercase font-black ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map((user) => (
                      <tr key={user.id} className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
                        <td className="px-6 py-4 font-bold">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.userTier === 'admin' ? 'bg-rose-100 text-rose-700' : user.userTier?.startsWith('pro') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                            {user.userTier || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs opacity-70">
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center opacity-50">No users found or permission denied.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
