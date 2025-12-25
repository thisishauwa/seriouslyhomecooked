
import React, { useState, useEffect } from 'react';
import { MealKit, Ingredient, CookingStep, Producer, JournalEntry } from '../types';
import { MENU_ITEMS, PRODUCERS, JOURNAL_ENTRIES } from '../constants';
import { 
  getRecipes, 
  getAllUsers, 
  getAllOrders, 
  getWeeklyMenus,
  getProducers,
  getJournalEntries,
  updateOrderStatus,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  bulkDeleteRecipes
} from '../lib/supabase-service';

interface AdminProps {
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'Active' | 'Paused' | 'Cancelled';
}

interface WeeklySelection {
  weekOf: string;
  recipeIds: string[];
}

interface OrderHistory {
  id: string;
  user_id: string;
  recipe_ids: string[];
  quantities: Record<string, number>;
  total_price: number;
  status: string;
  delivery_date?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  people: number;
  recipes: number;
  price: number;
  popular: boolean;
  features: string[];
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'weekly' | 'users' | 'orders' | 'producers' | 'journal' | 'analytics' | 'plans' | 'settings'>('overview');
  const [recipes, setRecipes] = useState<MealKit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [weeklySelections, setWeeklySelections] = useState<WeeklySelection[]>([]);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<MealKit | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [isAddingJournal, setIsAddingJournal] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    { id: '1', name: 'Starter', people: 2, recipes: 2, price: 29.99, popular: false, features: ['Free delivery', 'Pause anytime', 'Fresh ingredients', 'Recipe cards'] },
    { id: '2', name: 'Family', people: 4, recipes: 3, price: 49.99, popular: true, features: ['Free delivery', 'Pause anytime', 'Fresh ingredients', 'Recipe cards', 'Priority support'] },
    { id: '3', name: 'Gourmet', people: 2, recipes: 4, price: 59.99, popular: false, features: ['Free delivery', 'Pause anytime', 'Fresh ingredients', 'Recipe cards', 'Premium recipes', 'Wine pairing'] }
  ]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  
  // Recipe filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('All');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Load data from Supabase on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Load recipes
      const recipesData = await getRecipes();
      setRecipes(recipesData.length > 0 ? recipesData : MENU_ITEMS);

      // Load users
      const usersData = await getAllUsers();
      setUsers(usersData.map(u => ({
        id: u.id,
        name: u.full_name || 'Unknown',
        email: u.email || '',
        plan: `${u.people || 2} People, ${u.recipes_per_week || 3} Meals/Week`,
        status: u.subscription_status || 'Active'
      })));

      // Load orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      // Load weekly menus
      const weeklyData = await getWeeklyMenus();
      setWeeklySelections(weeklyData.map(w => ({
        weekOf: w.week_of,
        recipeIds: w.recipe_ids
      })));

      // Load producers
      const producersData = await getProducers();
      setProducers(producersData.length > 0 ? producersData : PRODUCERS);

      // Load journal entries
      const journalData = await getJournalEntries();
      setJournalEntries(journalData.length > 0 ? journalData : JOURNAL_ENTRIES);

    } catch (error) {
      console.error('Error loading admin data:', error);
      // Fallback to constants if Supabase fails
      setRecipes(MENU_ITEMS);
      setProducers(PRODUCERS);
      setJournalEntries(JOURNAL_ENTRIES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: MealKit) => {
    try {
      if (editingRecipe) {
        await updateRecipe(recipe.id, recipe);
        setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
      } else {
        const newRecipe = await createRecipe(recipe, 'admin'); // TODO: get actual admin user ID
        setRecipes(prev => [...prev, newRecipe]);
      }
      setEditingRecipe(null);
      setIsAddingRecipe(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipes(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecipes.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRecipes.length} recipe(s)?`)) {
      try {
        await bulkDeleteRecipes(selectedRecipes);
        setRecipes(prev => prev.filter(r => !selectedRecipes.includes(r.id)));
        setSelectedRecipes([]);
      } catch (error) {
        console.error('Error bulk deleting recipes:', error);
        alert('Failed to delete recipes. Please try again.');
      }
    }
  };

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleAllRecipes = () => {
    if (selectedRecipes.length === filteredRecipes.length) {
      setSelectedRecipes([]);
    } else {
      setSelectedRecipes(filteredRecipes.map(r => r.id));
    }
  };

  const handleUpdateUserStatus = (userId: string, status: 'Active' | 'Paused' | 'Cancelled') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  const handleUpdateWeeklySelection = (weekOf: string, recipeIds: string[]) => {
    setWeeklySelections(prev => {
      const existing = prev.find(w => w.weekOf === weekOf);
      if (existing) {
        return prev.map(w => w.weekOf === weekOf ? { ...w, recipeIds } : w);
      }
      return [...prev, { weekOf, recipeIds }];
    });
  };

  const handleBulkUpload = (newRecipes: MealKit[]) => {
    setRecipes(prev => [...prev, ...newRecipes]);
    setShowBulkUpload(false);
  };

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSkill = selectedSkillLevel === 'All' || recipe.skillLevel === selectedSkillLevel;
    return matchesSearch && matchesCategory && matchesSkill;
  });

  // Calculate stats
  const stats = {
    totalRecipes: recipes.length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    weeklyMenus: weeklySelections.length,
    recentRecipes: recipes.slice(-3).reverse()
  };

  const categories = ['All', 'Modern British', 'Mediterranean', 'Asian Fusion', 'Classic Comfort'];
  const skillLevels = ['All', 'Easy', 'Medium', 'Advanced'];

  return (
    <div className="min-h-screen bg-white selection:bg-brand-sage selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl tracking-tighter text-brand-ink mb-1">Admin Dashboard</h1>
              <p className="text-brand-ink/30 text-[10px] tracking-[0.3em] uppercase font-bold">Seriously Homecooked</p>
            </div>
            <button
              onClick={onLogout}
              className="text-[9px] tracking-widest uppercase font-bold text-brand-ink/20 hover:text-brand-terracotta transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-black/5 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recipes', label: 'Recipes' },
              { id: 'weekly', label: 'Weekly Menu' },
              { id: 'orders', label: 'Orders' },
              { id: 'users', label: 'Users' },
              { id: 'journal', label: 'Journal' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'plans', label: 'Plans' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative py-5 text-[10px] tracking-widest uppercase font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-brand-ink'
                    : 'text-brand-ink/20 hover:text-brand-ink/40'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-sage" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <div className="text-center">
              <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-4">Welcome back</h2>
              <p className="text-brand-ink/40 text-lg font-serif italic">Here's what's happening with your service</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#FDFBF7] p-8 rounded border border-black/5">
                <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-3">Total Recipes</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-ink mb-2">{stats.totalRecipes}</div>
                <div className="text-brand-ink/20 text-[9px] uppercase tracking-widest font-bold">In collection</div>
              </div>

              <div className="bg-[#FDFBF7] p-8 rounded border border-black/5">
                <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-3">Active Users</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-ink mb-2">{stats.activeUsers}</div>
                <div className="text-brand-ink/20 text-[9px] uppercase tracking-widest font-bold">of {stats.totalUsers} total</div>
              </div>

              <div className="bg-[#FDFBF7] p-8 rounded border border-black/5">
                <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-3">Weekly Menus</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-ink mb-2">{stats.weeklyMenus}</div>
                <div className="text-brand-ink/20 text-[9px] uppercase tracking-widest font-bold">Scheduled</div>
              </div>

              <div className="bg-brand-sage/5 p-8 rounded border border-brand-sage/20">
                <div className="text-brand-sage/60 text-[9px] uppercase tracking-widest font-bold mb-3">Growth</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-sage mb-2">+12%</div>
                <div className="text-brand-sage/40 text-[9px] uppercase tracking-widest font-bold">This month</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-black/5 pt-16">
              <h3 className="font-serif text-3xl tracking-tighter text-brand-ink mb-8 text-center">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => {
                    setActiveTab('recipes');
                    setIsAddingRecipe(true);
                  }}
                  className="group p-8 bg-white border border-black/5 rounded hover:border-brand-sage/40 transition-all text-left"
                >
                  <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-4">Create</div>
                  <div className="font-serif text-2xl tracking-tighter text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">Add New Recipe</div>
                  <div className="text-brand-ink/30 text-sm">Create a single recipe with full details</div>
                </button>

                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="group p-8 bg-white border border-black/5 rounded hover:border-brand-sage/40 transition-all text-left"
                >
                  <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-4">Import</div>
                  <div className="font-serif text-2xl tracking-tighter text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">Bulk Upload</div>
                  <div className="text-brand-ink/30 text-sm">Import multiple recipes via CSV or Markdown</div>
                </button>

                <button
                  onClick={() => setActiveTab('weekly')}
                  className="group p-8 bg-white border border-black/5 rounded hover:border-brand-sage/40 transition-all text-left"
                >
                  <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-4">Curate</div>
                  <div className="font-serif text-2xl tracking-tighter text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">Set Weekly Menu</div>
                  <div className="text-brand-ink/30 text-sm">Choose featured recipes for each week</div>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="group p-8 bg-white border border-black/5 rounded hover:border-brand-sage/40 transition-all text-left"
                >
                  <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-4">Manage</div>
                  <div className="font-serif text-2xl tracking-tighter text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">View Users</div>
                  <div className="text-brand-ink/30 text-sm">Manage subscriptions and user accounts</div>
                </button>
              </div>
            </div>

            {/* Recent Recipes */}
            <div className="border-t border-black/5 pt-16">
              <h3 className="font-serif text-3xl tracking-tighter text-brand-ink mb-8">Recently Added</h3>
              <div className="grid gap-6">
                {stats.recentRecipes.map(recipe => (
                  <div key={recipe.id} className="flex items-center gap-6 p-6 bg-[#FDFBF7] rounded border border-black/5 hover:border-brand-sage/20 transition-all group">
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-32 h-32 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-serif text-2xl tracking-tight text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">{recipe.title}</h4>
                      <p className="text-brand-ink/40 text-sm mb-3">{recipe.description}</p>
                      <div className="flex items-center gap-4 text-[9px] text-brand-ink/30 uppercase tracking-widest font-bold">
                        <span>{recipe.category}</span>
                        <span>•</span>
                        <span>{recipe.skillLevel}</span>
                        <span>•</span>
                        <span className="text-brand-sage">£{recipe.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-black/5 pb-8">
              <div>
                <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Recipes</h2>
                <p className="text-brand-ink/40 italic font-serif text-lg">
                  {filteredRecipes.length} of {recipes.length} recipes
                  {selectedRecipes.length > 0 && ` • ${selectedRecipes.length} selected`}
                </p>
              </div>
              <div className="flex gap-3">
                {selectedRecipes.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-6 py-3 border border-brand-terracotta/20 text-brand-terracotta text-[10px] tracking-widest uppercase font-bold rounded hover:bg-brand-terracotta/10 transition-all"
                  >
                    Delete ({selectedRecipes.length})
                  </button>
                )}
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="px-6 py-3 border border-brand-ink/10 text-brand-ink text-[10px] tracking-widest uppercase font-bold rounded hover:border-brand-sage hover:text-brand-sage transition-all"
                >
                  Bulk Upload
                </button>
                <button
                  onClick={() => setIsAddingRecipe(true)}
                  className="px-8 py-3 bg-brand-ink text-white text-[10px] tracking-widest uppercase font-bold rounded hover:bg-brand-sage transition-all"
                >
                  Add Recipe
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-brand-clay/20 border border-black/5 rounded text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="px-4 py-3 bg-brand-clay/20 border border-black/5 rounded text-sm text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>{level === 'All' ? 'All Levels' : level}</option>
                ))}
              </select>
              {(searchQuery || selectedCategory !== 'All' || selectedSkillLevel !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedSkillLevel('All');
                  }}
                  className="px-4 py-3 text-brand-ink/40 text-[9px] uppercase tracking-widest font-bold hover:text-brand-ink transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Bulk Select */}
            {filteredRecipes.length > 0 && (
              <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                <input
                  type="checkbox"
                  checked={selectedRecipes.length === filteredRecipes.length && filteredRecipes.length > 0}
                  onChange={toggleAllRecipes}
                  className="w-4 h-4 text-brand-sage focus:ring-brand-sage rounded"
                />
                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40">
                  Select All ({filteredRecipes.length})
                </span>
              </div>
            )}

            {/* Compact Grid Layout */}
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map(recipe => (
                  <div key={recipe.id} className="group bg-white border border-black/5 rounded hover:border-brand-sage/20 transition-all overflow-hidden">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedRecipes.includes(recipe.id)}
                          onChange={() => toggleRecipeSelection(recipe.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-brand-sage focus:ring-brand-sage rounded shadow-lg"
                        />
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRecipe(recipe);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded hover:bg-white transition-all"
                        >
                          <svg className="w-4 h-4 text-brand-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(recipe.id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded hover:bg-brand-terracotta/10 transition-all"
                        >
                          <svg className="w-4 h-4 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-serif text-lg tracking-tight text-brand-ink mb-1 group-hover:text-brand-sage transition-colors line-clamp-1">{recipe.title}</h3>
                      <p className="text-brand-ink/40 text-xs mb-3 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center justify-between text-[8px] text-brand-ink/30 uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-brand-clay/20 rounded">{recipe.category}</span>
                          <span className="px-2 py-1 bg-brand-clay/20 rounded">{recipe.skillLevel}</span>
                        </div>
                        <span className="text-brand-sage font-bold">£{recipe.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-brand-ink/40 italic font-serif text-lg">No recipes found</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedSkillLevel('All');
                  }}
                  className="mt-4 text-brand-sage text-[10px] uppercase tracking-widest font-bold hover:text-brand-ink transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Weekly Menu Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-end justify-between border-b border-black/5 pb-8">
              <div>
                <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Weekly Menu</h2>
                <p className="text-brand-ink/40 italic font-serif text-lg">Curate featured recipes for each week</p>
              </div>
              <button
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  const weekOf = nextWeek.toISOString().split('T')[0];
                  setWeeklySelections(prev => [...prev, { weekOf, recipeIds: [] }]);
                }}
                className="px-8 py-3 bg-brand-ink text-white text-[10px] tracking-widest uppercase font-bold rounded hover:bg-brand-sage transition-all"
              >
                Add New Week
              </button>
            </div>
            
            <div className="space-y-6">
              {weeklySelections.map(week => (
                <WeeklyMenuEditor
                  key={week.weekOf}
                  weekOf={week.weekOf}
                  selectedRecipeIds={week.recipeIds}
                  allRecipes={recipes}
                  onUpdate={(recipeIds) => handleUpdateWeeklySelection(week.weekOf, recipeIds)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="border-b border-black/5 pb-8">
              <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Users</h2>
              <p className="text-brand-ink/40 italic font-serif text-lg">{users.length} total, {stats.activeUsers} active subscriptions</p>
            </div>
            
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-8 bg-white border border-black/5 rounded hover:border-brand-sage/20 transition-all">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl tracking-tight text-brand-ink mb-1">{user.name}</h3>
                    <p className="text-brand-ink/40 text-sm mb-2">{user.email}</p>
                    <p className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold">{user.plan}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded ${
                      user.status === 'Active' ? 'bg-brand-sage/10 text-brand-sage' :
                      user.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-brand-terracotta/10 text-brand-terracotta'
                    }`}>
                      {user.status}
                    </span>
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as any)}
                      className="px-4 py-2 border border-black/10 rounded text-sm text-brand-ink focus:outline-none focus:border-brand-sage transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-end justify-between border-b border-black/5 pb-8">
              <div>
                <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Orders</h2>
                <p className="text-brand-ink/40 italic font-serif text-lg">{orders.length} total orders</p>
              </div>
              <div className="flex gap-3">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                      orderStatusFilter === status
                        ? 'bg-brand-sage text-white'
                        : 'bg-white border border-black/10 text-brand-ink/40 hover:border-brand-sage/40'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {orders
                .filter(order => orderStatusFilter === 'all' || order.status === orderStatusFilter)
                .map(order => (
                <div key={order.id} className="p-8 bg-white border border-black/5 rounded hover:border-brand-sage/20 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-serif text-2xl tracking-tight text-brand-ink mb-1">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-brand-ink/40 text-sm">
                        {order.profiles?.full_name || 'Unknown'} • {order.profiles?.email || ''}
                      </p>
                      <p className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mt-2">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-3xl tracking-tight text-brand-sage mb-2">
                        £{order.total_price.toFixed(2)}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          updateOrderStatus(order.id, e.target.value);
                          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                        }}
                        className="px-4 py-2 border border-black/10 rounded text-sm text-brand-ink focus:outline-none focus:border-brand-sage transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t border-black/5 pt-4">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/30 mb-3">Order Items</p>
                    <div className="space-y-2">
                      {order.recipe_ids.map(recipeId => {
                        const recipe = recipes.find(r => r.id === recipeId);
                        const quantity = order.quantities[recipeId] || 1;
                        return (
                          <div key={recipeId} className="flex items-center justify-between text-sm">
                            <span className="text-brand-ink">{recipe?.title || 'Unknown Recipe'}</span>
                            <span className="text-brand-ink/40">x{quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-end justify-between border-b border-black/5 pb-8">
              <div>
                <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Journal</h2>
                <p className="text-brand-ink/40 italic font-serif text-lg">{journalEntries.length} entries</p>
              </div>
              <button
                onClick={() => setIsAddingJournal(true)}
                className="px-6 py-3 bg-brand-ink text-white rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
              >
                + New Entry
              </button>
            </div>
            
            <div className="grid gap-6">
              {journalEntries.map(entry => (
                <div key={entry.id} className="flex gap-6 p-6 bg-white border border-black/5 rounded hover:border-brand-sage/20 transition-all group">
                  <img src={entry.imageUrl} alt={entry.title} className="w-48 h-32 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl tracking-tight text-brand-ink mb-2 group-hover:text-brand-sage transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-brand-ink/40 text-sm mb-3">{entry.excerpt}</p>
                    <div className="flex items-center gap-4 text-[9px] text-brand-ink/30 uppercase tracking-widest font-bold">
                      <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{entry.author}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setEditingJournal(entry)}
                      className="px-4 py-2 border border-black/10 rounded text-[9px] uppercase tracking-widest font-bold text-brand-ink hover:border-brand-sage transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this journal entry?')) {
                          setJournalEntries(prev => prev.filter(j => j.id !== entry.id));
                        }
                      }}
                      className="px-4 py-2 border border-brand-terracotta/20 rounded text-[9px] uppercase tracking-widest font-bold text-brand-terracotta hover:bg-brand-terracotta/10 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="border-b border-black/5 pb-8">
              <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Analytics</h2>
              <p className="text-brand-ink/40 italic font-serif text-lg">Business insights and performance metrics</p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-brand-sage/10 to-brand-sage/5 p-8 rounded border border-brand-sage/20">
                <div className="text-brand-sage/60 text-[9px] uppercase tracking-widest font-bold mb-3">Total Revenue</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-sage mb-2">
                  £{orders.reduce((sum, o) => sum + o.total_price, 0).toFixed(2)}
                </div>
                <div className="text-brand-sage/40 text-[9px] uppercase tracking-widest font-bold">All time</div>
              </div>

              <div className="bg-[#FDFBF7] p-8 rounded border border-black/5">
                <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-3">Avg Order Value</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-ink mb-2">
                  £{orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length).toFixed(2) : '0.00'}
                </div>
                <div className="text-brand-ink/20 text-[9px] uppercase tracking-widest font-bold">Per order</div>
              </div>

              <div className="bg-[#FDFBF7] p-8 rounded border border-black/5">
                <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-3">Conversion Rate</div>
                <div className="font-serif text-5xl tracking-tighter text-brand-ink mb-2">
                  {users.length > 0 ? ((orders.length / users.length) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-brand-ink/20 text-[9px] uppercase tracking-widest font-bold">Orders per user</div>
              </div>
            </div>

            {/* Popular Recipes */}
            <div className="border-t border-black/5 pt-12">
              <h3 className="font-serif text-3xl tracking-tighter text-brand-ink mb-8">Most Popular Recipes</h3>
              <div className="space-y-4">
                {recipes.slice(0, 5).map((recipe, idx) => (
                  <div key={recipe.id} className="flex items-center gap-6 p-6 bg-white border border-black/5 rounded">
                    <div className="font-serif text-4xl text-brand-ink/10 font-bold w-12">{idx + 1}</div>
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-serif text-xl tracking-tight text-brand-ink mb-1">{recipe.title}</h4>
                      <p className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold">{recipe.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-2xl text-brand-sage">
                        {orders.filter(o => o.recipe_ids.includes(recipe.id)).length}
                      </div>
                      <div className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold">Orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Growth */}
            <div className="border-t border-black/5 pt-12">
              <h3 className="font-serif text-3xl tracking-tighter text-brand-ink mb-8">User Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-black/5 rounded p-8">
                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 mb-6">Subscription Status</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink text-sm">Active</span>
                      <span className="font-serif text-2xl text-brand-sage">{stats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink text-sm">Paused</span>
                      <span className="font-serif text-2xl text-yellow-600">
                        {users.filter(u => u.status === 'Paused').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink text-sm">Cancelled</span>
                      <span className="font-serif text-2xl text-brand-terracotta">
                        {users.filter(u => u.status === 'Cancelled').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/5 rounded p-8">
                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 mb-6">Retention</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink text-sm">Active Rate</span>
                      <span className="font-serif text-2xl text-brand-sage">
                        {users.length > 0 ? ((stats.activeUsers / users.length) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink text-sm">Churn Rate</span>
                      <span className="font-serif text-2xl text-brand-terracotta">
                        {users.length > 0 ? ((users.filter(u => u.status === 'Cancelled').length / users.length) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANS TAB */}
        {activeTab === 'plans' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-end justify-between border-b border-black/5 pb-8">
              <div>
                <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Subscription Plans</h2>
                <p className="text-brand-ink/40 italic font-serif text-lg">Manage pricing tiers and plan features</p>
              </div>
              <button
                onClick={() => setIsAddingPlan(true)}
                className="px-6 py-3 bg-brand-ink text-white rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
              >
                + New Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map(plan => (
                <div key={plan.id} className={`bg-white border rounded p-8 ${plan.popular ? 'border-brand-sage ring-2 ring-brand-sage/20' : 'border-black/5'}`}>
                  {plan.popular && (
                    <div className="text-[9px] uppercase tracking-widest font-bold text-brand-sage mb-4">Most Popular</div>
                  )}
                  <h3 className="font-serif text-3xl tracking-tight text-brand-ink mb-2">{plan.name}</h3>
                  <div className="font-serif text-5xl tracking-tighter text-brand-sage mb-6">
                    £{plan.price.toFixed(2)}
                    <span className="text-lg text-brand-ink/30">/week</span>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-brand-ink">
                      <svg className="w-5 h-5 text-brand-sage" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{plan.recipes} recipes per week</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-brand-ink">
                      <svg className="w-5 h-5 text-brand-sage" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Serves {plan.people} people</span>
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-brand-ink">
                        <svg className="w-5 h-5 text-brand-sage" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingPlan(plan)}
                      className="flex-1 px-6 py-3 border border-black/10 rounded text-[10px] tracking-widest uppercase font-bold text-brand-ink hover:border-brand-sage hover:text-brand-sage transition-all"
                    >
                      Edit Plan
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${plan.name} plan?`)) {
                          setSubscriptionPlans(prev => prev.filter(p => p.id !== plan.id));
                        }
                      }}
                      className="px-4 py-3 border border-brand-terracotta/20 rounded text-[10px] tracking-widest uppercase font-bold text-brand-terracotta hover:bg-brand-terracotta/10 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-4 text-center text-sm text-brand-ink/40">
                    {users.filter(u => u.plan.includes(`${plan.people} People`) && u.plan.includes(`${plan.recipes} Meals`)).length} subscribers
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="border-b border-black/5 pb-8">
              <h2 className="font-serif text-6xl tracking-tighter text-brand-ink mb-2">Settings</h2>
              <p className="text-brand-ink/40 italic font-serif text-lg">Configure your service</p>
            </div>

            {/* Shipping Settings */}
            <div className="bg-white border border-black/5 rounded p-8">
              <h3 className="font-serif text-3xl tracking-tight text-brand-ink mb-6">Shipping & Delivery</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Standard Shipping Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-ink text-lg">£</span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="4.95"
                      className="w-32 px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Free Shipping Threshold</label>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-ink text-lg">£</span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="50.00"
                      className="w-32 px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Delivery Days</label>
                  <div className="flex gap-3 flex-wrap">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded cursor-pointer hover:border-brand-sage transition-all">
                        <input type="checkbox" defaultChecked={['Tuesday', 'Wednesday', 'Thursday'].includes(day)} className="rounded" />
                        <span className="text-sm text-brand-ink">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="bg-white border border-black/5 rounded p-8">
              <h3 className="font-serif text-3xl tracking-tight text-brand-ink mb-6">Business Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Business Name</label>
                  <input
                    type="text"
                    defaultValue="Seriously Homecooked"
                    className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue="hello@seriouslyhomecooked.com"
                    className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+44 20 1234 5678"
                    className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white border border-black/5 rounded p-8">
              <h3 className="font-serif text-3xl tracking-tight text-brand-ink mb-6">Notifications</h3>
              <div className="space-y-4">
                {[
                  { label: 'New Order Notifications', description: 'Get notified when a new order is placed' },
                  { label: 'Low Stock Alerts', description: 'Receive alerts when ingredients are running low' },
                  { label: 'User Signup Notifications', description: 'Get notified when new users sign up' },
                  { label: 'Weekly Summary Reports', description: 'Receive weekly performance summaries' }
                ].map(setting => (
                  <label key={setting.label} className="flex items-start gap-4 p-4 border border-black/5 rounded cursor-pointer hover:border-brand-sage/40 transition-all">
                    <input type="checkbox" defaultChecked className="mt-1 rounded" />
                    <div>
                      <div className="text-brand-ink font-medium mb-1">{setting.label}</div>
                      <div className="text-brand-ink/40 text-sm">{setting.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="px-8 py-4 bg-brand-ink text-white rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Recipe Editor Modal */}
      {(editingRecipe || isAddingRecipe) && (
        <RecipeEditor
          recipe={editingRecipe}
          onSave={handleSaveRecipe}
          onClose={() => {
            setEditingRecipe(null);
            setIsAddingRecipe(false);
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onUpload={handleBulkUpload}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {/* Journal Editor Modal */}
      {(editingJournal || isAddingJournal) && (
        <JournalEditor
          entry={editingJournal}
          onSave={(entry) => {
            if (editingJournal) {
              setJournalEntries(prev => prev.map(j => j.id === entry.id ? entry : j));
            } else {
              setJournalEntries(prev => [...prev, { ...entry, id: Date.now().toString() }]);
            }
            setEditingJournal(null);
            setIsAddingJournal(false);
          }}
          onClose={() => {
            setEditingJournal(null);
            setIsAddingJournal(false);
          }}
        />
      )}

      {/* Plan Editor Modal */}
      {(editingPlan || isAddingPlan) && (
        <PlanEditor
          plan={editingPlan}
          onSave={(plan) => {
            if (editingPlan) {
              setSubscriptionPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
            } else {
              setSubscriptionPlans(prev => [...prev, { ...plan, id: Date.now().toString() }]);
            }
            setEditingPlan(null);
            setIsAddingPlan(false);
          }}
          onClose={() => {
            setEditingPlan(null);
            setIsAddingPlan(false);
          }}
        />
      )}
    </div>
  );
};

// Enhanced Recipe Editor Component with Steps and Ingredients
const RecipeEditor: React.FC<{
  recipe: MealKit | null;
  onSave: (recipe: MealKit) => void;
  onClose: () => void;
}> = ({ recipe, onSave, onClose }) => {
  const [formData, setFormData] = useState<MealKit>(recipe || {
    id: '',
    title: '',
    description: '',
    prepTime: '',
    servings: 2,
    calories: 0,
    price: 0,
    imageUrl: '',
    category: 'Modern British',
    skillLevel: 'Easy',
    ingredients: [],
    steps: [],
    nutrition: { carbs: '0g', protein: '0g', fats: '0g' }
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients || []);
  const [steps, setSteps] = useState<CookingStep[]>(recipe?.steps || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, ingredients, steps });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { title: '', description: '' }]);
  };

  const updateStep = (index: number, field: keyof CookingStep, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b border-black/5">
          <h3 className="font-serif text-4xl tracking-tighter text-brand-ink mb-2">
            {recipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h3>
          <p className="text-brand-ink/40 text-sm italic">Fill in all the delicious details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-brand-terracotta uppercase tracking-[0.3em] mb-6">Basic Information</h4>
            
            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Recipe Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                placeholder="e.g. Pan-Roasted Seabass"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                rows={3}
                placeholder="A sophisticated coastal classic..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Prep Time</label>
                <input
                  type="text"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  placeholder="e.g. 25 mins"
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Servings</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Calories</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                >
                  <option value="Modern British">Modern British</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Asian Fusion">Asian Fusion</option>
                  <option value="Classic Comfort">Classic Comfort</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Skill Level</label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as any })}
                  className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-6 pt-8 border-t border-black/5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-brand-terracotta uppercase tracking-[0.3em]">Ingredients</h4>
              <button
                type="button"
                onClick={addIngredient}
                className="text-[9px] tracking-widest uppercase font-bold text-brand-sage hover:text-brand-ink transition-colors"
              >
                + Add Ingredient
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-brand-clay/10 rounded">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-brand-terracotta/40 hover:text-brand-terracotta transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps Section */}
          <div className="space-y-6 pt-8 border-t border-black/5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-brand-terracotta uppercase tracking-[0.3em]">Cooking Steps</h4>
              <button
                type="button"
                onClick={addStep}
                className="text-[9px] tracking-widest uppercase font-bold text-brand-sage hover:text-brand-ink transition-colors"
              >
                + Add Step
              </button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="p-4 bg-brand-clay/10 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest">Step {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-brand-terracotta/40 hover:text-brand-terracotta transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder="Step title (e.g. 'Score the skin')"
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    placeholder="Step description..."
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={step.tip || ''}
                    onChange={(e) => updateStep(index, 'tip', e.target.value)}
                    placeholder="Pro tip (optional)"
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded text-sm italic focus:outline-none focus:ring-1 focus:ring-brand-sage"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 border-t border-black/5">
            <button
              type="submit"
              className="flex-1 bg-brand-ink text-white px-6 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
            >
              Save Recipe
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-black/10 text-brand-ink rounded text-[10px] tracking-widest uppercase font-bold hover:border-brand-ink/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal: React.FC<{
  onUpload: (recipes: MealKit[]) => void;
  onClose: () => void;
}> = ({ onUpload, onClose }) => {
  const [uploadType, setUploadType] = useState<'csv' | 'markdown'>('csv');
  const [csvData, setCsvData] = useState('');
  const [markdownData, setMarkdownData] = useState('');
  const [error, setError] = useState('');

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleMarkdownUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMarkdownData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv: string): MealKit[] => {
    try {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      return lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const recipe: any = { id: `csv-${Date.now()}-${index}` };
        
        headers.forEach((header, i) => {
          const value = values[i];
          switch(header.toLowerCase()) {
            case 'title':
              recipe.title = value;
              break;
            case 'description':
              recipe.description = value;
              break;
            case 'preptime':
            case 'prep_time':
              recipe.prepTime = value;
              break;
            case 'servings':
              recipe.servings = parseInt(value) || 2;
              break;
            case 'calories':
              recipe.calories = parseInt(value) || 0;
              break;
            case 'price':
              recipe.price = parseFloat(value) || 0;
              break;
            case 'imageurl':
            case 'image_url':
              recipe.imageUrl = value;
              break;
            case 'category':
              recipe.category = value;
              break;
            case 'skilllevel':
            case 'skill_level':
              recipe.skillLevel = value;
              break;
          }
        });
        
        return recipe as MealKit;
      });
    } catch (err) {
      throw new Error('Invalid CSV format. Please check your file.');
    }
  };

  const parseMarkdown = (markdown: string): MealKit[] => {
    try {
      const recipes: MealKit[] = [];
      const recipeBlocks = markdown.split('---').filter(block => block.trim());
      
      recipeBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n');
        const recipe: any = { id: `md-${Date.now()}-${index}` };
        
        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          switch(key.trim().toLowerCase()) {
            case 'title':
              recipe.title = value;
              break;
            case 'description':
              recipe.description = value;
              break;
            case 'prep time':
            case 'preptime':
              recipe.prepTime = value;
              break;
            case 'servings':
              recipe.servings = parseInt(value) || 2;
              break;
            case 'calories':
              recipe.calories = parseInt(value) || 0;
              break;
            case 'price':
              recipe.price = parseFloat(value.replace('£', '')) || 0;
              break;
            case 'image':
            case 'imageurl':
              recipe.imageUrl = value;
              break;
            case 'category':
              recipe.category = value;
              break;
            case 'skill level':
            case 'skilllevel':
              recipe.skillLevel = value;
              break;
          }
        });
        
        if (recipe.title) {
          recipes.push(recipe as MealKit);
        }
      });
      
      return recipes;
    } catch (err) {
      throw new Error('Invalid Markdown format. Please check your file.');
    }
  };

  const handleSubmit = () => {
    try {
      setError('');
      let recipes: MealKit[] = [];
      
      if (uploadType === 'csv') {
        recipes = parseCSV(csvData);
      } else {
        recipes = parseMarkdown(markdownData);
      }
      
      if (recipes.length === 0) {
        setError('No valid recipes found in the file.');
        return;
      }
      
      onUpload(recipes);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b border-black/5">
          <h3 className="font-serif text-4xl tracking-tighter text-brand-ink mb-2">Bulk Upload</h3>
          <p className="text-brand-ink/40 text-sm italic">Import multiple recipes at once</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Upload Type Selector */}
          <div className="flex gap-4">
            <button
              onClick={() => setUploadType('csv')}
              className={`flex-1 p-6 rounded border transition-all text-left ${
                uploadType === 'csv'
                  ? 'border-brand-sage bg-brand-sage/5'
                  : 'border-black/5 hover:border-black/10'
              }`}
            >
              <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-2">Format</div>
              <div className="font-serif text-xl tracking-tight text-brand-ink">CSV Upload</div>
              <div className="text-brand-ink/40 text-sm mt-1">Comma-separated values</div>
            </button>
            <button
              onClick={() => setUploadType('markdown')}
              className={`flex-1 p-6 rounded border transition-all text-left ${
                uploadType === 'markdown'
                  ? 'border-brand-sage bg-brand-sage/5'
                  : 'border-black/5 hover:border-black/10'
              }`}
            >
              <div className="text-[10px] tracking-widest uppercase font-bold text-brand-terracotta mb-2">Format</div>
              <div className="font-serif text-xl tracking-tight text-brand-ink">Markdown Upload</div>
              <div className="text-brand-ink/40 text-sm mt-1">Structured text format</div>
            </button>
          </div>

          {/* Format Instructions */}
          {uploadType === 'csv' && (
            <div className="bg-brand-clay/10 border border-black/5 rounded p-4">
              <h4 className="text-[9px] font-bold text-brand-ink/60 uppercase tracking-widest mb-3">CSV Format:</h4>
              <pre className="text-xs text-brand-ink/60 overflow-x-auto font-mono">
{`title,description,prepTime,servings,calories,price,imageUrl,category,skillLevel
Pan-Roasted Seabass,A sophisticated coastal classic,25 mins,2,420,18.50,https://...,Modern British,Medium`}
              </pre>
            </div>
          )}

          {uploadType === 'markdown' && (
            <div className="bg-brand-clay/10 border border-black/5 rounded p-4">
              <h4 className="text-[9px] font-bold text-brand-ink/60 uppercase tracking-widest mb-3">Markdown Format:</h4>
              <pre className="text-xs text-brand-ink/60 overflow-x-auto font-mono">
{`---
Title: Pan-Roasted Seabass
Description: A sophisticated coastal classic
Prep Time: 25 mins
Servings: 2
Calories: 420
Price: 18.50
ImageUrl: https://...
Category: Modern British
Skill Level: Medium
---`}
              </pre>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-3">
              Upload {uploadType.toUpperCase()} File
            </label>
            <input
              type="file"
              accept={uploadType === 'csv' ? '.csv' : '.md,.markdown'}
              onChange={uploadType === 'csv' ? handleCSVUpload : handleMarkdownUpload}
              className="w-full px-4 py-3 border border-black/10 rounded hover:border-brand-sage transition-all cursor-pointer"
            />
          </div>

          {/* Preview */}
          {(csvData || markdownData) && (
            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-3">Preview</label>
              <textarea
                value={uploadType === 'csv' ? csvData : markdownData}
                onChange={(e) => uploadType === 'csv' ? setCsvData(e.target.value) : setMarkdownData(e.target.value)}
                className="w-full px-4 py-3 bg-brand-clay/10 border border-black/5 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-sage"
                rows={10}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-brand-terracotta/10 border border-brand-terracotta/20 text-brand-terracotta px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!csvData && !markdownData}
              className="flex-1 bg-brand-ink text-white px-6 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Upload Recipes
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 border border-black/10 text-brand-ink rounded text-[10px] tracking-widest uppercase font-bold hover:border-brand-ink/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weekly Menu Editor Component
const WeeklyMenuEditor: React.FC<{
  weekOf: string;
  selectedRecipeIds: string[];
  allRecipes: MealKit[];
  onUpdate: (recipeIds: string[]) => void;
}> = ({ weekOf, selectedRecipeIds, allRecipes, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleRecipe = (recipeId: string) => {
    if (selectedRecipeIds.includes(recipeId)) {
      onUpdate(selectedRecipeIds.filter(id => id !== recipeId));
    } else {
      onUpdate([...selectedRecipeIds, recipeId]);
    }
  };

  return (
    <div className="bg-white border border-black/5 rounded hover:border-brand-sage/20 transition-all">
      <div 
        className="p-8 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-serif text-2xl tracking-tight text-brand-ink mb-1">Week of {new Date(weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
          <p className="text-brand-ink/40 text-sm italic">
            {selectedRecipeIds.length} {selectedRecipeIds.length === 1 ? 'recipe' : 'recipes'} selected
          </p>
        </div>
        <svg 
          className={`w-5 h-5 text-brand-ink/20 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="border-t border-black/5 p-8 bg-[#FDFBF7]">
          <div className="grid gap-4">
            {allRecipes.map(recipe => (
              <label
                key={recipe.id}
                className="flex items-center gap-6 p-6 bg-white border border-black/5 rounded hover:border-brand-sage/20 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipeIds.includes(recipe.id)}
                  onChange={() => toggleRecipe(recipe.id)}
                  className="w-4 h-4 text-brand-sage focus:ring-brand-sage rounded"
                />
                <img src={recipe.imageUrl} alt={recipe.title} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-serif text-xl tracking-tight text-brand-ink group-hover:text-brand-sage transition-colors">{recipe.title}</h4>
                  <p className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mt-1">{recipe.category} • {recipe.skillLevel} • £{recipe.price}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Journal Editor Component
const JournalEditor: React.FC<{
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onClose: () => void;
}> = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState<JournalEntry>(
    entry || {
      id: '',
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b border-black/5">
          <h3 className="font-serif text-4xl tracking-tighter text-brand-ink mb-2">
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h3>
          <p className="text-brand-ink/40 text-sm italic">Share your culinary stories</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              placeholder="A Day at the Market"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              rows={2}
              placeholder="A brief summary..."
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all font-serif"
              rows={12}
              placeholder="Tell your story..."
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                placeholder="Author name"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-black/5">
            <button
              type="submit"
              className="flex-1 bg-brand-ink text-white px-6 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
            >
              {entry ? 'Update Entry' : 'Publish Entry'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-black/10 text-brand-ink rounded text-[10px] tracking-widest uppercase font-bold hover:border-brand-ink/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Plan Editor Component
const PlanEditor: React.FC<{
  plan: SubscriptionPlan | null;
  onSave: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}> = ({ plan, onSave, onClose }) => {
  const [formData, setFormData] = useState<SubscriptionPlan>(
    plan || {
      id: '',
      name: '',
      people: 2,
      recipes: 2,
      price: 0,
      popular: false,
      features: ['Free delivery', 'Pause anytime', 'Fresh ingredients', 'Recipe cards']
    }
  );

  const [featureInput, setFeatureInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b border-black/5">
          <h3 className="font-serif text-4xl tracking-tighter text-brand-ink mb-2">
            {plan ? 'Edit Plan' : 'New Subscription Plan'}
          </h3>
          <p className="text-brand-ink/40 text-sm italic">Configure pricing and features</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
              placeholder="e.g. Family Plan"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">People</label>
              <input
                type="number"
                min="1"
                value={formData.people}
                onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Recipes/Week</label>
              <input
                type="number"
                min="1"
                value={formData.recipes}
                onChange={(e) => setFormData({ ...formData, recipes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Price (£/week)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="w-5 h-5 rounded text-brand-sage focus:ring-brand-sage"
              />
              <span className="text-sm text-brand-ink">Mark as "Most Popular"</span>
            </label>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-brand-ink/40 uppercase tracking-widest mb-2">Features</label>
            <div className="space-y-3 mb-3">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-brand-clay/10 rounded">
                  <svg className="w-5 h-5 text-brand-sage flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 text-sm text-brand-ink">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-brand-terracotta hover:text-brand-terracotta/70 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-4 py-3 bg-brand-clay/20 border border-black/5 rounded focus:outline-none focus:ring-1 focus:ring-brand-sage transition-all"
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-6 py-3 bg-brand-sage text-white rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage/80 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-black/5">
            <button
              type="submit"
              className="flex-1 bg-brand-ink text-white px-6 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
            >
              {plan ? 'Update Plan' : 'Create Plan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-black/10 text-brand-ink rounded text-[10px] tracking-widest uppercase font-bold hover:border-brand-ink/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
