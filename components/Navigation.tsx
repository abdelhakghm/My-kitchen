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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-30 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-orange-500 scale-110' : 'text-gray-400'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-orange-50' : ''}`} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;