
import React, { useEffect, useState } from 'react';
import { Trash2, LogOut, Info, Shield, User, Cloud } from 'lucide-react';
import { AuthService } from '../services/authService';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [username, setUsername] = useState<string>('Khách');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
  }

  return (
    <div className="flex flex-col h-screen pb-20 bg-gray-50 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6">Cài đặt</h2>

      <div className="space-y-4">
        {/* User Profile Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
             <User size={24} />
           </div>
           <div>
             <p className="text-xs text-gray-500 font-bold uppercase">Tài khoản</p>
             <h3 className="font-bold text-gray-800 text-lg">{username}</h3>
           </div>
        </div>

        {/* Security / Cloud */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <Cloud size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Đồng bộ đám mây</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Dữ liệu học tập và API Key của bạn được lưu trữ an toàn trên Supabase (Cloud Database).
          </p>
           <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2">
             <Shield size={12} />
             <span>Mã hóa AES-256 kích hoạt</span>
           </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Info size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Thông tin ứng dụng</h3>
          </div>
          <p className="text-sm text-gray-600">
            NihongoFlow v1.4 (Cloud)<br/>
            Sử dụng Google Gemini 2.5 Flash
          </p>
        </div>

        {/* Actions */}
        <button 
          onClick={handleLogout}
          className="w-full bg-indigo-100 p-4 rounded-xl shadow-sm border border-indigo-200 flex items-center gap-3 text-indigo-700 hover:bg-indigo-200 transition mt-6"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
