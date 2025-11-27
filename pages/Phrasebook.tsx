
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Phrase } from '../types';

const Phrasebook: React.FC = () => {
  const phrases: Phrase[] = [
    { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', vietnamese: 'Chào buổi sáng', category: 'Chào hỏi' },
    { japanese: 'こんにちは', romaji: 'Konnichiwa', vietnamese: 'Xin chào', category: 'Chào hỏi' },
    { japanese: 'こんばんは', romaji: 'Konbanwa', vietnamese: 'Chào buổi tối', category: 'Chào hỏi' },
    { japanese: 'ありがとう', romaji: 'Arigatou', vietnamese: 'Cảm ơn', category: 'Cảm ơn' },
    { japanese: 'すみません', romaji: 'Sumimasen', vietnamese: 'Xin lỗi / Cho tôi hỏi', category: 'Xin lỗi' },
    { japanese: 'お元気ですか', romaji: 'Ogenki desu ka', vietnamese: 'Bạn có khỏe không?', category: 'Giao tiếp' },
    { japanese: 'トイレはどこですか', romaji: 'Toire wa doko desu ka', vietnamese: 'Nhà vệ sinh ở đâu?', category: 'Du lịch' },
  ];

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
       <h2 className="text-2xl font-bold text-indigo-900 mb-6">Mẫu Câu Thông Dụng</h2>
       <div className="space-y-3 overflow-y-auto no-scrollbar">
         {phrases.map((p, i) => (
           <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-gray-800">{p.japanese}</p>
                <p className="text-xs text-indigo-500 font-medium italic">{p.romaji}</p>
                <p className="text-sm text-gray-600 mt-1">{p.vietnamese}</p>
              </div>
              <button onClick={() => speak(p.japanese)} className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100"><Volume2 size={20} /></button>
           </div>
         ))}
       </div>
    </div>
  );
};
export default Phrasebook;
