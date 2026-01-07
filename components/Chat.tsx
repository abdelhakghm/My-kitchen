
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !sending) {
      setSending(true);
      onSendMessage(text);
      setText('');
      // Reset sending state shortly after
      setTimeout(() => setSending(false), 500);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tighter">{t.familyChat}</h2>
        <div className="h-1 w-10 bg-orange-500 mt-2 rounded-full opacity-20"></div>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 space-y-6 overflow-y-auto hide-scrollbar px-1 pb-10"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-20">
            <div className="p-6 bg-gray-100 rounded-[2.5rem] mb-4">
              <ICONS.Chat className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">Silent Kitchen</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const profile = msg.profile_data;
            const showName = !isMe && (idx === 0 || messages[idx-1].sender_id !== msg.sender_id);

            return (
              <div key={msg.id} className={`flex items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  <img 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} 
                    className="w-10 h-10 rounded-[1.2rem] shadow-sm bg-gray-50 object-cover ring-2 ring-white" 
                    alt="" 
                  />
                </div>
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showName && (
                    <p className="text-[10px] font-black text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">
                      {profile?.name || 'Chef'}
                    </p>
                  )}
                  <div className={`px-5 py-3.5 rounded-[1.8rem] text-sm font-medium shadow-sm leading-relaxed transition-all duration-300 ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-gray-200/50'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 pb-4 animate-in slide-in-from-bottom duration-500">
        <div className="flex gap-3 bg-gray-50 p-2 rounded-[2.2rem] border border-gray-100 focus-within:bg-white focus-within:border-orange-200 transition-all duration-300 shadow-inner shadow-gray-100">
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'اكتب رسالة...' : "Message family..."}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="flex-1 bg-transparent border-none rounded-3xl px-5 py-3 text-sm font-bold focus:ring-0 placeholder:text-gray-300 text-gray-800" 
          />
          <button 
            type="submit" 
            disabled={!text.trim() || sending} 
            className="bg-orange-500 text-white w-12 h-12 rounded-full shadow-lg shadow-orange-200 flex items-center justify-center disabled:opacity-50 active:scale-90 transition-all transform"
          >
            <ICONS.ChevronRight className={`w-6 h-6 stroke-[3px] ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
