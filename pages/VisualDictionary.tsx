
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Volume2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ImageAnalysisResult } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const VisualDictionary: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      if (result) HistoryService.addLog('VISUAL_DICT', (Date.now() - startTimeRef.current) / 1000, 100);
    };
  }, [result]);

  const analyzeImage = async (base64String: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await GeminiService.analyzeImage(base64String.split(',')[1]);
      setResult(data);
    } catch (error) { alert("Lỗi phân tích."); } finally { setLoading(false); }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
       <h2 className="text-2xl font-bold text-indigo-900 mb-6">Từ Điển Hình Ảnh</h2>
       <div className="flex-1 flex flex-col space-y-6">
         <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white cursor-pointer overflow-hidden">
           {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <><Camera size={48} className="text-gray-300 mb-2" /><p className="text-gray-500">Chụp ảnh</p></>}
           {loading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><LoadingDots /></div>}
           <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => {
             const f = e.target.files?.[0];
             if(f) { const r = new FileReader(); r.onloadend=()=>{setImagePreview(r.result as string); analyzeImage(r.result as string)}; r.readAsDataURL(f); }
           }} className="hidden" />
         </div>

         {result && !loading && (
           <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 text-center space-y-3">
             <div>
               <div className="flex justify-center items-center gap-2">
                 <h3 className="text-4xl font-bold text-gray-800">{result.japaneseTerm}</h3>
                 <button onClick={() => speak(result.japaneseTerm)} className="text-indigo-500"><Volume2 size={24} /></button>
               </div>
               <p className="text-indigo-500 font-bold text-lg">{result.reading}</p>
               <p className="text-gray-400 italic">{result.romaji}</p>
               <p className="text-gray-600 text-lg mt-1">{result.englishMeaning}</p>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl text-left">
               <div className="flex justify-between"><p className="text-xs text-gray-400 font-bold uppercase">Ví dụ</p><button onClick={() => speak(result.exampleSentence)}><Volume2 size={14} className="text-gray-400" /></button></div>
               <p className="text-gray-800 font-medium">{result.exampleSentence}</p>
               <p className="text-gray-500 italic text-xs">{result.exampleRomaji}</p>
             </div>
           </div>
         )}
       </div>
    </div>
  );
};
export default VisualDictionary;
