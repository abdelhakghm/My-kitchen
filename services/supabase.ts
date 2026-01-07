import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const SUPABASE_URL = 'https://hzjtinxvmxidfzbhuhcm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_v6lXi4COAgnNlCdlwcvoug_Nf-cqHsF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const TABLES = {
  MEALS: 'meals',
  SELECTIONS: 'daily_meal_selections',
  CONFIRMED: 'confirmed_meals',
  INVENTORY: 'inventory',
  CART: 'shopping_cart',
  MESSAGES: 'chat_messages',
  PROFILES: 'profiles'
};