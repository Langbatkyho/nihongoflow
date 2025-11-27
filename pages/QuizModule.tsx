
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { QuizQuestion, ModuleType } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';
import { Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizModuleProps {
  type: 'LISTENING' | 'GRAMMAR' | 'TEST';
  title: string;
}

const QuizModule: React.FC<QuizModuleProps> = ({ type, title }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    loadQuestions();
  }, [type]);

  const loadQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    try {
      const data = await GeminiService.generateQuiz(type, 'N5');
      setQuestions(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFinish = () => {
    setShowResult(true);
    const accuracy = Math.round((score / questions.length) * 100);
    HistoryService.addLog(type as ModuleType, (Date.now() - startTimeRef.current) / 1000, accuracy);
  };

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === questions[currentIdx].correctIndex) setScore(s => s + 1);
  };

  const nextQ = () => {
    setSelectedOpt(null);
    if (currentIdx < questions.length - 1) setCurrentIdx(c => c + 1);
    else handleFinish();
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><LoadingDots /></div>;

  if (showResult) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
       <h2 className="text-3xl font-bold text-indigo-900 mb-2">Hoàn thành!</h2>
       <div className="text-6xl font-black text-indigo-600 mb-4">{Math.round((score/questions.length)*100)}%</div>
       <p className="text-gray-600 mb-6">Bạn trả lời đúng {score}/{questions.length} câu.</p>
       <button onClick={loadQuestions} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold flex items-center gap-2"><RotateCcw size={20}/> Làm lại</button>
    </div>
  );

  const q = questions[currentIdx];

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex-1 flex flex-col justify-center">
        {/* Question Area */}
        <div className="text-center mb-8">
           {q.type === 'audio' ? (
              <div className="flex flex-col items-center">
                <button onClick={() => speak(q.question)} className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 hover:bg-indigo-200 transition-colors">
                   <Volume2 size={40} className="text-indigo-600" />
                </button>
                <span className="text-sm font-bold text-indigo-600">Nghe đoạn hội thoại</span>
              </div>
           ) : (
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 justify-center">
                   <h3 className="text-2xl font-bold text-gray-800">{q.question}</h3>
                   <button onClick={() => speak(q.question)} className="p-2 text-indigo-500 bg-indigo-50 rounded-full hover:bg-indigo-100">
                     <Volume2 size={20} />
                   </button>
                </div>
                {q.questionRomaji && <p className="text-gray-500 italic">{q.questionRomaji}</p>}
             </div>
           )}
        </div>

        {/* Options Area */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let stateClass = "bg-gray-50 border-gray-200 text-gray-700";
            if (selectedOpt !== null) {
              if (i === q.correctIndex) stateClass = "bg-green-100 border-green-500 text-green-800";
              else if (i === selectedOpt) stateClass = "bg-red-100 border-red-500 text-red-800";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={selectedOpt !== null} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${stateClass} ${selectedOpt === null ? 'hover:border-indigo-300' : ''}`}>
                <div className="font-medium text-lg">{opt}</div>
                {q.optionsRomaji && q.optionsRomaji[i] && (
                  <div className={`text-xs italic mt-1 ${selectedOpt !== null ? 'opacity-80' : 'text-gray-500'}`}>{q.optionsRomaji[i]}</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedOpt !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
           <div className={`p-4 rounded-xl mb-4 ${selectedOpt === q.correctIndex ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                 {selectedOpt === q.correctIndex ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                 {selectedOpt === q.correctIndex ? 'Chính xác!' : 'Chưa đúng rồi.'}
              </div>
              <p className="text-sm">{q.explanation}</p>
           </div>
           <button onClick={nextQ} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">Tiếp theo <ArrowRight size={20}/></button>
        </div>
      )}
    </div>
  );
};

export default QuizModule;
