import React, { useState } from 'react';
import { Profile, InventoryItem, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface InventoryProps {
  user: Profile;
  items: InventoryItem[];
  lang: Language;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onAdd: (name: string, qty: number) => void;
  onDelete: (id: string) => void;
  onRequest: (name: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ user, items, lang, onUpdate, onAdd, onDelete, onRequest }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const t = translations[lang];
  const isParent = user.role === 'Mother' || user.role === 'Father';

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim(), newItemQty);
      setNewItemName('');
      setNewItemQty(1);
      setShowAddModal(false);
    }
  };

  return (
    <div className="pb-40 px-1 animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-[42px] font-black text-gray-900 leading-[1] tracking-tighter">
          Pantry<br/><span className="text-orange-500">Stock.</span>
        </h2>
        <div className="flex items-center gap-2 mt-4">
          <div className="px-3 py-1 bg-green-50 text-[9px] font-black text-green-600 rounded-full uppercase tracking-widest border border-green-100">
            {items.filter(i => i.quantity > 1).length} Optimal
          </div>
          <div className="px-3 py-1 bg-red-50 text-[9px] font-black text-red-600 rounded-full uppercase tracking-widest border border-red-100">
            {items.filter(i => i.quantity <= 1).length} Low
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em]">Pantry is empty</p>
          </div>
        ) : (
          items.map(item => {
            const isLow = item.quantity <= 1;
            return (
              <div key={item.id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md">
                <div className="flex-1">
                  <h4 className="text-lg font-black text-gray-900 tracking-tight">{item.item_name}</h4>
                  <div className="mt-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-all duration-700 ${
                          i < item.quantity 
                            ? (isLow ? 'bg-orange-500' : 'bg-green-500') 
                            : 'bg-gray-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isParent ? (
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 gap-2">
                      <button 
                        onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                        className="w-10 h-10 rounded-xl bg-white text-gray-400 font-black shadow-sm active:scale-90 transition-all"
                      >-</button>
                      <span className="text-sm font-black text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                        className="w-10 h-10 rounded-xl bg-white text-gray-400 font-black shadow-sm active:scale-90 transition-all"
                      >+</button>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-2xl text-xs font-black text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  )}
                  {isParent && (
                    <button onClick={() => onDelete(item.id)} className="text-gray-200 hover:text-red-400 p-2">
                       <ICONS.Plus className="w-5 h-5 rotate-45" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isParent && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-32 right-8 w-16 h-16 bg-gray-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center z-[110] active:scale-90 transition-all"
        >
          <ICONS.Plus className="w-8 h-8" />
        </button>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-t-[3.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Add to Pantry</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input 
                autoFocus
                type="text" 
                placeholder="Item name (e.g. Milk)" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-2xl p-5 text-sm font-bold outline-none"
              />
              <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-5">
                <span className="text-sm font-bold text-gray-500">Initial Quantity</span>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))} className="w-8 h-8 bg-white rounded-lg shadow-sm font-black">-</button>
                  <span className="font-black text-gray-900">{newItemQty}</span>
                  <button type="button" onClick={() => setNewItemQty(newItemQty + 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-black">+</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-100 active:scale-95 transition-all">
                Add to Stock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;