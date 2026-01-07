
export type UserRole = 'Mother' | 'Father' | 'Son' | 'Daughter';
export type MealTime = 'Lunch' | 'Dinner';
export type Language = 'en' | 'ar';

export interface Profile {
  id: string;
  name: string;
  fullName?: string;
  role: UserRole;
  avatar_url: string;
  language?: Language;
  family_code: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  created_by?: string;
  family_code: string;
}

export interface MealSelection {
  id: string;
  user_id: string;
  meal_id: string;
  meal_date: string;
  slot: MealTime;
  family_code: string;
  profile_data?: any;
  meal_data?: any;
}

export interface ConfirmedMeal {
  id: string;
  meal_id: string;
  meal_date: string;
  slot: MealTime;
  ready_at: string;
  family_code: string;
  meal_data?: any;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  family_code: string;
}

export interface CartItem {
  id: string;
  item_name: string;
  quantity: number;
  is_purchased: boolean;
  family_code: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  family_code: string;
  profile_data?: any;
}

export interface AppNotification {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}
