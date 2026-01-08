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

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const scrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTo({
        top: scrollHeight,
        behavior: behavior,
      });
    }
  };

  // Initial scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('auto'), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !sending) {
      setSending(true);
      onSendMessage(text);
      setText('');
      // Immediate scroll attempt
      setTimeout(() => {
        scrollToBottom('smooth');
        setSending(false);
      }, 50);
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
    <div className="flex flex-col h-full bg-[#fafafa] relative overflow-hidden">
      {/* Premium Header */}
      <div className="px-6 py-4 bg-white/70 backdrop-blur-3xl border-b border-gray-100/50 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
            {lang === 'ar' ? 'دردشة العائلة' : 'Family Chat'}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Kitchen Active</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 123}`} alt="" />
            </div>
          ))}
        </div>
      </div>

      {/* Gourmet Message List */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-5 py-8 space-y-4 hide-scrollbar pb-48"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-gray-100/50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gray-100">
              <ICONS.Chat className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Ready for dinner?</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const profile = msg.profile_data;
            const isLastInGroup = idx === messages.length - 1 || messages[idx+1].sender_id !== msg.sender_id;
            const isFirstInGroup = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;

            return (
              <div key={msg.id} className={`flex items-end gap-3 page-enter ${isMe ? 'flex-row-reverse' : ''} ${isFirstInGroup ? 'mt-6' : 'mt-1'}`}>
                {/* Avatar Column */}
                <div className="w-8 flex-shrink-0">
                  {!isMe && isLastInGroup && (
                    <img 
                      src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} 
                      className="w-8 h-8 rounded-xl shadow-md bg-white border border-gray-50" 
                      alt="" 
                    />
                  )}
                </div>

                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {isFirstInGroup && !isMe && (
                    <span className="text-[9px] font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-[0.15em]">
                      {profile?.name || 'Chef'}
                    </span>
                  )}
                  
                  <div className={`relative px-5 py-3.5 text-[14px] font-semibold leading-relaxed shadow-sm transition-all ${
                    isMe 
                      ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[1.6rem] rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-[1.6rem] rounded-bl-none'
                  } ${!isLastInGroup && (isMe ? 'rounded-br-[1.6rem]' : 'rounded-bl-[1.6rem]')}`}>
                    {msg.message}
                  </div>

                  {isLastInGroup && (
                    <span className={`text-[8px] font-black text-gray-300 mt-2 uppercase tracking-tighter ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Invisible anchor to help scrolling */}
        <div className="h-4 w-full" />
      </div>

      {/* Floating Glass Input - Fixed overlap by increasing list padding above */}
      <div className="fixed bottom-28 left-0 right-0 max-w-md mx-auto px-6 z-30">
        <form 
          onSubmit={handleSend} 
          className="glass p-2 rounded-[2.5rem] flex items-center gap-2 shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-white focus-within:ring-4 focus-within:ring-orange-100/30 transition-all group"
        >
          <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
             <ICONS.Plus className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'اكتب شيئاً...' : "Say something..."}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="flex-1 bg-transparent border-none px-2 py-2 text-sm font-bold focus:ring-0 placeholder:text-gray-300 text-gray-800" 
          />
          <button 
            type="submit" 
            disabled={!text.trim() || sending} 
            className="bg-orange-500 text-white w-11 h-11 rounded-full shadow-lg shadow-orange-200 flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all hover:bg-orange-600"
          >
            <ICONS.ChevronRight className={`w-5 h-5 stroke-[4px] ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;