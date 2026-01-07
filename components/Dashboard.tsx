
import React, { useState } from 'react';
import { Profile, Meal, MealSelection, ConfirmedMeal, MealTime, Language } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface DashboardProps {
  user: Profile;
  meals: Meal[];
  selections: MealSelection[];
  confirmedMeals: ConfirmedMeal[];
  lang: Language;
  onSelectMeal: (id: string, slot: MealTime) => void;
  onConfirmMeal: (id: string, slot: MealTime, time: string) => void;
  onAddAndPick: (name: string, slot: MealTime) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, meals, selections, confirmedMeals, lang, onSelectMeal, onConfirmMeal, onAddAndPick }) => {
  const [showPicker, setShowPicker] = useState<{ open: boolean; slot: MealTime | null }>({ open: false, slot: null });
  const [editingTimeSlot, setEditingTimeSlot] = useState<MealTime | null>(null);
  const [newTime, setNewTime] = useState('19:00');
  const [readyTime, setReadyTime] = useState('19:00');
  const [newMealName, setNewMealName] = useState('');
  
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const getConfirmed = (slot: MealTime) => confirmedMeals.find(c => c.slot === slot);
  const getSelections = (slot: MealTime) => selections.filter(s => s.slot === slot);

  const handlePick = (mealId: string) => {
    if (showPicker.slot) {
      if (user.role === 'Mother') {
        onConfirmMeal(mealId, showPicker.slot, readyTime);
      } else {
        onSelectMeal(mealId, showPicker.slot);
      }
      setShowPicker({ open: false, slot: null });
    }
  };

  const handleUpdateReadyTime = (slot: MealTime, mealId: string) => {
    onConfirmMeal(mealId, slot, newTime);
    setEditingTimeSlot(null);
  };

  const handleQuickAdd = () => {
    if (newMealName.trim() && showPicker.slot) {
      onAddAndPick(newMealName, showPicker.slot);
      setNewMealName('');
      setShowPicker({ open: false, slot: null });
    }
  };

  const SlotCard = ({ slot }: { slot: MealTime }) => {
    const confirmed = getConfirmed(slot);
    const familySelections = getSelections(slot);
    const confirmedMealData = (confirmed as any)?.meal || (confirmed as any)?.meal_data;
    const isEditing = editingTimeSlot === slot;

    return (
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100/50">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${slot === 'Lunch' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <ICONS.Home className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">
              {slot === 'Lunch' ? (lang === 'ar' ? 'الغداء' : 'Lunch') : (lang === 'ar' ? 'العشاء' : 'Dinner')}
            </h3>
          </div>
          <div className="h-2 w-2 rounded-full bg-gray-100"></div>
        </div>

        {confirmed ? (
          <div className="bg-orange-50 rounded-[2rem] p-5 mb-4 border border-orange-100 relative group transition-all duration-300">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">{t.confirmed}</p>
            <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight">{confirmedMealData?.name || '---'}</h4>
            
            {isEditing && user.role === 'Mother' ? (
              <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-left-2">
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-white border-none rounded-xl px-3 py-1.5 text-sm font-black text-orange-600 shadow-sm focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  onClick={() => handleUpdateReadyTime(slot, confirmed.meal_id)}
                  className="bg-orange-500 text-white p-2 rounded-xl shadow-md active:scale-90 transition-all"
                >
                  <ICONS.Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setEditingTimeSlot(null)}
                  className="bg-white text-gray-400 p-2 rounded-xl shadow-sm border border-orange-100 active:scale-90 transition-all"
                >
                  <ICONS.Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-orange-600 font-bold flex items-center gap-1.5">
                  <span className="opacity-60">{t.readyBy}</span> {confirmed.ready_at}
                </p>
                {user.role === 'Mother' && (
                  <button 
                    onClick={() => {
                      setNewTime(confirmed.ready_at);
                      setEditingTimeSlot(slot);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-xl shadow-sm border border-orange-100 text-orange-400 hover:text-orange-600 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50/50 rounded-[2rem] p-8 mb-4 border border-dashed border-gray-200 text-center group transition-all duration-500 hover:bg-gray-50 hover:border-gray-300">
            <p className="text-sm font-bold text-gray-400 mb-4 tracking-tight">{t.noMealConfirmed}</p>
            <button 
              type="button"
              onClick={() => setShowPicker({ open: true, slot })}
              className={`px-8 py-3 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-lg ${user.role === 'Mother' ? 'bg-orange-500 shadow-orange-200 hover:shadow-orange-300' : 'bg-blue-500 shadow-blue-200 hover:shadow-blue-300'}`}
            >
              {user.role === 'Mother' ? t.decideForFamily : t.suggestMeal}
            </button>
          </div>
        )}

        {familySelections.length > 0 && (
          <div className="mt-6 border-t border-gray-50 pt-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.familyRequests}</p>
            <div className="flex -space-x-3 overflow-hidden mb-3">
              {familySelections.map(sel => (
                <img 
                  key={sel.id}
                  src={sel.profile_data?.avatar_url} 
                  className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white shadow-sm object-cover bg-gray-50" 
                  alt="" 
                />
              ))}
            </div>
            <div className="space-y-2">
              {familySelections.slice(0, 2).map(sel => (
                <div key={sel.id} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-50">
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-gray-800">{sel.profile_data?.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium italic">"{sel.meal_data?.name}"</p>
                  </div>
                  {user.role === 'Mother' && !confirmed && (
                    <button 
                      onClick={() => handlePick(sel.meal_id)}
                      className="p-2 bg-white text-green-500 rounded-xl shadow-sm border border-green-50 hover:bg-green-500 hover:text-white transition-all active:scale-90"
                    >
                      <ICONS.Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {familySelections.length > 2 && (
                <p className="text-[9px] font-black text-gray-300 text-center uppercase tracking-widest pt-2">+{familySelections.length - 2} more requests</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 px-2">
        <h2 className="text-4xl font-black text-gray-900 leading-[1.1] tracking-tighter">
          {t.whatsForDinner}<br/><span className="text-orange-500">{t.familySuffix}</span>
        </h2>
        <div className="h-1 w-12 bg-gray-900 mt-4 rounded-full opacity-10"></div>
      </div>

      <SlotCard slot="Lunch" />
      <SlotCard slot="Dinner" />

      {showPicker.open && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t.pickAMeal}</h3>
              <button 
                type="button" 
                onClick={() => setShowPicker({ open: false, slot: null })} 
                className="p-3 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ICONS.Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="mb-8 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{t.quickAdd}</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder={t.foodName}
                  className="flex-1 bg-white border-2 border-transparent rounded-2xl px-5 py-3 text-sm font-bold shadow-sm focus:border-blue-300 focus:ring-0 transition-all outline-none placeholder:text-gray-300"
                />
                <button 
                  type="button"
                  onClick={handleQuickAdd}
                  className="bg-blue-500 text-white px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                  {t.addFood}
                </button>
              </div>
            </div>
            
            {user.role === 'Mother' && (
              <div className="mb-8 p-6 bg-orange-50/50 rounded-[2rem] flex items-center justify-between border border-orange-100">
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest">{t.readyTime}</label>
                <input 
                  type="time" 
                  value={readyTime} 
                  onChange={(e) => setReadyTime(e.target.value)} 
                  className="bg-white border-none rounded-xl px-4 py-2 text-sm font-black text-orange-600 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>
            )}

            <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar pb-10">
              {meals.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                   <p className="text-sm font-bold">No meals saved yet.</p>
                </div>
              ) : (
                meals.map(meal => (
                  <button 
                    key={meal.id} 
                    type="button"
                    onClick={() => handlePick(meal.id)} 
                    className="w-full text-left p-5 rounded-[2rem] border-2 border-gray-50 hover:border-orange-500 hover:bg-orange-50 flex justify-between items-center group transition-all duration-300"
                  >
                    <span className="font-black text-gray-800 tracking-tight">{meal.name}</span>
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-orange-500 transition-colors">
                      <ICONS.ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-white ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
