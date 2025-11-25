
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, PlayCircle, Award, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { PronunciationFeedback } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const Pronunciation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Tracking
  const startTimeRef = useRef(Date.now());
  const scoresRef = useRef<number[]>([]);

  // Handle Log on Unmount
  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      // Average score or 0
      const avgScore = scoresRef.current.length > 0
        ? scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length
        : 0;

      if (duration > 5) {
         HistoryService.addLog('PRONUNCIATION', duration, avgScore);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Vui lòng cấp quyền truy cập microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        const result = await GeminiService.analyzeAudio(base64Data);
        setFeedback(result);
        
        // Add score to tracker
        scoresRef.current.push(result.score);
        
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Luyện Phát Âm</h2>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        
        {/* Recording Visualizer */}
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-50 border-4 border-red-500 shadow-xl' : 'bg-white border-4 border-gray-200'}`}>
          {isRecording ? (
            <div className="flex items-end space-x-1 h-12">
              <div className="w-2 bg-red-500 rounded-full animate-[bounce_1s_infinite] h-8"></div>
              <div className="w-2 bg-red-500 rounded-full animate-[bounce_1.2s_infinite] h-12"></div>
              <div className="w-2 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] h-6"></div>
              <div className="w-2 bg-red-500 rounded-full animate-[bounce_1.1s_infinite] h-10"></div>
            </div>
          ) : (
            <Mic size={64} className="text-gray-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Mic size={20} /> Ghi âm
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <Square size={20} fill="currentColor" /> Dừng
            </button>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && !isRecording && (
          <audio controls src={audioUrl} className="w-full mt-4" />
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center p-4">
            <LoadingDots />
            <p className="text-indigo-600 mt-2 text-sm">Đang phân tích...</p>
          </div>
        )}
        
        {/* Feedback */}
        {feedback && !isAnalyzing && (
          <div className="w-full bg-white p-4 rounded-xl shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Kết quả</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${feedback.score >= 80 ? 'bg-green-100 text-green-700' : feedback.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {feedback.score}/100
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Bạn nói</p>
                <p className="text-gray-800">{feedback.transcription}</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="flex gap-2 items-start mb-1">
                   <Award size={16} className="text-indigo-600 mt-0.5" />
                   <p className="text-sm font-bold text-indigo-900">Nhận xét</p>
                </div>
                <p className="text-sm text-indigo-800">{feedback.feedback}</p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                 <div className="flex gap-2 items-start mb-1">
                   <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                   <p className="text-sm font-bold text-orange-900">Lời khuyên</p>
                </div>
                <p className="text-sm text-orange-800">{feedback.advice}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Người bản xứ nói</p>
                <div className="flex items-center gap-2 mt-1">
                  <PlayCircle size={20} className="text-indigo-400" />
                  <p className="text-gray-800 italic">{feedback.nativeExample}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pronunciation;
