/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Plus, History, Settings, Search, Menu, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const url = new URL('https://livegemini.fastdevelopers.workers.dev/chat');
      url.searchParams.append('message', input);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error connecting to the service. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/20 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-100/60 backdrop-blur-xl border-r border-slate-200/60 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <Sparkles size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Lumina AI</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-200 rounded-lg text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <button 
            onClick={() => { setMessages([]); setInput(''); setIsSidebarOpen(false); }}
            className="flex items-center gap-3 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200/50 shadow-sm rounded-2xl transition-all text-sm font-semibold mb-6 w-full text-slate-700 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} className="text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
            <span>New conversation</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">History</div>
            {messages.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-400 italic">No conversations yet</div>
            ) : (
              <div className="px-3 py-2 bg-slate-200/50 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-3 border border-slate-300/30">
                <History size={16} className="text-slate-400" />
                <span className="truncate">{messages[0].content.substring(0, 30)}...</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/60 space-y-1">
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-200/40 rounded-lg transition-colors text-sm text-slate-500 font-medium">
              <History size={18} />
              <span>Activity</span>
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-200/40 rounded-lg transition-colors text-sm text-slate-500 font-medium">
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button 
              onClick={clearChat}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-500 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 size={18} />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full bg-white">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-400"
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Lumina Pro</span>
              <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-indigo-100/50">API v1.4</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
              <Search size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={16} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="max-w-2xl mx-auto py-12 px-6 pb-40">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center min-h-[50vh] text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-8 shadow-xl shadow-indigo-200 transform rotate-6">
                    <Sparkles size={32} className="text-white" fill="currentColor" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 leading-tight">
                    How can I help you <br/><span className="text-indigo-600">today?</span>
                  </h2>
                  <p className="text-slate-500 text-lg max-w-md mx-auto mb-12">
                    Lumina provides precise answers and creative output using state-of-the-art language models.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left">
                    {[
                      { title: "Market Search", prompt: "Current price of gold in INR?" },
                      { title: "Technical Docs", prompt: "Explain how React hooks work with examples." }
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => { setInput(item.prompt); }}
                        className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">{item.title}</div>
                        <p className="text-[15px] text-slate-700 font-medium line-clamp-1">{item.prompt}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-12">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex gap-4 w-full ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          message.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600'
                        }`}>
                          {message.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={18} className="text-white" />}
                        </div>
                        
                        <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`${
                            message.role === 'user' 
                              ? 'bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl rounded-tr-none shadow-sm' 
                              : 'text-slate-700 bg-white p-1'
                          }`}>
                            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-[15px] prose-headings:font-bold prose-pre:bg-slate-900 prose-pre:rounded-xl">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mx-1 py-1">
                            {message.role === 'user' ? 'You' : 'Lumina'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 mt-8"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="flex-1 space-y-3 py-2 max-w-lg">
                  <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulseDELAY-1"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulseDELAY-2"></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <footer className="h-40 px-6 md:px-12 flex flex-col justify-center items-center pb-8 shrink-0 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-indigo-100/30 px-4 py-2.5 flex items-center gap-1 group focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            <button className="p-2.5 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
              <Plus size={24} />
            </button>
            
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-sm py-2 px-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all transform ${
                  input.trim() && !isLoading 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 scale-100 hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </form>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-medium">
            Lumina Pro may display inaccurate info, including about people, so double-check its responses.
          </p>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        
        @keyframes pulseDELAY-1 {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pulseDELAY-1 {
          animation: pulseDELAY-1 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.2s;
        }
        .animate-pulseDELAY-2 {
          animation: pulseDELAY-1 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.4s;
        }

        /* Light Theme Typography Tweaks */
        .prose pre {
          background: #0f172a !important;
          border-radius: 12px;
          padding: 1rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .prose code {
          background-color: #f1f5f9;
          color: #4f46e5;
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85em;
        }
        .prose code::before, .prose code::after {
          content: "";
        }
        .prose strong {
          color: #1e293b;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
