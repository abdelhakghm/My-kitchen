import React from 'react';
import { ICONS } from '../constants';
import { translations } from '../translations';
import { Language } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = translations[lang];
  const tabs = [
    { id: 'home', icon: ICONS.Home, label: t.home },
    { id: 'inventory', icon: ICONS.Inventory, label: t.stock },
    { id: 'cart', icon: ICONS.Cart, label: t.shop },
    { id: 'chat', icon: ICONS.Chat, label: t.family },
    { id: 'profile', icon: ICONS.Profile, label: t.me },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100] pb-safe">
      <nav className="glass rounded-[2.5rem] px-4 py-3 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 tap-highlight-none"
            >
              <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                isActive ? 'bg-orange-500 text-white scale-110 -translate-y-2' : 'text-gray-400'
              }`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full blur-[1px]"></div>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${
                isActive ? 'opacity-100 translate-y-0 text-orange-600' : 'opacity-0 translate-y-2'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;