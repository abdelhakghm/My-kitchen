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
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  const handleRequest = () => {
    if (requestName.trim()) {
      // Direct request adds to shopping list with a requester tag
      onRequest(`${requestName} (For: ${user.name})`);
      setRequestName('');
      setShowRequest(false);
    }
  };

  const handleUpdateName = (id: string) => {
    if (editValue.trim()) {
      onUpdate(id, { item_name: editValue });
      setEditingItemId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-2">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{t.pantryStock}</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
            {isParent ? 'Full Control Mode' : `Logged in as ${user.role}`}
          </p>
        </div>
        
        {isParent ? (
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className={`p-4 rounded-[1.5rem] shadow-xl transition-all active:scale-90 ${showAdd ? 'bg-gray-100 text-gray-400' : 'bg-orange-500 text-white shadow-orange-100'}`}
          >
            <ICONS.Plus className={`w-6 h-6 transition-transform duration-300 ${showAdd ? 'rotate-45' : ''}`} />
          </button>
        ) : (
          <button 
            onClick={() => setShowRequest(!showRequest)} 
            className={`p-4 rounded-[1.5rem] shadow-xl transition-all active:scale-90 ${showRequest ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white shadow-blue-100'}`}
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${showRequest ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        )}
      </div>

      {showAdd && isParent && (
        <div className="bg-white rounded-[2.5rem] p-6 border border-orange-100 shadow-2xl mb-8 animate-in zoom-in duration-300">
          <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-4">Stock the Kitchen</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="What are we adding? (e.g. Eggs)" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none placeholder:text-gray-300" 
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                <button onClick={() => setNewItemQty(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-orange-500 font-black">-</button>
                <span className="px-5 font-black text-gray-700 text-lg">{newItemQty}</span>
                <button onClick={() => setNewItemQty(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-orange-500 font-black">+</button>
              </div>
              <button onClick={handleAdd} className="flex-1 bg-orange-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-orange-100 uppercase tracking-widest text-[11px] active:scale-95 transition-all">
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequest && !isParent && (
        <div className="bg-white rounded-[2.5rem] p-6 border border-blue-100 shadow-2xl mb-8 animate-in zoom-in duration-300">
          <h3 className="font-black text-blue-500 text-xs uppercase tracking-widest mb-4">Ask Mom for something</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. Chocolate, Juice..." 
              value={requestName} 
              onChange={(e) => setRequestName(e.target.value)} 
              className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300" 
            />
            <button onClick={handleRequest} className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest text-[11px] active:scale-95 transition-all">
              Add to Mom's Shopping List
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="py-20 text-center opacity-10 flex flex-col items-center">
            <ICONS.Inventory className="w-20 h-20 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">Pantry is empty</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`bg-white rounded-[2.2rem] p-5 border-2 transition-all duration-300 flex items-center justify-between group ${item.quantity <= 1 ? 'border-red-100 bg-red-50/10' : 'border-gray-50 hover:border-orange-100 shadow-sm shadow-gray-100'}`}>
              <div className="flex-1">
                {editingItemId === item.id && isParent ? (
                  <input 
                    autoFocus
                    className="bg-transparent border-b-2 border-orange-500 outline-none font-black text-gray-800 tracking-tight text-lg w-full"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleUpdateName(item.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(item.id)}
                  />
                ) : (
                  <h4 
                    onClick={() => { if(isParent) { setEditingItemId(item.id); setEditValue(item.item_name); } }}
                    className={`font-black text-gray-800 tracking-tight text-lg transition-colors ${isParent ? 'hover:text-orange-500 cursor-pointer' : ''}`}
                  >
                    {item.item_name}
                  </h4>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${item.quantity <= 1 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                   <p className={`text-[9px] font-black uppercase tracking-widest ${item.quantity <= 1 ? 'text-red-500' : 'text-gray-400'}`}>
                    {item.quantity <= 1 ? t.runningLow : t.inStock}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isParent ? (
                  <>
                    <div className="flex items-center bg-gray-50 rounded-[1.5rem] border border-gray-100 shadow-inner p-0.5">
                      <button onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="w-10 h-10 flex items-center justify-center text-gray-400 font-black hover:text-orange-500 transition-colors">-</button>
                      <span className={`w-8 text-center font-black text-sm ${item.quantity <= 1 ? 'text-red-600' : 'text-gray-700'}`}>{item.quantity}</span>
                      <button onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })} className="w-10 h-10 flex items-center justify-center text-gray-400 font-black hover:text-orange-500 transition-colors">+</button>
                    </div>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                    >
                      <ICONS.Plus className="w-4 h-4 rotate-45 stroke-[3px]" />
                    </button>
                  </>
                ) : (
                  <div className="px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 border border-gray-100">
                    {item.quantity} {item.unit || 'pcs'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inventory;