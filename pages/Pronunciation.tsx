
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { PronunciationFeedback } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const Pronunciation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      if (duration > 5) HistoryService.addLog('PRONUNCIATION', duration, feedback?.score || 0);
    };
  }, [feedback]);

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
      const result = await GeminiService.analyzeAudio(base64);
      setFeedback(result);
      setIsAnalyzing(false);
    };
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Luyện Phát Âm</h2>
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-50 border-4 border-red-500 shadow-xl' : 'bg-white border-4 border-gray-200'}`}>
          {isRecording ? <div className="animate-pulse w-16 h-16 bg-red-500 rounded-full" /> : <Mic size={64} className="text-gray-300" />}
        </div>
        <button onClick={isRecording ? stopRecording : startRecording} className={`px-8 py-3 rounded-full font-bold text-white shadow-lg ${isRecording ? 'bg-red-500' : 'bg-indigo-600'}`}>
          {isRecording ? 'Dừng lại' : 'Bắt đầu nói'}
        </button>

        {isAnalyzing && <div className="text-center"><LoadingDots /><p className="text-sm text-indigo-600">Đang phân tích...</p></div>}
        
        {feedback && !isAnalyzing && (
          <div className="w-full bg-white p-5 rounded-xl shadow-md border border-gray-100 space-y-4">
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
                 <p className="text-xs text-gray-500 uppercase font-bold">Mẫu câu</p>
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
