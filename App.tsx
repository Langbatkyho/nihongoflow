
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Roleplay from './pages/Roleplay';
import Pronunciation from './pages/Pronunciation';
import VisualDictionary from './pages/VisualDictionary';
import KanjiStory from './pages/KanjiStory';
import WritingPractice from './pages/WritingPractice';
import QuizModule from './pages/QuizModule';
import Phrasebook from './pages/Phrasebook';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './components/Login';
import { AppRoute } from './types';
import { GeminiService } from './services/geminiService';
import { AuthService } from './services/authService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    const apiKey = localStorage.getItem('gemini_api_key');
    if (user && apiKey) {
      GeminiService.initialize(apiKey);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (apiKey: string) => {
    localStorage.setItem('gemini_api_key', apiKey); 
    GeminiService.initialize(apiKey);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRoute(AppRoute.HOME);
  };

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME: return <Home onNavigate={setCurrentRoute} />;
      case AppRoute.ROLEPLAY: return <Roleplay />;
      case AppRoute.PRONUNCIATION: return <Pronunciation />;
      case AppRoute.WRITING: return <WritingPractice />;
      case AppRoute.VISUAL_DICT: return <VisualDictionary />;
      case AppRoute.KANJI_STORY: return <KanjiStory />;
      case AppRoute.LISTENING: return <QuizModule type="LISTENING" title="Luyện Nghe N5/N4" />;
      case AppRoute.GRAMMAR: return <QuizModule type="GRAMMAR" title="Luyện Ngữ Pháp" />;
      case AppRoute.TEST: return <QuizModule type="TEST" title="Kiểm Tra Tổng Hợp" />;
      case AppRoute.PHRASEBOOK: return <Phrasebook />;
      case AppRoute.HISTORY: return <History />;
      case AppRoute.SETTINGS: return <Settings onLogout={handleLogout} />;
      default: return <Home onNavigate={setCurrentRoute} />;
    }
  };

  if (!isAuthenticated) return <Login onLogin={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-sakura-50 font-sans text-gray-800">
      {renderPage()}
      <Navigation currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
