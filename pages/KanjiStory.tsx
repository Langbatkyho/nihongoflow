
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Volume2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { KanjiExplanation } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const KanjiStory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<KanjiExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      if(result) HistoryService.addLog('KANJI_STORY', (Date.now() - startTimeRef.current) / 1000, 100);
    };
  }, [result]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await GeminiService.getKanjiStory(searchTerm);
      setResult(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-amber-50/50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Chuyện Kể Kanji</h2>
      <div className="relative mb-6">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSearch()} placeholder="Nhập Kanji..." className="w-full bg-white border border-amber-200 rounded-full py-3 px-5 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
        <button onClick={handleSearch} className="absolute right-2 top-1.5 p-1.5 bg-amber-500 text-white rounded-full"><Search size={20} /></button>
      </div>

      {loading && <div className="flex justify-center"><LoadingDots /></div>}

      {result && !loading && (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-amber-500 text-center">
             <h1 className="text-6xl font-black text-gray-800 mb-2">{result.kanji}</h1>
             <div className="flex justify-center gap-2 items-center">
                <p className="text-amber-600 font-bold text-xl">{result.reading}</p>
                <button onClick={() => speak(result.reading)} className="text-amber-400"><Volume2 size={20} /></button>
             </div>
             <p className="text-gray-400 italic">{result.romaji}</p>
             <p className="text-gray-600 text-lg mt-2 font-medium">{result.meaning}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-100">
            <h3 className="flex items-center gap-2 font-bold text-amber-700 mb-2"><Sparkles size={18} /> Ghi nhớ</h3>
            <p className="italic text-gray-700">{result.mnemonic}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-100 space-y-3">
             <h3 className="font-bold text-gray-700">Ví dụ</h3>
             {result.examples.map((ex, i) => (
               <div key={i} className="border-b border-gray-100 last:border-0 pb-2">
                 <div className="flex justify-between"><p className="font-medium text-gray-800">{ex.sentence}</p><button onClick={() => speak(ex.sentence)}><Volume2 size={16} className="text-gray-400" /></button></div>
                 <p className="text-xs text-amber-600">{ex.reading}</p>
                 <p className="text-xs text-gray-400 italic">{ex.romaji}</p>
                 <p className="text-sm text-gray-500">{ex.translation}</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default KanjiStory;
