
import React from 'react';
import { AppRoute } from '../types';
import { ArrowRight, Settings, Clock } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-8">
      <header className="pt-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-indigo-japan-900">
            Konnichiwa! <span className="inline-block animate-pulse">🌸</span>
          </h1>
          <p className="text-gray-600 mt-2">Sẵn sàng chinh phục tiếng Nhật chưa?</p>
        </div>
        
        {/* Utilities Shortcut */}
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(AppRoute.HISTORY)}
            className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
            aria-label="Lịch sử"
          >
            <Clock size={20} />
          </button>
          <button 
            onClick={() => onNavigate(AppRoute.SETTINGS)}
            className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
            aria-label="Cài đặt"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <section className="grid gap-4">
        {/* Module 1: Roleplay */}
        <div 
          onClick={() => onNavigate(AppRoute.ROLEPLAY)}
          className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-5 text-white shadow-lg cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
        >
          <h3 className="text-lg font-bold mb-1">Trò chuyện với Tanaka</h3>
          <p className="text-pink-100 text-sm mb-3">Luyện hội thoại & ngữ pháp</p>
          <div className="flex justify-between items-center">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">AI Roleplay</span>
            <ArrowRight size={20} />
          </div>
        </div>

        {/* Module 2: Pronunciation */}
        <div 
          onClick={() => onNavigate(AppRoute.PRONUNCIATION)}
          className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-md cursor-pointer hover:border-indigo-300 transition"
        >
          <h3 className="text-lg font-bold text-indigo-900 mb-1">AI Luyện Phát Âm</h3>
          <p className="text-gray-500 text-sm mb-3">Chỉnh sửa ngữ điệu chuẩn xác</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 w-3/4 h-full rounded-full"></div>
          </div>
        </div>

        {/* Module 3 & 4 Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div 
             onClick={() => onNavigate(AppRoute.VISUAL_DICT)}
             className="bg-indigo-50 rounded-2xl p-4 cursor-pointer hover:bg-indigo-100 transition"
          >
            <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mb-3 text-indigo-700 font-bold">
              📷
            </div>
            <h4 className="font-bold text-gray-800">Dịch Ảnh</h4>
            <p className="text-xs text-gray-500 mt-1">Học qua camera</p>
          </div>

          <div 
             onClick={() => onNavigate(AppRoute.KANJI_STORY)}
             className="bg-amber-50 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 transition"
          >
            <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center mb-3 text-amber-800 font-bold">
              字
            </div>
            <h4 className="font-bold text-gray-800">Chuyện Kanji</h4>
            <p className="text-xs text-gray-500 mt-1">Ghi nhớ vui vẻ</p>
          </div>
        </div>
      </section>

      <section 
        onClick={() => onNavigate(AppRoute.HISTORY)}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-200 transition"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tiến độ hôm nay</h3>
          <ArrowRight size={14} className="text-gray-400" />
        </div>
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-900">12</div>
            <div className="text-xs text-gray-400">Từ vựng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-900">85%</div>
            <div className="text-xs text-gray-400">Độ chính xác</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-900">5</div>
            <div className="text-xs text-gray-400">Chuỗi ngày</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
