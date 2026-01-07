
import { Profile, Meal, MealSelection, ConfirmedMeal, InventoryItem, CartItem, ChatMessage, UserRole } from '../types';

const STORAGE_KEYS = {
  USER: 'mykitchen_user',
  SELECTIONS: 'mykitchen_selections',
  CONFIRMED: 'mykitchen_confirmed',
  INVENTORY: 'mykitchen_inventory',
  CART: 'mykitchen_cart',
  MESSAGES: 'mykitchen_messages',
  PROFILES: 'mykitchen_profiles'
};

// Initial Data
// Added missing family_code to satisfy Meal type requirement
const INITIAL_MEALS: Meal[] = [
  { id: '1', name: 'Spaghetti Bolognese', description: 'Classic Italian meat sauce', category: 'Dinner', family_code: 'default' },
  { id: '2', name: 'Grilled Chicken Salad', description: 'Healthy greens and protein', category: 'Lunch', family_code: 'default' },
  { id: '3', name: 'Beef Tacos', description: 'Mexican style street tacos', category: 'Dinner', family_code: 'default' },
  { id: '4', name: 'Club Sandwich', description: 'Toasted bread with deli meats', category: 'Lunch', family_code: 'default' },
  { id: '5', name: 'Mushroom Risotto', description: 'Creamy arborio rice', category: 'Dinner', family_code: 'default' },
];

export const db = {
  save: (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data)),
  get: (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  getInitialMeals: () => INITIAL_MEALS,

  clearAll: () => Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
};
