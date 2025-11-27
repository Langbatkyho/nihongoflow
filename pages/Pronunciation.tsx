
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Sparkles } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { PronunciationFeedback } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const Pronunciation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetSentence, setTargetSentence] = useState<{japanese: string, romaji: string, meaning: string} | null>(null);
  const [loadingSentence, setLoadingSentence] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Tự động lấy câu mẫu khi vào trang nếu chưa có
    if (!targetSentence) getSample();

    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      if (duration > 5) HistoryService.addLog('PRONUNCIATION', duration, feedback?.score || 0);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        analyzeAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) { alert("Cần quyền truy cập Micro."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      // Pass the target sentence if available for better accuracy
      const result = await GeminiService.analyzeAudio(base64, targetSentence?.japanese);
      setFeedback(result);
      setIsAnalyzing(false);
    };
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  const getSample = async () => {
    setLoadingSentence(true);
    setFeedback(null);
    try {
      const data = await GeminiService.getShadowingSentence();
      setTargetSentence(data);
    } catch(e) { console.error(e) } finally { setLoadingSentence(false); }
  }

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Luyện Phát Âm</h2>
      
      <div className="flex-1 flex flex-col items-center justify-start space-y-6 overflow-y-auto no-scrollbar pb-10">
        
        {/* Sample Section (Shadowing) */}
        <div className="w-full bg-indigo-50 rounded-2xl p-4 border border-indigo-100 relative">
           <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1">
             <Volume2 size={12} /> Shadowing (Luyện nói đuổi)
           </h3>
           {loadingSentence ? (
             <LoadingDots /> 
           ) : targetSentence ? (
             <div className="text-center">
               <p className="text-xl font-bold text-gray-800 mb-1 leading-relaxed">{targetSentence.japanese}</p>
               <p className="text-sm text-gray-500 italic mb-3">{targetSentence.romaji}</p>
               <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-indigo-200">{targetSentence.meaning}</p>
               <button onClick={() => speak(targetSentence.japanese)} className="flex items-center gap-2 mx-auto bg-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow hover:bg-indigo-700 transition transform active:scale-95">
                 <Volume2 size={20} /> NGHE AI ĐỌC MẪU
               </button>
             </div>
           ) : (
             <div className="text-center py-4 text-gray-400 text-sm">
               Nhấn nút bên dưới để lấy câu mẫu.
             </div>
           )}
           <button onClick={getSample} className="absolute top-2 right-2 p-2 text-indigo-400 hover:text-indigo-600 bg-white rounded-full shadow-sm">
             <Sparkles size={16} />
           </button>
        </div>

        {/* Recording Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all cursor-pointer ${isRecording ? 'bg-red-50 border-4 border-red-500 shadow-xl' : 'bg-white border-4 border-gray-200 hover:border-indigo-200'}`} onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? <div className="animate-pulse w-12 h-12 bg-red-500 rounded-full" /> : <Mic size={48} className="text-gray-300" />}
          </div>
          <p className="text-sm text-gray-400 font-medium">{isRecording ? 'Đang ghi âm...' : 'Chạm để nói'}</p>
        </div>

        {isAnalyzing && <div className="text-center"><LoadingDots /><p className="text-sm text-indigo-600">AI đang chấm điểm...</p></div>}
        
        {feedback && !isAnalyzing && (
          <div className="w-full bg-white p-5 rounded-xl shadow-md border border-gray-100 space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Kết quả</h3>
              <span className={`text-xl font-bold ${feedback.score >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{feedback.score}/100</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Bạn nói</p>
              <p className="text-lg">{feedback.transcription}</p>
              <p className="text-sm text-gray-500 italic">{feedback.romaji}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg"><p className="text-sm text-indigo-800">{feedback.feedback}</p></div>
            <div>
              <div className="flex justify-between items-center">
                 <p className="text-xs text-gray-500 uppercase font-bold">Gợi ý</p>
                 <button onClick={() => speak(feedback.nativeExample)} className="text-indigo-500"><Volume2 size={16} /></button>
              </div>
              <p className="text-lg">{feedback.nativeExample}</p>
              <p className="text-sm text-gray-500 italic">{feedback.exampleRomaji}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pronunciation;
