
import React from 'react';
import { AppRoute } from '../types';
import { MessageCircle, Mic, Home, PenTool, LayoutGrid } from 'lucide-react';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: Home, label: 'Trang chủ' },
    { route: AppRoute.ROLEPLAY, icon: MessageCircle, label: 'Hội thoại' },
    { route: AppRoute.PRONUNCIATION, icon: Mic, label: 'Phát âm' },
    { route: AppRoute.WRITING, icon: PenTool, label: 'Tập viết' },
    // Các module khác truy cập từ Home để menu gọn
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 ${
                isActive ? 'text-indigo-japan-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
