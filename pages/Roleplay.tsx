
import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import LoadingDots from '../components/LoadingDots';
import { HistoryService } from '../services/historyService';

const Roleplay: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'model', 
      text: 'こんにちは！田中先生です。',
      romaji: 'Konnichiwa! Tanaka-sensei desu.',
      translation: 'Xin chào! Tôi là Tanaka-sensei.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      if (duration > 5) HistoryService.addLog('ROLEPLAY', duration, Math.min(interactionCountRef.current * 10, 100));
    };
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    interactionCountRef.current += 1;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Sensei'}: ${m.text}`);
      const response = await GeminiService.chatWithSensei(history, userMsg.text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.japanese,
        romaji: response.romaji,
        translation: response.english
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16 bg-gray-50">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border-2 border-pink-200">田</div>
        <div><h2 className="font-bold text-gray-800">Tanaka-sensei</h2><p className="text-xs text-green-500">● Online</p></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
              <div className="flex justify-between items-start gap-2">
                <p className="text-base font-medium">{msg.text}</p>
                {msg.role === 'model' && (
                  <button onClick={() => speak(msg.text)} className="p-1 text-gray-400 hover:text-indigo-500"><Volume2 size={16} /></button>
                )}
              </div>
              {msg.romaji && <p className={`text-xs mt-1 italic ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>{msg.romaji}</p>}
              {msg.translation && <p className={`text-xs mt-2 pt-2 border-t opacity-80 ${msg.role === 'user' ? 'border-indigo-500' : 'border-gray-100'}`}>{msg.translation}</p>}
            </div>
          </div>
        ))}
        {isLoading && <div className="bg-white p-3 rounded-2xl w-16 shadow-sm"><LoadingDots /></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-3 border-t sticky bottom-16">
        <div className="flex gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tiếng Nhật..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roleplay;
