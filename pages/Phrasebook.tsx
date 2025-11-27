
import React, { useState } from 'react';
import { Volume2, RefreshCw, Plus } from 'lucide-react';
import { Phrase } from '../types';
import { GeminiService } from '../services/geminiService';
import LoadingDots from '../components/LoadingDots';

const Phrasebook: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([
    { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', vietnamese: 'Chào buổi sáng', category: 'Chào hỏi' },
    { japanese: 'こんにちは', romaji: 'Konnichiwa', vietnamese: 'Xin chào', category: 'Chào hỏi' },
    { japanese: 'こんばんは', romaji: 'Konbanwa', vietnamese: 'Chào buổi tối', category: 'Chào hỏi' },
    { japanese: 'ありがとう', romaji: 'Arigatou', vietnamese: 'Cảm ơn', category: 'Cảm ơn' },
    { japanese: 'すみません', romaji: 'Sumimasen', vietnamese: 'Xin lỗi / Cho tôi hỏi', category: 'Xin lỗi' },
    { japanese: 'お元気ですか', romaji: 'Ogenki desu ka', vietnamese: 'Bạn có khỏe không?', category: 'Giao tiếp' },
    { japanese: 'トイレはどこですか', romaji: 'Toire wa doko desu ka', vietnamese: 'Nhà vệ sinh ở đâu?', category: 'Du lịch' },
  ]);
  const [loading, setLoading] = useState(false);

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const categories = ['Du lịch', 'Mua sắm', 'Nhà hàng', 'Kết bạn', 'Khẩn cấp'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const newPhrases = await GeminiService.getMorePhrases(randomCat);
      setPhrases(prev => [...newPhrases, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">Mẫu Câu</h2>
          <button onClick={loadMore} disabled={loading} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors">
            {loading ? <RefreshCw className="animate-spin" size={20}/> : <Plus size={20}/>}
          </button>
       </div>
       
       <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-4">
         {loading && <div className="text-center py-4"><LoadingDots /></div>}
         {phrases.map((p, i) => (
           <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-in slide-in-from-bottom-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold">{p.category}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{p.japanese}</p>
                <p className="text-xs text-indigo-500 font-medium italic">{p.romaji}</p>
                <p className="text-sm text-gray-600 mt-1">{p.vietnamese}</p>
              </div>
              <button onClick={() => speak(p.japanese)} className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 flex-shrink-0"><Volume2 size={20} /></button>
           </div>
         ))}
       </div>
    </div>
  );
};
export default Phrasebook;
