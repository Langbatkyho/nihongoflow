import React, { useState } from 'react';
import { Key, ArrowRight, ExternalLink, Sparkles, LogIn, UserPlus, User, Lock, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';

interface LoginProps {
  onLogin: (apiKey: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'welcome' | 'auth'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (!username || !password || !apiKey) throw new Error('Vui lòng điền đầy đủ thông tin');
        if (!apiKey.startsWith('AIza')) throw new Error('API Key không đúng định dạng (phải bắt đầu bằng AIza)');

        const data = await AuthService.register(username, password, apiKey);
        onLogin(data.apiKey);
      } else {
        if (!username || !password) throw new Error('Vui lòng nhập tài khoản và mật khẩu');
        
        const data = await AuthService.login(username, password);
        onLogin(data.apiKey);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Màn hình 1: Welcome
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-sakura-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 text-pink-200 animate-pulse text-6xl opacity-50">🌸</div>
        <div className="absolute bottom-10 right-10 text-pink-200 animate-bounce text-6xl opacity-50">🌸</div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-sm w-full space-y-8 animate-in fade-in zoom-in duration-500 border border-white">
          <div className="space-y-4">
             <div className="w-20 h-20 bg-gradient-to-br from-indigo-japan-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
              <span className="text-4xl text-white font-bold">日</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NihongoFlow</h1>
              <p className="text-indigo-500 font-medium">Cloud Sync Enabled</p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Học tiếng Nhật mọi lúc mọi nơi. Dữ liệu của bạn được đồng bộ hóa an toàn trên đám mây.
            </p>
          </div>

          <button
            onClick={() => setStep('auth')}
            className="w-full group bg-indigo-japan-500 hover:bg-indigo-japan-900 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95"
          >
            <span className="text-lg">Bắt đầu ngay</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Màn hình 2: Auth
  return (
    <div className="min-h-screen bg-sakura-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full space-y-6 animate-in slide-in-from-right duration-300 border border-gray-100">
        
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('welcome')} className="text-gray-400 hover:text-gray-600">
            <ArrowRight className="rotate-180" size={20}/>
          </button>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-400'}`}
            >
              Đăng nhập
            </button>
             <button 
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${authMode === 'register' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-400'}`}
            >
              Đăng ký
            </button>
          </div>
          <div className="w-5"></div>
        </div>

        <div className="text-left space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {authMode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-sm text-gray-500">
            {authMode === 'login' ? 'Đăng nhập để đồng bộ dữ liệu.' : 'Dữ liệu được lưu trữ an toàn trên Supabase.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-bold text-gray-600 ml-1 uppercase">Tên đăng nhập</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-japan-500 transition text-gray-900 placeholder-gray-400"
                placeholder="Username"
                disabled={isLoading}
              />
            </div>
          </div>

           <div className="text-left">
            <label className="text-xs font-bold text-gray-600 ml-1 uppercase">Mật khẩu</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-japan-500 transition text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="text-left animate-in fade-in zoom-in duration-300">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase flex justify-between">
                <span>Google API Key</span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-500 hover:underline flex items-center gap-1">Lấy Key <ExternalLink size={10}/></a>
              </label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-japan-500 transition font-mono text-gray-900 placeholder-gray-400"
                  placeholder="AIzaSy..."
                  disabled={isLoading}
                />
              </div>
              <div className="bg-blue-50 p-2 rounded-lg mt-2 flex gap-2 items-start">
                 <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                 <p className="text-[10px] text-blue-700 leading-snug">
                   Key được mã hóa an toàn (AES-256) trước khi lưu vào Database.
                 </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2 text-red-600 text-xs font-medium">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-japan-500 hover:bg-indigo-japan-900 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <span className="animate-pulse">Đang xử lý...</span>
            ) : (
              authMode === 'login' ? <><LogIn size={18} /> Đăng nhập</> : <><UserPlus size={18} /> Tạo tài khoản</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;