
import React, { useState } from 'react';
import { Profile, InventoryItem, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface InventoryProps {
  user: Profile;
  items: InventoryItem[];
  lang: Language;
  onUpdate: (id: string, qty: number) => void;
  onAdd: (name: string, qty: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ user, items, lang, onUpdate, onAdd }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const t = translations[lang];
  const isParent = user.role === 'Mother' || user.role === 'Father';

  const handleAdd = () => {
    if (newItemName.trim()) {
      onAdd(newItemName, newItemQty);
      setNewItemName('');
      setNewItemQty(1);
      setShowAdd(false);
    }
  };

  if (!isParent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ICONS.Inventory className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Parents Only</h3>
        <p className="text-gray-500 text-sm">Inventory management is restricted to Mother and Father profiles.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-900">{t.pantryStock}</h2>
        {user.role === 'Mother' && (
          <button onClick={() => setShowAdd(true)} className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
            <ICONS.Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-xl mb-8">
          <h3 className="font-bold text-gray-800 mb-4">{t.addIngredient}</h3>
          <div className="space-y-4">
            <input type="text" placeholder={t.foodName} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center bg-gray-50 rounded-xl p-1">
                <button onClick={() => setNewItemQty(q => Math.max(1, q - 1))} className="p-3 text-blue-500 font-bold">-</button>
                <span className="px-4 font-bold">{newItemQty}</span>
                <button onClick={() => setNewItemQty(q => q + 1)} className="p-3 text-blue-500 font-bold">+</button>
              </div>
              <button onClick={handleAdd} className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-xl shadow-md">{t.addIngredient}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl p-5 border flex items-center justify-between ${item.quantity <= 1 ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
            <div>
              <h4 className="font-bold text-gray-800">{item.item_name}</h4>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${item.quantity <= 1 ? 'text-red-500' : 'text-gray-400'}`}>
                {item.quantity <= 1 ? t.runningLow : t.inStock}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-50 rounded-xl">
                <button onClick={() => onUpdate(item.id, item.quantity - 1)} className="p-2 text-gray-400">-</button>
                <span className={`w-8 text-center font-bold text-sm ${item.quantity <= 1 ? 'text-red-600' : 'text-gray-700'}`}>{item.quantity}</span>
                <button onClick={() => onUpdate(item.id, item.quantity + 1)} className="p-2 text-gray-400">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
