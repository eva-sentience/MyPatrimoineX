import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { generateFinancialAdvice } from '../services/geminiService';
import { Asset, ChatMessage } from '../types';
import { storageService } from '../services/storageService';

interface GeminiChatProps {
  assets: Asset[];
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ assets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(storageService.getChatHistory());
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        storageService.saveChatHistory(messages);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const apiHistory = messages.map(m => ({ role: m.role, text: m.text }));

    const responseText = await generateFinancialAdvice(userMsg.text, assets, apiHistory);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <>
       {/* Toggle Button (Visible when closed) */}
       {!isOpen && (
         <button 
           onClick={() => setIsOpen(true)}
           className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 border border-white/20 group"
         >
           <Sparkles className="text-white group-hover:rotate-12 transition-transform" />
         </button>
       )}

       {/* Chat Interface */}
       <div className={`fixed bottom-6 right-6 w-96 bg-obsidian border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'h-[600px] opacity-100 scale-100' : 'h-0 w-0 opacity-0 scale-90 pointer-events-none'}`}>
          
          {/* Header */}
          <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
             <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <span className="font-semibold text-white">Patrimoine AI</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
             {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 px-4">
                   <p className="text-sm">Bonjour ! Je suis votre assistant patrimonial privé.</p>
                   <p className="text-xs mt-2">Je peux analyser votre portefeuille, expliquer des concepts financiers ou discuter des tendances. Vos données restent locales.</p>
                </div>
             )}
             {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-gray-200 border border-white/5 rounded-bl-none'
                   }`}>
                      {msg.text}
                   </div>
                </div>
             ))}
             {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                      <Loader2 size={16} className="animate-spin text-purple-400" />
                      <span className="text-xs text-gray-400">Réflexion...</span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-obsidian border-t border-white/10">
             <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez une question..."
                  className="w-full bg-gray-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-purple-500 outline-none focus:ring-1 focus:ring-purple-500 transition"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-purple-600 rounded-lg text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                   <Send size={16} />
                </button>
             </div>
             <p className="text-[10px] text-center text-gray-600 mt-2">
               L'IA fournit des informations éducatives, pas de conseil financier.
             </p>
          </div>
       </div>
    </>
  );
};