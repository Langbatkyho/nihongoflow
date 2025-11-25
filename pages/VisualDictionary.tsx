
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ImageAnalysisResult } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const VisualDictionary: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracking
  const startTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);

  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      // Score 100 if they analyzed at least one image
      const score = interactionCountRef.current > 0 ? 100 : 0;
      
      if (duration > 5) {
        HistoryService.addLog('VISUAL_DICT', duration, score);
      }
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64String: string) => {
    setLoading(true);
    setResult(null);
    try {
      // Clean base64 string
      const base64Data = base64String.split(',')[1];
      const data = await GeminiService.analyzeImage(base64Data);
      setResult(data);
      interactionCountRef.current += 1;
    } catch (error) {
      console.error(error);
      alert("Phân tích ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
       <h2 className="text-2xl font-bold text-indigo-900 mb-6">Từ Điển Hình Ảnh</h2>
       
       <div className="flex-1 flex flex-col space-y-6">
         {/* Upload Area */}
         <div 
           onClick={() => fileInputRef.current?.click()}
           className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${imagePreview ? 'border-indigo-400' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}
         >
           {imagePreview ? (
             <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
           ) : (
             <>
               <Camera size={48} className="text-gray-300 mb-2" />
               <p className="text-gray-500 font-medium">Chạm để chụp hoặc tải ảnh</p>
             </>
           )}
           
           {/* Loading Overlay */}
           {loading && (
             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
               <LoadingDots />
               <p className="text-indigo-600 font-medium mt-2">Đang phân tích...</p>
             </div>
           )}

           <input 
             type="file" 
             accept="image/*" 
             ref={fileInputRef} 
             onChange={handleImageUpload} 
             className="hidden" 
           />
         </div>

         {/* Results Area */}
         {result && !loading && (
           <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 animate-fade-in-up">
             <div className="text-center mb-6">
               <h3 className="text-4xl font-bold text-gray-800 mb-1">{result.japaneseTerm}</h3>
               <p className="text-indigo-500 font-medium">{result.reading}</p>
               <p className="text-gray-500 italic mt-1">{result.englishMeaning}</p>
             </div>

             <div className="bg-gray-50 p-4 rounded-xl">
               <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Ví dụ</p>
               <p className="text-gray-800 font-medium">{result.exampleSentence}</p>
             </div>

             <button 
               onClick={() => {
                 setImagePreview(null);
                 setResult(null);
               }}
               className="w-full mt-6 flex items-center justify-center gap-2 text-indigo-600 font-medium py-2 hover:bg-indigo-50 rounded-lg transition"
             >
               <RefreshCw size={18} /> Phân tích ảnh khác
             </button>
           </div>
         )}
       </div>
    </div>
  );
};

export default VisualDictionary;
