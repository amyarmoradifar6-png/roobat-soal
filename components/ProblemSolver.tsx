
import React, { useState, useRef } from 'react';
import { solveProblem } from '../services/geminiService';

export const ProblemSolver: React.FC = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderContent = (text: string) => {
    if (!text) return null;
    const blockParts = text.split(/\$\$(.*?)\$\$/g);
    return blockParts.map((blockPart, blockIndex) => {
      if (blockIndex % 2 === 1) {
        if ((window as any).katex) {
          try {
            const html = (window as any).katex.renderToString(blockPart, {
              throwOnError: false,
              displayMode: true,
              output: 'html',
            });
            return <div key={`block-${blockIndex}`} className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) { return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>; }
        } else { return <div key={`block-${blockIndex}`} className="my-2 text-center code">{blockPart}</div>; }
      }
      const inlineParts = blockPart.split(/\$(.*?)\$/g);
      return (
        <span key={`text-${blockIndex}`}>
          {inlineParts.map((part, inlineIndex) => {
            if (inlineIndex % 2 === 1) {
              if ((window as any).katex) {
                try {
                  const html = (window as any).katex.renderToString(part, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html',
                  });
                  return <span key={`inline-${inlineIndex}`} className="mx-1 font-bold text-indigo-700 dark:text-indigo-300" dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) { return <code key={`inline-${inlineIndex}`} className="mx-1 bg-slate-100 dark:bg-slate-800 px-1 rounded dir-ltr">{part}</code>; }
              }
              return <code key={`inline-${inlineIndex}`}>{part}</code>;
            }
            if (part.includes('فرمول:') || part.includes('جایگذاری و محاسبات:') || part.includes('پاسخ:')) {
               return <strong key={`plain-${inlineIndex}`} className="block mt-4 mb-2 text-indigo-700 dark:text-indigo-400 text-lg">{part}</strong>;
            }
            return <span key={`plain-${inlineIndex}`}>{part}</span>;
          })}
        </span>
      );
    });
  };

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("متاسفانه مرورگر شما از تبدیل گفتار به متن پشتیبانی نمی‌کند.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProblem(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setSelectedImage({
          url: URL.createObjectURL(file),
          base64: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!problem.trim() && !selectedImage) return;
    
    setIsSolving(true);
    setSolution(null);
    try {
      const imageData = selectedImage ? { mimeType: selectedImage.mimeType, data: selectedImage.base64 } : undefined;
      // We pass generic 'درس' as subject context if not prop-drilled, or the model figures it out.
      const result = await solveProblem('درس', problem, imageData);
      setSolution(result);
    } catch (e) {
      setSolution('متاسفانه خطایی در حل مسئله رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsSolving(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">حل‌المسائل هوشمند</h2>
        <p className="text-indigo-100">صورت سوال خود را بنویسید، بگویید یا عکس آن را آپلود کنید.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors relative">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="مسئله خود را تایپ کنید یا دکمه میکروفون را بزنید..."
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
        />
        
        {selectedImage && (
          <div className="mt-4 relative inline-block">
            <img src={selectedImage.url} alt="Selected Problem" className="h-32 rounded-lg border border-slate-300 dark:border-slate-700" />
            <button 
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button onClick={handleToggleListening} className={`p-2.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-300 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`} title="تایپ صوتی">
              <svg xmlns="http://www.w3.org/2000/svg" fill={isListening ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="افزودن عکس">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <button onClick={handleSolve} disabled={(!problem.trim() && !selectedImage) || isSolving} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors flex items-center gap-2">
            {isSolving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>در حال حل مسئله...</span>
              </>
            ) : (
              <>
                <span>حل کن</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 rotate-180">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {solution && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
           <div className="prose prose-purple dark:prose-invert max-w-none whitespace-pre-wrap leading-loose text-slate-700 dark:text-slate-300">
             {renderContent(solution)}
           </div>
        </div>
      )}
    </div>
  );
};
