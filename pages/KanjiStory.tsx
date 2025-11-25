
import React, { useState, useRef, useEffect } from 'react';
import { Search, Book, Sparkles } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { KanjiExplanation } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const KanjiStory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<KanjiExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  // Tracking
  const startTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);

  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      // Score 100 if they learned at least one kanji
      const score = interactionCountRef.current > 0 ? 100 : 0;
      
      if (duration > 5) {
        HistoryService.addLog('KANJI_STORY', duration, score);
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await GeminiService.getKanjiStory(searchTerm);
      setResult(data);
      interactionCountRef.current += 1;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-amber-50/50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Chuyện Kể Kanji</h2>

      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập Kanji hoặc từ vựng..."
          className="w-full bg-white border border-amber-200 text-gray-900 placeholder-gray-500 rounded-full py-3 px-5 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button 
          onClick={handleSearch}
          className="absolute right-2 top-1.5 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
        >
          <Search size={20} />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center mt-10">
          <LoadingDots />
        </div>
      )}

      {result && !loading && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-black text-gray-800 mb-2">{result.kanji}</h1>
                <p className="text-amber-600 font-bold text-lg">{result.reading}</p>
              </div>
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                N5/N4
              </div>
            </div>
            <p className="text-gray-600 mt-2 text-lg">{result.meaning}</p>
          </div>

          {/* Mnemonic Story */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-amber-100">
            <h3 className="flex items-center gap-2 font-bold text-amber-700 mb-3">
              <Sparkles size={18} /> Câu chuyện ghi nhớ
            </h3>
            <p className="text-gray-700 leading-relaxed italic border-l-2 border-amber-200 pl-4">
              "{result.mnemonic}"
            </p>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-amber-100">
             <h3 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
              <Book size={18} /> Ví dụ mẫu
            </h3>
            <div className="space-y-4">
              {result.examples.map((ex, idx) => (
                <div key={idx} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="text-gray-800 font-medium">{ex.sentence}</p>
                  <p className="text-gray-400 text-xs mt-1">{ex.reading}</p>
                  <p className="text-gray-500 text-sm mt-1">{ex.translation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
           <Book size={64} className="mb-4" />
           <p>Tìm kiếm một từ để bắt đầu</p>
        </div>
      )}
    </div>
  );
};

export default KanjiStory;
