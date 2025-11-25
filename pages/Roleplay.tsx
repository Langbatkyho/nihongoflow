
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
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
      text: 'こんにちは！田中先生です。日本語を勉強しましょう！',
      translation: 'Xin chào! Tôi là Tanaka-sensei. Hãy cùng học tiếng Nhật nào!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tracking refs
  const startTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Log on Unmount
  useEffect(() => {
    return () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      // Simple scoring: 10 points per interaction, max 100
      const score = Math.min(interactionCountRef.current * 10, 100);
      
      // Only log if they actually participated (duration > 5s)
      if (duration > 5) {
        HistoryService.addLog('ROLEPLAY', duration, score);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    interactionCountRef.current += 1; // Increment interaction count

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history string for context
      const history = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tanaka'}: ${m.text}`);
      
      const response = await GeminiService.chatWithSensei(history, userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.japanese,
        translation: response.english
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: 'Xin lỗi, tôi đang gặp chút sự cố khi suy nghĩ. Hãy thử lại nhé.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border-2 border-pink-200">
          田
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Tanaka-sensei</h2>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Trực tuyến
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {msg.translation && (
                <p className="text-xs mt-2 pt-2 border-t border-gray-100/30 opacity-80 italic">
                  {msg.translation}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white rounded-2xl p-3 shadow-sm rounded-bl-none">
               <LoadingDots />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-200 sticky bottom-16">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tiếng Nhật hoặc Romaji..."
            className="flex-1 bg-white border border-gray-200 text-gray-900 placeholder-gray-500 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roleplay;
