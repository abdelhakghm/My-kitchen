
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

      {/* User Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center mb-6">
        <div className="relative inline-block">
          <img src={user.avatar_url} className="w-24 h-24 rounded-3xl mx-auto shadow-xl mb-4" alt="" />
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
        <p className="text-sm font-bold text-orange-500 uppercase tracking-widest mt-1">{user.role}</p>
      </div>

      {/* Family Code Section (Crucial for the Mother to find the code) */}
      <div className="mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
          {lang === 'ar' ? 'رمز العائلة الخاص بك' : 'Your Family Code'}
        </p>
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-400 font-bold uppercase mb-1">
              {lang === 'ar' ? 'شارك هذا مع عائلتك' : 'Share this with your family'}
            </p>
            <p className="text-xl font-black text-orange-600 tracking-tighter uppercase">{user.family_code}</p>
          </div>
          <button 
            onClick={copyFamilyCode}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-white text-orange-500 shadow-sm border border-orange-100'
            }`}
          >
            {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onToggleLang}
          className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-2xl font-bold text-gray-700 group hover:bg-gray-100 transition-colors"
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
          className="w-full flex items-center justify-between p-5 bg-red-50 rounded-2xl font-bold text-red-600 mt-8 group hover:bg-red-100 transition-colors"
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
        <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">My Kitchen v1.0.4</p>
      </div>
    </div>
  );
};

export default ProfileView;
