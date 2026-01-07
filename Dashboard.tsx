
import React, { useState } from 'react';
import { Profile, Meal, MealSelection, ConfirmedMeal, MealTime } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  user: Profile;
  meals: Meal[];
  selections: MealSelection[];
  confirmedMeals: ConfirmedMeal[];
  onSelectMeal: (id: string, slot: MealTime) => void;
  onConfirmMeal: (id: string, slot: MealTime, time: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, meals, selections, confirmedMeals, onSelectMeal, onConfirmMeal }) => {
  const [showPicker, setShowPicker] = useState<{ open: boolean; slot: MealTime | null }>({ open: false, slot: null });
  const [readyTime, setReadyTime] = useState('19:00');

  const getConfirmed = (slot: MealTime) => confirmedMeals.find(c => c.slot === slot);
  const getSelections = (slot: MealTime) => selections.filter(s => s.slot === slot);

  const openMealPicker = (slot: MealTime) => {
    setShowPicker({ open: true, slot });
  };

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

  const SlotCard = ({ slot }: { slot: MealTime }) => {
    const confirmed = getConfirmed(slot);
    const familySelections = getSelections(slot);
    // Support both joined objects or nested JSON data from Supabase
    const confirmedMealData = (confirmed as any)?.meal || (confirmed as any)?.meal_data;

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${slot === 'Lunch' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <ICONS.Home className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{slot}</h3>
          </div>
          <span className="text-xs font-medium text-gray-400">Today</span>
        </div>

        {confirmed ? (
          <div className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-100 animate-in fade-in zoom-in duration-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Confirmed</p>
                <h4 className="text-lg font-bold text-gray-800">{confirmedMealData?.name || 'Unknown Meal'}</h4>
                <p className="text-sm text-orange-600 font-medium">Ready by {confirmed.ready_at}</p>
              </div>
              <div className="bg-white p-2 rounded-full shadow-sm">
                <ICONS.Check className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 mb-4 border border-dashed border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-3">No meal confirmed yet</p>
            {user.role === 'Mother' ? (
              <button 
                onClick={() => openMealPicker(slot)}
                className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all"
              >
                Decide for Family
              </button>
            ) : (
              <button 
                onClick={() => openMealPicker(slot)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
              >
                Suggest a Meal
              </button>
            )}
          </div>
        )}

        {familySelections.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Family Requests</p>
            <div className="space-y-2">
              {familySelections.map(sel => {
                const selProfile = (sel as any).profile || (sel as any).profile_data;
                const selMeal = (sel as any).meal || (sel as any).meal_data;
                return (
                  <div key={sel.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <img src={selProfile?.avatar_url || `https://picsum.photos/seed/${sel.user_id}/40/40`} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">{selProfile?.name || 'Family Member'}</p>
                      <p className="text-[10px] text-gray-400 italic">"I'd like {selMeal?.name || 'this'}"</p>
                    </div>
                    {user.role === 'Mother' && !confirmed && (
                      <button 
                        onClick={() => handlePick(sel.meal_id)}
                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        <ICONS.Check className="w-4 h-4" />
                      </button>
                    )}
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
        <h2 className="text-3xl font-black text-gray-900 leading-tight">What's for dinner,<br/><span className="text-orange-500">Family?</span></h2>
      </div>

      <SlotCard slot="Lunch" />
      <SlotCard slot="Dinner" />

      {showPicker.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Pick a {showPicker.slot}</h3>
              <button onClick={() => setShowPicker({ open: false, slot: null })} className="p-2 bg-gray-100 rounded-full">
                <ICONS.Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            {user.role === 'Mother' && (
              <div className="mb-6 p-4 bg-orange-50 rounded-2xl flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Ready Time:</label>
                <input 
                  type="time" 
                  value={readyTime} 
                  onChange={(e) => setReadyTime(e.target.value)}
                  className="bg-white border-none rounded-lg px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div className="space-y-3 max-h-[50vh] overflow-y-auto hide-scrollbar">
              {meals.map(meal => (
                <button 
                  key={meal.id}
                  onClick={() => handlePick(meal.id)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-bold text-gray-800">{meal.name}</h4>
                    <p className="text-xs text-gray-500">{meal.description}</p>
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
