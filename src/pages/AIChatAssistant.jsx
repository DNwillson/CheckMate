import React, { useState } from 'react';
import { Send, X, Bot, User as UserIcon, Sparkles } from 'lucide-react';

const AIChatAssistant = ({ isOpen, onClose, theme }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm your AI travel assistant. Need help with your packing list?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');

    // 模擬 AI 回覆
    setTimeout(() => {
      setMessages([...newMsgs, { role: 'bot', content: "That's a great question! For this trip, I'd also recommend bringing a portable power bank." }]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/20 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white w-full h-[80%] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-float-up">
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${theme.primaryLight}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-white ${theme.primaryText}`}>
              <Bot size={24} />
            </div>
            <div>
              <h3 className={`font-bold ${theme.textMain}`}>AI Travel Mate</h3>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Powered by GPT-4</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center bg-white border rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-800 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 outline-none text-sm bg-transparent"
            />
            <button
              onClick={handleSend}
              className={`p-3 rounded-xl ${theme.primary} text-white shadow-lg active:scale-95 transition-all`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;