
import React, { useState, useRef, useEffect } from 'react';
import { Eraser, CheckCircle, RefreshCw, ChevronRight, PenTool } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { HistoryService } from '../services/historyService';
import LoadingDots from '../components/LoadingDots';
import { WritingFeedback } from '../types';

const WritingPractice: React.FC = () => {
  // Data
  const categories = {
    HIRAGANA: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ'],
    KATAKANA: ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ'],
    KANJI_N5: ['日', '月', '火', '水', '木', '金', '土', '山', '川', '田', '人', '口', '車', '門', '女', '子', '学', '生', '先', '私']
  };

  // State
  const [category, setCategory] = useState<'HIRAGANA' | 'KATAKANA' | 'KANJI_N5'>('HIRAGANA');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);

  const currentChar = categories[category][currentCharIndex];

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Only set dimensions if they haven't been set correctly yet
    if (canvas.width !== rect.width * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#1e3a8a'; // Indigo 900
        }
    }
  }, [currentChar, category]); // Reset when char changes

  // Log history
  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      const score = interactionCountRef.current > 0 ? 100 : 0;
      if (duration > 5) {
        HistoryService.addLog('WRITING', duration, score);
      }
    };
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setFeedback(null);
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    e.preventDefault(); // Prevent scrolling on touch
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const handleCheck = async () => {
    if (isAnalyzing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAnalyzing(true);
    interactionCountRef.current += 1;

    try {
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const result = await GeminiService.evaluateHandwriting(base64, currentChar);
      setFeedback(result);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi chấm điểm. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextChar = () => {
    clearCanvas();
    setCurrentCharIndex((prev) => (prev + 1) % categories[category].length);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header & Tabs */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <PenTool className="text-indigo-500" /> Luyện Viết
        </h2>
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          {(Object.keys(categories) as Array<keyof typeof categories>).map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setCurrentCharIndex(0); clearCanvas(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                category === cat ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat === 'KANJI_N5' ? 'KANJI (N5)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-start space-y-4">
        
        <div className="relative w-[300px] h-[300px] bg-white rounded-2xl shadow-lg border-4 border-indigo-50 overflow-hidden touch-none">
            {/* Genkouyoushi Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full border-r border-gray-400 absolute left-1/2 transform -translate-x-1/2 border-dashed"></div>
                <div className="w-full h-full border-b border-gray-400 absolute top-1/2 transform -translate-y-1/2 border-dashed"></div>
                <div className="w-full h-full border border-indigo-200 m-2 box-border rounded-xl"></div>
            </div>

            {/* Guide Character (Watermark) */}
            {showGuide && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[200px] text-gray-200 font-serif select-none" style={{ fontFamily: '"Noto Serif JP", serif' }}>
                        {currentChar}
                    </span>
                </div>
            )}

            {/* Interactive Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-[300px]">
            <button 
                onClick={clearCanvas}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
            >
                <Eraser size={18} /> Xóa
            </button>
            <button 
                onClick={() => setShowGuide(!showGuide)}
                className={`flex-1 py-3 border rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                    showGuide ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-300 text-gray-400'
                }`}
            >
                Mẫu
            </button>
            <button 
                onClick={handleCheck}
                disabled={isAnalyzing}
                className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isAnalyzing ? <LoadingDots /> : <><CheckCircle size={18} /> Kiểm tra AI</>}
            </button>
        </div>

        {/* Feedback Area */}
        {feedback && (
            <div className="w-[300px] bg-white p-4 rounded-xl shadow-md border border-green-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800">Đánh giá</h3>
                    <span className={`text-lg font-black ${feedback.score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                        {feedback.score}/100
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 border-l-4 border-indigo-200 pl-2">
                    {feedback.feedback}
                </p>
                <div className="bg-gray-50 p-2 rounded-lg text-sm">
                    <span className="font-bold text-indigo-600">{feedback.exampleWord}</span>
                    <span className="text-gray-500"> - {feedback.exampleMeaning}</span>
                </div>
                <button 
                    onClick={nextChar}
                    className="w-full mt-4 py-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-1 transition"
                >
                    Chữ tiếp theo <ChevronRight size={16} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default WritingPractice;
