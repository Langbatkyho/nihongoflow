
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Roleplay from './pages/Roleplay';
import Pronunciation from './pages/Pronunciation';
import VisualDictionary from './pages/VisualDictionary';
import KanjiStory from './pages/KanjiStory';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './components/Login';
import { AppRoute } from './types';
import { GeminiService } from './services/geminiService';
import { AuthService } from './services/authService';

const App: React.FC = () => {
  // Thay vì chỉ lưu key, ta kiểm tra user session
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    // Chúng ta cần API Key để chạy app. Nếu user đã đăng nhập nhưng mất key (F5), 
    // luồng login sẽ tự động xử lý. Ở đây giả định nếu có user thì đã có key.
    // Tuy nhiên, vì key được trả về từ login và không lưu persistent lâu dài (tùy security policy),
    // trong bản demo này ta vẫn lưu key ở localStorage để tiện reload.
    const apiKey = localStorage.getItem('gemini_api_key');
    
    if (user && apiKey) {
      GeminiService.initialize(apiKey);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (apiKey: string) => {
    // Key được trả về từ server sau khi decrypt
    localStorage.setItem('gemini_api_key', apiKey); 
    GeminiService.initialize(apiKey);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRoute(AppRoute.HOME);
    // AuthService.logout() đã được gọi trong component Settings
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Home onNavigate={setCurrentRoute} />;
      case AppRoute.ROLEPLAY:
        return <Roleplay />;
      case AppRoute.PRONUNCIATION:
        return <Pronunciation />;
      case AppRoute.VISUAL_DICT:
        return <VisualDictionary />;
      case AppRoute.KANJI_STORY:
        return <KanjiStory />;
      case AppRoute.HISTORY:
        return <History />;
      case AppRoute.SETTINGS:
        return <Settings onLogout={handleLogout} />;
      default:
        return <Home onNavigate={setCurrentRoute} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-sakura-50 font-sans text-gray-800">
      {renderPage()}
      <Navigation currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
