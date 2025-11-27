
import React from 'react';
import { AppRoute } from '../types';
import { Settings, Clock, PenTool, Ear, Book, BookOpen, GraduationCap, Image, MessageCircle } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const modules = [
    { route: AppRoute.LISTENING, icon: Ear, label: 'Luyện Nghe', color: 'bg-blue-500' },
    { route: AppRoute.GRAMMAR, icon: Book, label: 'Ngữ Pháp', color: 'bg-green-500' },
    { route: AppRoute.PHRASEBOOK, icon: BookOpen, label: 'Mẫu Câu', color: 'bg-orange-500' },
    { route: AppRoute.TEST, icon: GraduationCap, label: 'Kiểm Tra', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-6">
      <header className="pt-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-indigo-japan-900">
            Konnichiwa! <span className="inline-block animate-pulse">🌸</span>
          </h1>
          <p className="text-gray-600 mt-1">Hôm nay bạn muốn học gì?</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate(AppRoute.HISTORY)} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-indigo-600">
            <Clock size={20} />
          </button>
          <button onClick={() => onNavigate(AppRoute.SETTINGS)} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-indigo-600">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section - Core Modules */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => onNavigate(AppRoute.ROLEPLAY)} className="col-span-2 bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-5 text-white shadow-md cursor-pointer relative overflow-hidden">
          <MessageCircle className="absolute right-4 bottom-4 opacity-20" size={64} />
          <h3 className="text-xl font-bold mb-1">Hội Thoại AI</h3>
          <p className="text-pink-100 text-sm">Trò chuyện với Tanaka-sensei</p>
        </div>

        <div onClick={() => onNavigate(AppRoute.VISUAL_DICT)} className="bg-indigo-50 rounded-2xl p-4 cursor-pointer hover:bg-indigo-100 transition shadow-sm">
          <Image className="text-indigo-500 mb-2" size={32} />
          <h4 className="font-bold text-gray-800">Dịch Ảnh</h4>
        </div>

        <div onClick={() => onNavigate(AppRoute.KANJI_STORY)} className="bg-amber-50 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 transition shadow-sm">
          <span className="text-3xl mb-2 block">字</span>
          <h4 className="font-bold text-gray-800">Chuyện Kanji</h4>
        </div>
      </div>

      {/* New Modules Grid */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3">Luyện tập & Kiểm tra</h3>
        <div className="grid grid-cols-4 gap-3">
          {modules.map((m) => (
            <div key={m.label} onClick={() => onNavigate(m.route)} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className={`${m.color} text-white p-3.5 rounded-2xl shadow-md transform active:scale-95 transition`}>
                <m.icon size={22} />
              </div>
              <span className="text-[11px] font-medium text-gray-600 text-center">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      
       {/* Writing Banner */}
       <div onClick={() => onNavigate(AppRoute.WRITING)} className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
               <PenTool size={20} />
            </div>
            <div>
              <h4 className="font-bold text-teal-900">Luyện viết Kana/Kanji</h4>
              <p className="text-xs text-teal-600">Có hướng dẫn thứ tự nét</p>
            </div>
          </div>
       </div>

    </div>
  );
};

export default Home;
