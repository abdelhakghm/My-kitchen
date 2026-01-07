
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

  const copyFamilyCode = () => {
    if (user.family_code) {
      navigator.clipboard.writeText(user.family_code.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 leading-tight">{t.settings}</h2>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center mb-6">
        <div className="relative inline-block">
          <img src={user.avatar_url} className="w-24 h-24 rounded-[2rem] mx-auto shadow-xl mb-4" alt="" />
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
        <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mt-1">{user.role}</p>
      </div>

      <div className="mb-6 p-6 bg-orange-50 rounded-3xl border border-orange-100">
        <div className="flex justify-between items-start mb-4">
          <div>
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
            {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied!') : (lang === 'ar' ? 'Copy Code' : 'Copy Code')}
          </button>
        </div>
        <p className="text-xs text-orange-400 leading-relaxed italic">
          {lang === 'ar' 
            ? 'شارك هذا الرمز مع عائلتك ليتمكنوا من الانضمام إلى مطبخك.' 
            : 'Share this code with your family members so they can join your synced kitchen.'}
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onToggleLang}
          className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-3">
             <span className="text-xl">🌐</span> {t.language}
          </span>
          <span className="text-orange-500 text-sm font-black uppercase tracking-widest">
            {lang === 'en' ? 'Arabic' : 'English'}
          </span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-between p-5 bg-red-50 rounded-2xl font-bold text-red-600 mt-8 hover:bg-red-100 transition-colors"
        >
          <span className="flex items-center gap-3">
             <span className="text-xl">🚪</span> {t.logout}
          </span>
          <div className="bg-white p-1 rounded-lg">
             <ICONS.Plus className="w-5 h-5 rotate-45" />
          </div>
        </button>
      </div>

      <div className="mt-12 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase tracking-widest">My Kitchen Hub v1.0.5</p>
      </div>
    </div>
  );
};

export default ProfileView;
