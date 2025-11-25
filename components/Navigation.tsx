
import React from 'react';
import { AppRoute } from '../types';
import { MessageCircle, Mic, Image, BookOpen, Home, PenTool } from 'lucide-react';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: Home, label: 'Trang chủ' },
    { route: AppRoute.ROLEPLAY, icon: MessageCircle, label: 'Hội thoại' },
    { route: AppRoute.PRONUNCIATION, icon: Mic, label: 'Phát âm' },
    { route: AppRoute.WRITING, icon: PenTool, label: 'Tập viết' }, // New item
    { route: AppRoute.VISUAL_DICT, icon: Image, label: 'Hình ảnh' },
    { route: AppRoute.KANJI_STORY, icon: BookOpen, label: 'Hán tự' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg pb-safe z-50 overflow-x-auto">
      <div className="flex justify-between items-center h-16 min-w-full md:max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center min-w-[50px] h-full transition-colors duration-200 ${
                isActive ? 'text-indigo-japan-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;