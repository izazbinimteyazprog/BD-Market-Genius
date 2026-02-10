
import React, { useState, useCallback } from 'react';
import { analyzeProduct } from './services/geminiService';
import { MarketResearchResponse } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import Header from './components/Header';

const App: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeProduct(productName);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while analyzing the product.');
    } finally {
      setIsLoading(false);
    }
  }, [productName]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Bangladesh E-commerce Strategy Engine
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Get instant market research, consumer personas, and high-converting ad frameworks for any product.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400"></i>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg transition-all"
              placeholder="Enter product name (e.g., Organic Honey, T-Shirt, Gadget...)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !productName.trim()}
              className="absolute inset-y-2 right-2 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Analyze Now'
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center animate-pulse">
              <h2 className="text-2xl font-bold text-slate-700">Analyzing Market Dynamics...</h2>
              <p className="text-slate-500">Estimating competition and generating localized ad copies for Bangladesh.</p>
            </div>
          </div>
        )}

        {analysis && <AnalysisDashboard analysis={analysis} productName={productName} />}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; 2024 BD Market Genius. Engineered for Performance Marketers.</p>
      </footer>
    </div>
  );
};

export default App;
