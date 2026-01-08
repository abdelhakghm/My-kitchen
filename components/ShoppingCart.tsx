import React, { useState } from 'react';
import { Profile, CartItem, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface ShoppingCartProps {
  user: Profile;
  items: CartItem[];
  lang: Language;
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ user, items, lang, onToggle, onAdd, onRemove }) => {
  const [newItemName, setNewItemName] = useState('');
  const t = translations[lang];
  const isParent = user.role === 'Mother' || user.role === 'Father';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName);
      setNewItemName('');
    }
  };

  return (
    <div className="pb-40 px-1 animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-[42px] font-black text-gray-900 leading-[1] tracking-tighter">
          Shopping<br/><span className="text-orange-500">List.</span>
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">{items.length} {t.shop}</p>
      </div>

      {isParent && (
        <form onSubmit={handleAdd} className="mb-8">
          <div className="relative group">
            <input 
              type="text" 
              placeholder={t.foodName} 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              className="w-full bg-white border-none rounded-[2rem] p-5 pr-16 text-sm font-bold shadow-sm focus:ring-4 focus:ring-orange-100 transition-all outline-none" 
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bottom-2 w-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 active:scale-90 transition-all"
            >
              <ICONS.Plus className="w-6 h-6" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ICONS.Cart className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">All Set!</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${
                item.is_purchased 
                  ? 'bg-gray-50/50 border-transparent opacity-50 scale-[0.98]' 
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <button 
                onClick={() => onToggle(item.id)} 
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                  item.is_purchased 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-gray-50 border-gray-100 text-transparent hover:border-orange-200'
                }`}
              >
                <ICONS.Check className="w-5 h-5 stroke-[4px]" />
              </button>
              
              <div className="flex-1">
                <span className={`text-base font-black tracking-tight ${item.is_purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {item.item_name}
                </span>
              </div>
              
              <button 
                onClick={() => onRemove(item.id)} 
                className="w-10 h-10 flex items-center justify-center text-gray-200 hover:text-red-400 transition-colors"
              >
                <ICONS.Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;