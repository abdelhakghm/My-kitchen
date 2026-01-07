
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

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${slot === 'Lunch' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <ICONS.Home className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{slot === 'Lunch' ? (lang === 'ar' ? 'الغداء' : 'Lunch') : (lang === 'ar' ? 'العشاء' : 'Dinner')}</h3>
          </div>
        </div>

        {confirmed ? (
          <div className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-100">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">{t.confirmed}</p>
            <h4 className="text-lg font-bold text-gray-800">{confirmedMealData?.name || '---'}</h4>
            <p className="text-sm text-orange-600 font-medium">{t.readyBy} {confirmed.ready_at}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 mb-4 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-3">{t.noMealConfirmed}</p>
            <button 
              type="button"
              onClick={() => setShowPicker({ open: true, slot })}
              className={`px-6 py-2 text-white rounded-full text-sm font-bold shadow-lg ${user.role === 'Mother' ? 'bg-orange-500 shadow-orange-100' : 'bg-blue-500 shadow-blue-100'}`}
            >
              {user.role === 'Mother' ? t.decideForFamily : t.suggestMeal}
            </button>
          </div>
        )}

        {familySelections.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.familyRequests}</p>
            <div className="space-y-2">
              {familySelections.map(sel => {
                const selProfile = sel.profile_data;
                const selMeal = sel.meal_data;
                return (
                  <div key={sel.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <img src={selProfile?.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">{selProfile?.name}</p>
                      <p className="text-[10px] text-gray-400 italic">"{selMeal?.name}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 leading-tight">
          {t.whatsForDinner}<br/><span className="text-orange-500">{t.familySuffix}</span>
        </h2>
      </div>

      <SlotCard slot="Lunch" />
      <SlotCard slot="Dinner" />

      {showPicker.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{t.pickAMeal}</h3>
              <button type="button" onClick={() => setShowPicker({ open: false, slot: null })} className="p-2 bg-gray-100 rounded-full">
                <ICONS.Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">{t.quickAdd}</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder={t.foodName}
                  className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-2 text-sm shadow-inner"
                />
                <button 
                  type="button"
                  onClick={handleQuickAdd}
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  {t.addFood}
                </button>
              </div>
            </div>
            
            {user.role === 'Mother' && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl flex items-center justify-between border border-orange-100">
                <label className="text-sm font-bold text-gray-700">{t.readyTime}</label>
                <input type="time" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} className="bg-white border-none rounded-lg px-3 py-1 text-sm font-bold" />
              </div>
            )}

            <div className="space-y-3 max-h-[40vh] overflow-y-auto hide-scrollbar">
              {meals.map(meal => (
                <button 
                  key={meal.id} 
                  type="button"
                  onClick={() => handlePick(meal.id)} 
                  className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:bg-orange-50 flex justify-between items-center group transition-all"
                >
                  <span className="font-bold text-gray-800">{meal.name}</span>
                  <ICONS.ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-orange-500 ${isRTL ? 'rotate-180' : ''}`} />
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
