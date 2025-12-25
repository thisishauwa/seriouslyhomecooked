// Supabase Service Layer - All database operations
import { supabase } from './supabase';
import { MealKit, UserProfile, CartItem } from '../types';

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      people: profile.people,
      recipes_per_week: profile.recipesPerWeek,
      skill_level: profile.skillLevel,
      allergies: profile.allergies,
      preferences: profile.preferences,
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  
  return data;
};

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
  
  return data?.is_admin || false;
};

// ============================================================================
// RECIPE OPERATIONS
// ============================================================================

export const getRecipes = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
  
  return data || [];
};

export const getRecipeById = async (id: string) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
  
  return data;
};

export const createRecipe = async (recipe: Omit<MealKit, 'id'>, userId: string) => {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title: recipe.title,
      description: recipe.description,
      prep_time: recipe.prepTime,
      servings: recipe.servings,
      calories: recipe.calories,
      price: recipe.price,
      image_url: recipe.imageUrl,
      category: recipe.category,
      skill_level: recipe.skillLevel,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      nutrition: recipe.nutrition || {},
      created_by: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
  
  return data;
};

export const updateRecipe = async (id: string, recipe: Partial<MealKit>) => {
  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: recipe.title,
      description: recipe.description,
      prep_time: recipe.prepTime,
      servings: recipe.servings,
      calories: recipe.calories,
      price: recipe.price,
      image_url: recipe.imageUrl,
      category: recipe.category,
      skill_level: recipe.skillLevel,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      nutrition: recipe.nutrition,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
  
  return data;
};

export const deleteRecipe = async (id: string) => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const bulkDeleteRecipes = async (ids: string[]) => {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .in('id', ids);
  
  if (error) {
    console.error('Error bulk deleting recipes:', error);
    throw error;
  }
};

// ============================================================================
// SAVED RECIPES (FAVORITES)
// ============================================================================

export const getSavedRecipes = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching saved recipes:', error);
    return [];
  }
  
  return data?.map(item => item.recipe_id) || [];
};

export const saveRecipe = async (userId: string, recipeId: string) => {
  const { error } = await supabase
    .from('saved_recipes')
    .insert({ user_id: userId, recipe_id: recipeId });
  
  if (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const unsaveRecipe = async (userId: string, recipeId: string) => {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);
  
  if (error) {
    console.error('Error unsaving recipe:', error);
    throw error;
  }
};

// ============================================================================
// CART OPERATIONS
// ============================================================================

export const getCart = async (userId: string) => {
  const { data, error } = await supabase
    .from('carts')
    .select('items')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching cart:', error);
    return [];
  }
  
  return data?.items || [];
};

export const updateCart = async (userId: string, items: CartItem[]) => {
  const { error } = await supabase
    .from('carts')
    .upsert({
      user_id: userId,
      items: items,
    });
  
  if (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

export const createOrder = async (userId: string, cart: CartItem[], totalPrice: number, deliveryDate?: Date) => {
  const recipeIds = cart.map(item => item.id);
  const quantities = cart.reduce((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {} as Record<string, number>);
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      recipe_ids: recipeIds,
      quantities: quantities,
      total_price: totalPrice,
      delivery_date: deliveryDate,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data;
};

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data || [];
};

// ============================================================================
// WEEKLY MENU OPERATIONS
// ============================================================================

export const getWeeklyMenus = async () => {
  const { data, error } = await supabase
    .from('weekly_menus')
    .select('*')
    .eq('is_published', true)
    .order('week_of', { ascending: false });
  
  if (error) {
    console.error('Error fetching weekly menus:', error);
    return [];
  }
  
  return data || [];
};

export const createWeeklyMenu = async (weekOf: string, recipeIds: string[], userId: string) => {
  const { data, error } = await supabase
    .from('weekly_menus')
    .insert({
      week_of: weekOf,
      recipe_ids: recipeIds,
      created_by: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating weekly menu:', error);
    throw error;
  }
  
  return data;
};

export const updateWeeklyMenu = async (weekOf: string, recipeIds: string[]) => {
  const { data, error } = await supabase
    .from('weekly_menus')
    .update({ recipe_ids: recipeIds })
    .eq('week_of', weekOf)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating weekly menu:', error);
    throw error;
  }
  
  return data;
};

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return data || [];
};

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
  
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// ============================================================================
// PRODUCERS & JOURNAL (for future use)
// ============================================================================

export const getProducers = async () => {
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching producers:', error);
    return [];
  }
  
  return data || [];
};

export const getJournalEntries = async () => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  
  return data || [];
};

