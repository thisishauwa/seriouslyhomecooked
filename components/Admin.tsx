
import React, { useState, useEffect } from 'react';
import { MealKit, Ingredient, CookingStep } from '../types';
import { MENU_ITEMS } from '../constants';

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

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'weekly' | 'users'>('overview');
  const [recipes, setRecipes] = useState<MealKit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [weeklySelections, setWeeklySelections] = useState<WeeklySelection[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<MealKit | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  // Recipe filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('All');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('admin_recipes');
    setRecipes(savedRecipes ? JSON.parse(savedRecipes) : MENU_ITEMS);

    const savedUsers = localStorage.getItem('admin_users');
    setUsers(savedUsers ? JSON.parse(savedUsers) : [
      { id: 'u1', name: 'John Smith', email: 'john@example.com', plan: '2 People, 3 Meals/Week', status: 'Active' },
      { id: 'u2', name: 'Sarah Johnson', email: 'sarah@example.com', plan: '4 People, 4 Meals/Week', status: 'Active' },
      { id: 'u3', name: 'Mike Davis', email: 'mike@example.com', plan: '2 People, 2 Meals/Week', status: 'Paused' },
      { id: 'u4', name: 'Emma Wilson', email: 'emma@example.com', plan: '2 People, 4 Meals/Week', status: 'Active' },
      { id: 'u5', name: 'Tom Brown', email: 'tom@example.com', plan: '4 People, 3 Meals/Week', status: 'Cancelled' }
    ]);

    const savedWeekly = localStorage.getItem('admin_weekly');
    setWeeklySelections(savedWeekly ? JSON.parse(savedWeekly) : [
      { weekOf: '2024-12-30', recipeIds: ['1', '2', '3'] },
      { weekOf: '2025-01-06', recipeIds: ['4', '5', '6'] }
    ]);
  }, []);

  // Save recipes to localStorage
  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem('admin_recipes', JSON.stringify(recipes));
    }
  }, [recipes]);

  // Save users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('admin_users', JSON.stringify(users));
    }
  }, [users]);

  // Save weekly selections to localStorage
  useEffect(() => {
    if (weeklySelections.length > 0) {
      localStorage.setItem('admin_weekly', JSON.stringify(weeklySelections));
    }
  }, [weeklySelections]);

  const handleSaveRecipe = (recipe: MealKit) => {
    if (editingRecipe) {
      setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes(prev => [...prev, { ...recipe, id: Date.now().toString() }]);
    }
    setEditingRecipe(null);
    setIsAddingRecipe(false);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRecipes.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRecipes.length} recipe(s)?`)) {
      setRecipes(prev => prev.filter(r => !selectedRecipes.includes(r.id)));
      setSelectedRecipes([]);
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
          <nav className="flex space-x-12">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'recipes', label: 'Recipes' },
              { id: 'weekly', label: 'Weekly Menu' },
              { id: 'users', label: 'Users' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative py-5 text-[10px] tracking-widest uppercase font-bold transition-colors ${
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

export default Admin;
