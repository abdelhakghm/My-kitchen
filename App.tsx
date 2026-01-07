
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, Meal, MealSelection, ConfirmedMeal, InventoryItem, CartItem, ChatMessage, MealTime, Language } from './types';
import { translations } from './translations';
import { supabase, TABLES } from './services/supabase';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ShoppingCart from './components/ShoppingCart';
import Chat from './components/Chat';
import ProfileView from './components/ProfileView';
import Auth from './components/Auth';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState<Language>('en');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // App State
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selections, setSelections] = useState<MealSelection[]>([]);
  const [confirmedMeals, setConfirmedMeals] = useState<ConfirmedMeal[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const t = translations[lang];
  const isSyncing = useRef(false);

  const fetchData = useCallback(async () => {
    if (!user?.family_code || isSyncing.current) return;
    isSyncing.current = true;
    
    try {
      const family = user.family_code;
      
      const [mealsRes, invRes, selRes, confRes, cartRes, msgRes] = await Promise.all([
        supabase.from(TABLES.MEALS).select('*').eq('family_code', family),
        supabase.from(TABLES.INVENTORY).select('*').eq('family_code', family).order('item_name'),
        supabase.from(TABLES.SELECTIONS).select('*').eq('meal_date', selectedDate).eq('family_code', family),
        supabase.from(TABLES.CONFIRMED).select('*').eq('meal_date', selectedDate).eq('family_code', family),
        supabase.from(TABLES.CART).select('*').eq('family_code', family).order('created_at', { ascending: false }),
        supabase.from(TABLES.MESSAGES).select('*').eq('family_code', family).order('created_at', { ascending: true })
      ]);

      if (mealsRes.data) setMeals(mealsRes.data);
      if (invRes.data) setInventory(invRes.data);
      if (selRes.data) setSelections(selRes.data);
      if (confRes.data) setConfirmedMeals(confRes.data);
      if (cartRes.data) setCart(cartRes.data);
      if (msgRes.data) setMessages(msgRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      isSyncing.current = false;
    }
  }, [user?.family_code, selectedDate]);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', session.user.id).maybeSingle();
        if (profile) {
          setUser(profile);
          if (profile.language) setLang(profile.language as Language);
        }
      }
      if (mounted) setInitialLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', session.user.id).maybeSingle();
        if (profile) {
          setUser(profile);
          if (profile.language) setLang(profile.language as Language);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveTab('home');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.family_code) return;
    fetchData();

    const channel = supabase.channel(`kitchen-${user.family_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', filter: `family_code=eq.${user.family_code}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.family_code, fetchData]);

  const handleSendMessage = async (text: string) => {
    if (!user) return;
    const newMessage = {
      sender_id: user.id,
      message: text,
      family_code: user.family_code,
      profile_data: { name: user.name, avatar_url: user.avatar_url }
    };
    await supabase.from(TABLES.MESSAGES).insert(newMessage);
  };

  const handleSelectMeal = async (mealId: string, slot: MealTime) => {
    if (!user) return;
    const meal = meals.find(m => m.id === mealId);
    await supabase.from(TABLES.SELECTIONS).upsert({
      user_id: user.id,
      meal_id: mealId,
      meal_date: selectedDate,
      slot,
      family_code: user.family_code,
      profile_data: { name: user.name, avatar_url: user.avatar_url },
      meal_data: meal ? { name: meal.name } : null
    }, { onConflict: 'user_id,meal_date,slot' });
    fetchData();
  };

  const handleConfirmMeal = async (mealId: string, slot: MealTime, time: string) => {
    if (!user) return;
    const meal = meals.find(m => m.id === mealId);
    await supabase.from(TABLES.CONFIRMED).upsert({
      meal_id: mealId,
      meal_date: selectedDate,
      slot,
      ready_at: time,
      family_code: user.family_code,
      meal_data: meal ? { name: meal.name } : null
    }, { onConflict: 'family_code,meal_date,slot' });
    fetchData();
  };

  const handleAddAndPick = async (name: string, slot: MealTime) => {
    if (!user) return;
    const { data: newMeal } = await supabase.from(TABLES.MEALS).insert({
        name, description: 'Quick add', category: slot, family_code: user.family_code, created_by: user.id
    }).select().single();
    if (newMeal) {
      const isParent = user.role === 'Mother' || user.role === 'Father';
      if (isParent) await handleConfirmMeal(newMeal.id, slot, '19:00');
      else await handleSelectMeal(newMeal.id, slot);
    }
    fetchData();
  };

  const handleInventoryUpdate = async (id: string, updates: Partial<InventoryItem>) => {
    await supabase.from(TABLES.INVENTORY).update(updates).eq('id', id);
    fetchData();
  };

  const handleInventoryAdd = async (name: string, qty: number) => {
    if (!user) return;
    await supabase.from(TABLES.INVENTORY).insert({ 
      item_name: name, quantity: qty, unit: 'pcs', family_code: user.family_code 
    });
    fetchData();
  };

  const handleInventoryDelete = async (id: string) => {
    await supabase.from(TABLES.INVENTORY).delete().eq('id', id);
    fetchData();
  };

  const handleCartToggle = async (id: string) => {
    const item = cart.find(i => i.id === id);
    if (item) await supabase.from(TABLES.CART).update({ is_purchased: !item.is_purchased }).eq('id', id);
    fetchData();
  };

  const handleCartAdd = async (name: string) => {
    if (!user) return;
    await supabase.from(TABLES.CART).insert({ 
      item_name: name, quantity: 1, is_purchased: false, family_code: user.family_code 
    });
    fetchData();
  };

  const handleCartRemove = async (id: string) => {
    await supabase.from(TABLES.CART).delete().eq('id', id);
    fetchData();
  };

  if (initialLoading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#fafafa] shadow-2xl relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`h-1.5 w-full transition-colors duration-500 ${(user.role === 'Mother' || user.role === 'Father') ? 'bg-orange-500' : 'bg-blue-500'}`} />
      <header className="px-6 py-5 flex justify-between items-center bg-white border-b border-gray-100/50 z-20">
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t.appTitle}</h1>
            <span className="px-2 py-0.5 bg-gray-900 text-[8px] font-black text-white rounded-md tracking-tighter uppercase">Pro</span>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Created by Abdelhak Guehmam</p>
        </div>
        <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} className="px-4 py-2 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100 active:bg-gray-100 transition-all">
          {lang === 'en' ? 'Arabic' : 'English'}
        </button>
      </header>

      <main className={`flex-1 flex flex-col ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto px-6 py-6 pb-28'} hide-scrollbar`}>
        {activeTab === 'home' && (
          <Dashboard 
            lang={lang} 
            user={user} 
            meals={meals} 
            selections={selections} 
            confirmedMeals={confirmedMeals} 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectMeal={handleSelectMeal} 
            onConfirmMeal={handleConfirmMeal} 
            onAddAndPick={handleAddAndPick}
          />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            lang={lang} user={user} items={inventory} onUpdate={handleInventoryUpdate} onAdd={handleInventoryAdd} 
            onDelete={handleInventoryDelete} onRequest={handleCartAdd}
          />
        )}
        {activeTab === 'cart' && (
          <ShoppingCart 
            lang={lang} user={user} items={cart} onToggle={handleCartToggle} onAdd={handleCartAdd} onRemove={handleCartRemove} 
          />
        )}
        {activeTab === 'chat' && <Chat lang={lang} user={user} messages={messages} onSendMessage={handleSendMessage} />}
        {activeTab === 'profile' && <ProfileView lang={lang} user={user} onLogout={() => { supabase.auth.signOut(); setUser(null); }} onToggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')} />}
      </main>

      <Navigation lang={lang} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
