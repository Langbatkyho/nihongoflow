
import React, { useState, useRef, useEffect } from 'react';
import { Eraser, CheckCircle, ChevronRight, PenTool, Eye, Volume2, RefreshCw } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { HistoryService } from '../services/historyService';
import LoadingDots from '../components/LoadingDots';
import { WritingFeedback } from '../types';

interface CharData {
  char: string;
  romaji: string;
  meaning: string;
}

const WritingPractice: React.FC = () => {
  const categories: Record<string, CharData[]> = {
    HIRAGANA: [
      { char: 'あ', romaji: 'a', meaning: 'Nguyên âm A' },
      { char: 'い', romaji: 'i', meaning: 'Nguyên âm I' },
      { char: 'う', romaji: 'u', meaning: 'Nguyên âm U' },
      { char: 'え', romaji: 'e', meaning: 'Nguyên âm E' },
      { char: 'お', romaji: 'o', meaning: 'Nguyên âm O' },
      { char: 'か', romaji: 'ka', meaning: 'Âm Ka' },
      { char: 'き', romaji: 'ki', meaning: 'Âm Ki' },
      { char: 'く', romaji: 'ku', meaning: 'Âm Ku' },
      { char: 'け', romaji: 'ke', meaning: 'Âm Ke' },
      { char: 'こ', romaji: 'ko', meaning: 'Âm Ko' },
    ],
    KATAKANA: [
      { char: 'ア', romaji: 'a', meaning: 'Nguyên âm A' },
      { char: 'イ', romaji: 'i', meaning: 'Nguyên âm I' },
      { char: 'ウ', romaji: 'u', meaning: 'Nguyên âm U' },
      { char: 'エ', romaji: 'e', meaning: 'Nguyên âm E' },
      { char: 'オ', romaji: 'o', meaning: 'Nguyên âm O' },
      { char: 'カ', romaji: 'ka', meaning: 'Âm Ka' },
      { char: 'キ', romaji: 'ki', meaning: 'Âm Ki' },
      { char: 'ク', romaji: 'ku', meaning: 'Âm Ku' },
      { char: 'ケ', romaji: 'ke', meaning: 'Âm Ke' },
      { char: 'コ', romaji: 'ko', meaning: 'Âm Ko' },
    ],
    KANJI_N5: [
      { char: '一', romaji: 'ichi', meaning: 'Số 1' },
      { char: '二', romaji: 'ni', meaning: 'Số 2' },
      { char: '三', romaji: 'san', meaning: 'Số 3' },
      { char: '四', romaji: 'yon', meaning: 'Số 4' },
      { char: '五', romaji: 'go', meaning: 'Số 5' },
      { char: '六', romaji: 'roku', meaning: 'Số 6' },
      { char: '七', romaji: 'nana', meaning: 'Số 7' },
      { char: '八', romaji: 'hachi', meaning: 'Số 8' },
      { char: '九', romaji: 'kyuu', meaning: 'Số 9' },
      { char: '十', romaji: 'juu', meaning: 'Số 10' },
      { char: '日', romaji: 'nichi', meaning: 'Mặt trời / Ngày' },
      { char: '月', romaji: 'getsu', meaning: 'Mặt trăng / Tháng' },
    ]
  };
  const [category, setCategory] = useState<string>('HIRAGANA');
  const [idx, setIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(true);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(Date.now());

  const currentItem = categories[category][idx];
  const char = currentItem.char;
  // KanjiVG Url format: 0 + hex code of unicode
  const hex = char.charCodeAt(0).toString(16).padStart(5, '0');
  const strokeOrderUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

  useEffect(() => {
    const cvs = canvasRef.current;
    if(cvs) {
       const r = cvs.getBoundingClientRect();
       cvs.width = r.width; cvs.height = r.height;
       const ctx = cvs.getContext('2d');
       if(ctx) { ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1e3a8a'; }
    }
  }, [char, category]);

  useEffect(() => {
    return () => { if(Date.now() - startTimeRef.current > 5000) HistoryService.addLog('WRITING', (Date.now()-startTimeRef.current)/1000, 100); }
  }, []);

  const clear = () => {
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext('2d');
    ctx?.clearRect(0,0,cvs!.width, cvs!.height);
    setFeedback(null);
  };

  const handleReload = () => {
    clear();
    const len = categories[category].length;
    let newIdx = Math.floor(Math.random() * len);
    // Cố gắng lấy số khác số hiện tại nếu danh sách có nhiều hơn 1 phần tử
    if (len > 1 && newIdx === idx) {
      newIdx = (newIdx + 1) % len;
    }
    setIdx(newIdx);
  };

  const draw = (e: any) => {
    if(!isDrawing) return;
    const cvs = canvasRef.current;
    const rect = cvs!.getBoundingClientRect();
    const x = (e.touches?.[0].clientX || e.clientX) - rect.left;
    const y = (e.touches?.[0].clientY || e.clientY) - rect.top;
    const ctx = cvs!.getContext('2d');
    ctx!.lineTo(x,y); ctx!.stroke();
  };

  const start = (e: any) => {
    setIsDrawing(true);
    const cvs = canvasRef.current;
    const rect = cvs!.getBoundingClientRect();
    const x = (e.touches?.[0].clientX || e.clientX) - rect.left;
    const y = (e.touches?.[0].clientY || e.clientY) - rect.top;
    const ctx = cvs!.getContext('2d');
    ctx!.beginPath(); ctx!.moveTo(x,y);
  };

  const check = async () => {
    if(!canvasRef.current) return;
    setIsAnalyzing(true);
    try {
      const b64 = canvasRef.current.toDataURL('image/png').split(',')[1];
      const res = await GeminiService.evaluateHandwriting(b64, char);
      setFeedback(res);
    } catch(e) { alert("Lỗi chấm điểm"); } finally { setIsAnalyzing(false); }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-4 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2"><PenTool /> Luyện Viết</h2>
        <div className="flex bg-white p-1 rounded-lg border mb-4">
           {Object.keys(categories).map((c: any) => (
             <button key={c} onClick={()=>{setCategory(c); setIdx(0); clear()}} className={`flex-1 py-2 text-xs font-bold rounded ${category===c?'bg-indigo-100 text-indigo-700':'text-gray-400'}`}>{c}</button>
           ))}
        </div>

        {/* Info Card */}
        <div className="bg-white p-3 rounded-xl border border-indigo-100 flex justify-between items-center shadow-sm">
           <div>
             <h1 className="text-3xl font-black text-gray-800">{currentItem.char}</h1>
           </div>
           <div className="text-right">
             <div className="flex items-center gap-2 justify-end">
               <p className="font-bold text-indigo-600 text-lg">{currentItem.romaji}</p>
               <button onClick={() => speak(currentItem.char)} className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-50"><Volume2 size={18}/></button>
               <button onClick={handleReload} className="p-2 text-indigo-500 bg-indigo-50 rounded-full hover:bg-indigo-100 transition"><RefreshCw size={18}/></button>
             </div>
             <p className="text-sm text-gray-500 mt-1">{currentItem.meaning}</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[300px] h-[300px] bg-white rounded-2xl shadow-lg border-4 border-indigo-50 overflow-hidden">
          {/* Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20 border border-indigo-200 m-2 rounded-xl">
             <div className="absolute top-1/2 w-full border-t border-dashed border-gray-400"></div>
             <div className="absolute left-1/2 h-full border-l border-dashed border-gray-400"></div>
          </div>
          {/* Stroke Order Image (Underlay) */}
          {showStrokeOrder && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
               <img src={strokeOrderUrl} alt="stroke order" className="w-[80%] h-[80%] object-contain" />
            </div>
          )}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
             onMouseDown={start} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} onMouseLeave={()=>setIsDrawing(false)}
             onTouchStart={start} onTouchMove={draw} onTouchEnd={()=>setIsDrawing(false)}
          />
        </div>

        <div className="flex gap-2 w-[300px]">
           <button onClick={clear} className="flex-1 py-3 bg-white border rounded-xl font-bold text-gray-600"><Eraser size={18} /></button>
           <button onClick={()=>setShowStrokeOrder(!showStrokeOrder)} className={`flex-1 py-3 border rounded-xl font-bold ${showStrokeOrder?'bg-indigo-50 text-indigo-600':'bg-white text-gray-400'}`}><Eye size={18}/></button>
           <button onClick={check} disabled={isAnalyzing} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
             {isAnalyzing ? <LoadingDots /> : <><CheckCircle size={18} /> Chấm điểm</>}
           </button>
        </div>

        {feedback && (
          <div className="w-[300px] bg-white p-4 rounded-xl shadow border border-green-100 animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-gray-800">Kết quả</span>
               <span className="text-xl font-black text-green-600">{feedback.score}/100</span>
             </div>
             <p className="text-sm text-gray-600 mb-2">{feedback.feedback}</p>
             <p className="text-xs text-gray-500">Ví dụ: {feedback.exampleWord} - {feedback.exampleMeaning}</p>
             <button onClick={()=>{clear(); setIdx((idx+1)%categories[category].length)}} className="w-full mt-3 py-2 text-indigo-600 font-bold bg-indigo-50 rounded-lg flex justify-center items-center gap-1">Tiếp theo <ChevronRight size={16}/></button>
          </div>
        )}
      </div>
    </div>
  );
};
export default WritingPractice;
