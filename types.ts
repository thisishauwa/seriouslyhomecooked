
export interface Ingredient {
  name: string;
  amount: string;
  imageUrl?: string;
}

export interface CookingStep {
  title: string;
  description: string;
  tip?: string;
}

export interface MealKit {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  servings: number;
  calories: number;
  price: number;
  imageUrl: string;
  category: 'Modern British' | 'Mediterranean' | 'Asian Fusion' | 'Classic Comfort';
  skillLevel: 'Easy' | 'Medium' | 'Advanced';
  ingredients?: Ingredient[];
  steps?: CookingStep[];
  nutrition?: {
    carbs: string;
    protein: string;
    fats: string;
  };
}

export interface Producer {
  id: string;
  name: string;
  location: string;
  specialty: string;
  story: string;
  imageUrl: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
}

export interface CartItem extends MealKit {
  quantity: number;
}

export interface BoxConfig {
  people: number;
  recipesPerWeek: number;
}

export interface UserProfile extends BoxConfig {
  skillLevel: 'Easy' | 'Medium' | 'Advanced' | 'All';
  allergies: string[];
  preferences: string[];
  createdAt?: string; // ISO date string from Supabase
}

export type View = 'HOME' | 'PLANS' | 'MENU' | 'CHECKOUT' | 'JOURNAL' | 'PROFILE' | 'ONBOARDING' | 'ADMIN';

export interface RecommendedMeal {
  name: string;
  reason: string;
  pairing: string;
}

export enum FormStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
