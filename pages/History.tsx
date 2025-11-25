
import React, { useEffect, useState } from 'react';
import { StudyLog, ModuleType } from '../types';
import { HistoryService } from '../services/historyService';
import { Clock, Calendar, MessageCircle, Mic, Image, BookOpen } from 'lucide-react';
import LoadingDots from '../components/LoadingDots';

const History: React.FC = () => {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await HistoryService.getLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getModuleIcon = (type: ModuleType) => {
    switch (type) {
      case 'ROLEPLAY': return <MessageCircle size={18} className="text-pink-500" />;
      case 'PRONUNCIATION': return <Mic size={18} className="text-indigo-500" />;
      case 'VISUAL_DICT': return <Image size={18} className="text-green-500" />;
      case 'KANJI_STORY': return <BookOpen size={18} className="text-amber-500" />;
      default: return <Clock size={18} />;
    }
  };

  const getModuleLabel = (type: ModuleType) => {
     switch (type) {
      case 'ROLEPLAY': return 'Hội thoại';
      case 'PRONUNCIATION': return 'Phát âm';
      case 'VISUAL_DICT': return 'Dịch ảnh';
      case 'KANJI_STORY': return 'Hán tự';
      default: return 'Khác';
    }
  };

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}p ${s}s`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Lịch Sử Học Tập</h2>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
          <Clock size={64} className="mb-4" />
          <p>Chưa có dữ liệu học tập nào.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto no-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start gap-3">
                <div className="bg-gray-50 p-3 rounded-full mt-1">
                  {getModuleIcon(log.module_type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{getModuleLabel(log.module_type)}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(log.completed_at)}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(log.duration_sec)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 font-medium uppercase mb-0.5">Điểm số</span>
                  <span className={`text-lg font-bold ${log.accuracy_score >= 80 ? 'text-green-600' : log.accuracy_score >= 50 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {log.accuracy_score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
