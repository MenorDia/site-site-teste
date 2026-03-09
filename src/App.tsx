import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, Tv, Users, Heart, Share2, MoreVertical, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Message {
  id: string;
  user: string;
  text: string;
  color: string;
  timestamp: string;
}

// --- Components ---

const StarryBackground = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            // @ts-ignore
            '--duration': star.duration,
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('starstream_nick'));
  const [nickInput, setNickInput] = useState('');
  const [userColor] = useState(['#ff4b4b', '#4bafff', '#4bff4b', '#ffff4b', '#ff4bff'][Math.floor(Math.random() * 5)]);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message].slice(-50)); // Keep last 50 messages
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const messageData = {
      user: userName,
      text: inputValue,
      color: userColor,
    };

    socketRef.current.emit('send_message', messageData);
    setInputValue('');
  };

  const handleSetNick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickInput.trim()) return;
    const cleanNick = nickInput.trim().substring(0, 20);
    setUserName(cleanNick);
    localStorage.setItem('starstream_nick', cleanNick);
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden flex flex-col">
      <StarryBackground />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-8 gap-6 items-center justify-center max-w-7xl mx-auto w-full">
        
        {/* Left Side: Video Area */}
        <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            <img 
              src="https://picsum.photos/seed/streamer/1280/720" 
              alt="Live Stream" 
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 flex gap-3">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Live</span>
              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                <Users className="w-4 h-4 text-cyan-400" />
                12,482
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-400/30 group-hover:scale-110 transition-all duration-500 group-hover:bg-cyan-500/20">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[22px] border-l-white border-b-[12px] border-b-transparent ml-1.5 drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <aside className="w-full md:w-96 h-[600px] md:h-full max-h-[80vh] flex flex-col glass-panel rounded-2xl border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm uppercase tracking-[0.2em]">
              <MessageSquare className="w-5 h-5" />
              Live Chat
            </div>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Users className="w-3 h-3" />
              <span>Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-relaxed group"
                >
                  <span className="font-bold mr-2 hover:underline cursor-pointer" style={{ color: msg.color }}>
                    {msg.user}
                  </span>
                  <span className="text-white/80 group-hover:text-white transition-colors">{msg.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            {userName ? (
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSetNick} className="flex flex-col gap-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Set a nickname to chat</p>
                <div className="relative">
                  <input
                    type="text"
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    placeholder="Your nickname..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                    maxLength={20}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
