
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  initialPrompt?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'سلام! من دستیار آموزشی تو هستم. چطور می‌تونم امروز کمکت کنم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessedInitial, setHasProcessedInitial] = useState(false);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session only once
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession('درس'); // Default generic subject
    }
  }, []);

  // Handle Initial Prompt (e.g., from Chapter Detail buttons)
  useEffect(() => {
    if (initialPrompt && !hasProcessedInitial && chatSessionRef.current) {
      setHasProcessedInitial(true);
      
      // Simulate user sending the prompt
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: initialPrompt
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      chatSessionRef.current.sendMessageStream({ message: initialPrompt })
        .then(async (result: any) => {
           const modelMsgId = (Date.now() + 1).toString();
           let fullText = '';
           setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isLoading: true }]);

           for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            const text = c.text || '';
            fullText += text;
            setMessages(prev => prev.map(msg => 
              msg.id === modelMsgId ? { ...msg, text: fullText, isLoading: false } : msg
            ));
           }
        })
        .catch((err: any) => {
          console.error(err);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'متاسفانه در پردازش درخواست مشکلی پیش آمد.' }]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialPrompt, hasProcessedInitial]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const modelMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add placeholder message
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isLoading: true }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullText, isLoading: false } : msg
        ));
      }
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'متاسفانه ارتباط قطع شد. لطفا دوباره تلاش کنید.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors animate-fade-up">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white rounded-tr-sm animate-slide-in-right'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm animate-slide-in-left'
              }`}
            >
              {msg.text || (msg.isLoading && <span className="animate-pulse">در حال نوشتن...</span>)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="سوال خود را اینجا بنویسید..."
            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder-slate-400 dark:placeholder-slate-500"
            dir="auto"
          />
        </div>
      </div>
    </div>
  );
};