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
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectMeal: (id: string, slot: MealTime) => void;
  onConfirmMeal: (id: string, slot: MealTime, time: string) => void;
  onAddAndPick: (name: string, slot: MealTime) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, meals, selections, confirmedMeals, lang, selectedDate, onDateChange,
  onSelectMeal, onConfirmMeal, onAddAndPick 
}) => {
  const [showPicker, setShowPicker] = useState<{ open: boolean; slot: MealTime | null }>({ open: false, slot: null });
  const [newMealName, setNewMealName] = useState('');
  const [customTime, setCustomTime] = useState('19:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = translations[lang];
  const isParent = user.role === 'Mother' || user.role === 'Father';

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString(lang, { weekday: 'short' }),
      num: d.getDate()
    };
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMealName.trim();
    if (name && showPicker.slot && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddAndPick(name, showPicker.slot);
        setNewMealName('');
        setShowPicker({ open: false, slot: null });
      } catch (err) {
        console.error("Add meal error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const SlotCard = ({ slot }: { slot: MealTime }) => {
    const confirmed = confirmedMeals.find(c => c.slot === slot);
    const familySelections = selections.filter(s => s.slot === slot);
    const confirmedMeal = (confirmed as any)?.meal_data;

    return (
      <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 mb-6 page-enter">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              slot === 'Lunch' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'
            }`}>
              <ICONS.Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{slot}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {lang === 'ar' ? 'الوجبة الرئيسية' : 'Main Course'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
                setCustomTime(slot === 'Lunch' ? '13:00' : '19:00');
                setShowPicker({ open: true, slot });
            }}
            className="p-3 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 transition-all"
          >
            <ICONS.Plus className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 text-white shadow-xl shadow-gray-200">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">{t.confirmed}</p>
            <h4 className="text-2xl font-black tracking-tight mb-4">{confirmedMeal?.name || 'Meal Set'}</h4>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {t.readyBy} {confirmed.ready_at || '19:00'}
            </div>
          </div>
        ) : (
          <div className="py-8 px-4 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
            <p className="text-sm font-bold text-gray-400 mb-4">{t.noMealConfirmed}</p>
            <button 
              onClick={() => {
                setCustomTime(slot === 'Lunch' ? '13:00' : '19:00');
                setShowPicker({ open: true, slot });
              }}
              className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                isParent ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              {isParent ? t.decideForFamily : t.suggestMeal}
            </button>
          </div>
        )}

        {familySelections.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-50">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">{t.familyRequests}</p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {familySelections.map(sel => (
                <div key={sel.id} className="flex-shrink-0 flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                  <img src={sel.profile_data?.avatar_url} className="w-8 h-8 rounded-xl object-cover bg-gray-100" alt="" />
                  <div>
                    <p className="text-[10px] font-black text-gray-900">{sel.profile_data?.name}</p>
                    <p className="text-[9px] text-orange-500 font-bold">{sel.meal_data?.name}</p>
                  </div>
                  {isParent && !confirmed && (
                    <button 
                      onClick={() => onConfirmMeal(sel.meal_id, slot, customTime)}
                      className="ml-2 p-1.5 bg-green-50 text-green-600 rounded-lg"
                    >
                      <ICONS.Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-32 px-1">
      <div className="mb-10 flex justify-between items-end">
        <h2 className="text-[42px] font-black text-gray-900 leading-[1] tracking-tighter">
          Bon<br/><span className="text-orange-500">Appetit.</span>
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-8">
        {dates.map((d) => (
          <button
            key={d.full}
            onClick={() => onDateChange(d.full)}
            className={`flex-shrink-0 w-20 h-28 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 ${
              selectedDate === d.full 
                ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200 scale-105' 
                : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${selectedDate === d.full ? 'text-orange-100' : 'text-gray-300'}`}>
              {d.day}
            </span>
            <span className="text-2xl font-black tracking-tighter">{d.num}</span>
          </button>
        ))}
      </div>

      <SlotCard slot="Lunch" />
      <SlotCard slot="Dinner" />

      {showPicker.open && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setShowPicker({ open: false, slot: null })}></div>
          <div className="relative bg-white rounded-t-[3.5rem] p-8 max-h-[85vh] overflow-y-auto hide-scrollbar">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{t.pickAMeal}</h3>
              <button onClick={() => setShowPicker({ open: false, slot: null })} className="p-3 bg-gray-50 rounded-full text-gray-400">
                <ICONS.Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            {isParent && (
              <div className="mb-8 p-6 bg-orange-50 rounded-[2rem] border border-orange-100 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">{t.readyTime}</p>
                   <p className="text-xs font-bold text-gray-500">{lang === 'ar' ? 'اختر وقت التجهيز' : 'Set the serving time'}</p>
                </div>
                <input 
                  type="time" 
                  value={customTime} 
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="bg-white border-none rounded-xl px-4 py-3 text-sm font-black text-orange-600 focus:ring-4 focus:ring-orange-200 outline-none shadow-sm"
                />
              </div>
            )}

            <form onSubmit={handleQuickAdd} className="mb-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t.quickAdd}</p>
              <div className="relative">
                <input 
                  type="text"
                  placeholder={t.foodName}
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 border-none rounded-2xl p-5 pr-14 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-orange-100 transition-all outline-none disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!newMealName.trim() || isSubmitting}
                  className="absolute right-2 top-2 bottom-2 w-11 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-30 transition-all active:scale-90"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ICONS.Check className="w-5 h-5 stroke-[3px]" />
                  )}
                </button>
              </div>
            </form>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Family Favorites</p>
            <div className="grid gap-3">
              {meals.map(meal => (
                <button 
                  key={meal.id}
                  onClick={() => {
                    if (showPicker.slot) {
                      if (isParent) onConfirmMeal(meal.id, showPicker.slot, customTime);
                      else onSelectMeal(meal.id, showPicker.slot);
                      setShowPicker({ open: false, slot: null });
                    }
                  }}
                  className="group w-full text-left p-5 rounded-[2rem] bg-gray-50 border-2 border-transparent hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-base font-black text-gray-900 group-hover:text-orange-600 transition-colors">{meal.name}</h4>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">{meal.category}</p>
                  </div>
                  <ICONS.ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;