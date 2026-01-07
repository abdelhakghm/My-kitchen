
import React, { useState } from 'react';
import { Profile, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface ProfileProps {
  user: Profile;
  lang: Language;
  onLogout: () => void;
  onToggleLang: () => void;
}

const ProfileView: React.FC<ProfileProps> = ({ user, lang, onLogout, onToggleLang }) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const isRTL = lang === 'ar';

  const copyFamilyCode = () => {
    if (user.family_code) {
      navigator.clipboard.writeText(user.family_code.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">{t.settings}</h2>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center mb-6">
        <div className="relative inline-block">
          <img src={user.avatar_url} className="w-24 h-24 rounded-[2rem] mx-auto shadow-xl mb-4 bg-gray-50 ring-4 ring-orange-50" alt="" />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h3>
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-2 bg-orange-50 inline-block px-3 py-1 rounded-lg">{user.role}</p>
      </div>

      <div className="mb-6 p-6 bg-orange-50 rounded-[2.5rem] border border-orange-100/50">
        <div className={`flex justify-between items-start mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">
              {lang === 'ar' ? 'رمز العائلة' : 'Family Kitchen Code'}
            </p>
            <p className="text-2xl font-black text-orange-600 tracking-tighter uppercase font-mono">
              {user.family_code}
            </p>
          </div>
          <button 
            onClick={copyFamilyCode}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-90 ${
              copied ? 'bg-green-500 text-white' : 'bg-white text-orange-500 shadow-sm border border-orange-200'
            }`}
          >
            {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied!') : (lang === 'ar' ? 'Copy' : 'Copy')}
          </button>
        </div>
        <p className="text-xs text-orange-400/80 leading-relaxed italic font-medium">
          {lang === 'ar' 
            ? 'شارك هذا الرمز مع عائلتك ليتمكنوا من الانضمام إلى مطبخك.' 
            : 'Share this code with your family members so they can join your kitchen.'}
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onToggleLang}
          className={`w-full flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl font-black text-xs text-gray-700 hover:bg-gray-50 transition-all shadow-sm uppercase tracking-widest ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <span className="text-lg">🌐</span> {t.language}
          </span>
          <span className="text-orange-500">
            {lang === 'en' ? 'Arabic' : 'English'}
          </span>
        </button>
        
        <button 
          onClick={onLogout}
          className={`w-full flex items-center justify-between p-5 bg-white border border-red-50 rounded-2xl font-black text-xs text-red-600 mt-8 hover:bg-red-50 transition-all shadow-sm uppercase tracking-widest ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <span className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <span className="text-lg">🚪</span> {t.logout}
          </span>
          <div className="p-1.5 bg-red-50 text-red-400 rounded-lg">
             <ICONS.Plus className="w-4 h-4 rotate-45 stroke-[3px]" />
          </div>
        </button>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-block px-4 py-2 bg-gray-900 rounded-2xl mb-4">
          <p className="text-[8px] font-black tracking-[0.3em] text-white uppercase">Created by Abdelhak Guehmam</p>
        </div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Kitchen Hub Pro • v1.1.2</p>
      </div>
    </div>
  );
};

export default ProfileView;
