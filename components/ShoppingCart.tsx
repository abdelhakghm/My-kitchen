
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName);
      setNewItemName('');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 leading-tight">{t.shoppingList}</h2>
      </div>

      {(user.role === 'Father' || user.role === 'Mother') && (
        <form onSubmit={handleAdd} className="mb-8">
          <div className="relative group">
            <input type="text" placeholder={t.foodName} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 pr-16 text-sm" />
            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-green-500 text-white rounded-xl flex items-center justify-center"><ICONS.Plus className="w-5 h-5" /></button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ICONS.Cart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Empty List</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${item.is_purchased ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
              <button onClick={() => onToggle(item.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${item.is_purchased ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}>{item.is_purchased && <ICONS.Check className="w-4 h-4 stroke-[3px]" />}</button>
              <div className="flex-1">
                <span className={`font-bold ${item.is_purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.item_name}</span>
              </div>
              <button onClick={() => onRemove(item.id)} className="p-2 text-gray-300 hover:text-red-500"><ICONS.Plus className="w-5 h-5 rotate-45" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
