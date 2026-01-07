
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
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-gray-900 leading-tight">{t.familyChat}</h2>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 space-y-4 overflow-y-auto hide-scrollbar px-1 pb-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
            <ICONS.Chat className="w-16 h-16 mb-4" />
            <p className="font-medium">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            const profile = msg.profile_data;
            return (
              <div key={msg.id} className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} 
                  className="w-8 h-8 rounded-full shadow-sm bg-gray-50" 
                  alt="" 
                />
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && <p className="text-[10px] font-bold text-gray-400 mb-1 ml-1">{profile?.name || 'Family Member'}</p>}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 pb-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'اكتب رسالة...' : "Type a message..."}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-400" 
          />
          <button 
            type="submit" 
            disabled={!text.trim() || sending} 
            className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg disabled:opacity-50 active:scale-90 transition-transform"
          >
            <ICONS.ChevronRight className={`w-6 h-6 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
