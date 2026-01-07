import React, { useState, useRef, useEffect } from 'react';
import { Profile, ChatMessage, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface ChatProps {
  user: Profile;
  messages: ChatMessage[];
  lang: Language;
  onSendMessage: (text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ user, messages, lang, onSendMessage }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Professional Chat Auto-Scroll Logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    // Immediate scroll on first load
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    // Smooth scroll when messages arrive
    scrollToBottom('smooth');
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !sending) {
      setSending(true);
      onSendMessage(text);
      setText('');
      // Smooth scroll immediately after sending
      setTimeout(() => {
        scrollToBottom('smooth');
        setSending(false);
      }, 100);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Fixed Chat Sub-header */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">{t.familyChat}</h2>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Kitchen Active
          </p>
        </div>
      </div>

      {/* Message List Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth hide-scrollbar pb-32"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-20 py-20">
            <ICONS.Chat className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const profile = msg.profile_data;
            const showName = !isMe && (idx === 0 || messages[idx-1].sender_id !== msg.sender_id);
            const showTime = idx === messages.length - 1 || messages[idx+1].sender_id !== msg.sender_id;

            return (
              <div key={msg.id} className={`flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="flex-shrink-0 mb-1">
                    <img 
                      src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} 
                      className="w-8 h-8 rounded-xl shadow-sm bg-white object-cover border border-gray-100" 
                      alt="" 
                    />
                  </div>
                )}
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showName && (
                    <p className="text-[9px] font-black text-gray-400 mb-1 ml-1.5 uppercase tracking-widest">
                      {profile?.name || 'Chef'}
                    </p>
                  )}
                  <div className={`relative px-4 py-3 rounded-[1.6rem] text-sm font-bold shadow-sm leading-relaxed ${
                    isMe 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    {msg.message}
                  </div>
                  {showTime && (
                    <span className={`text-[8px] font-black text-gray-300 mt-1 uppercase tracking-tight ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Anchor for auto-scrolling if needed */}
        <div className="h-4 w-full"></div>
      </div>

      {/* Fixed Message Input Bar */}
      <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-6 py-4 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent z-20">
        <form onSubmit={handleSend} className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-2xl flex items-center gap-2 group focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'اكتب رسالة...' : "Message..."}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="flex-1 bg-transparent border-none rounded-2xl px-4 py-2 text-sm font-bold focus:ring-0 placeholder:text-gray-300 text-gray-800" 
          />
          <button 
            type="submit" 
            disabled={!text.trim() || sending} 
            className="bg-orange-500 text-white w-10 h-10 rounded-full shadow-lg shadow-orange-100 flex items-center justify-center disabled:opacity-50 active:scale-90 transition-all"
          >
            <ICONS.ChevronRight className={`w-5 h-5 stroke-[4px] ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;