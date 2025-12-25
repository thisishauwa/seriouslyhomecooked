
import React, { useState, useEffect } from 'react';
import { getRecipes } from '../lib/supabase-service';
import { MealKit, CartItem } from '../types';

interface MenuProps {
  onAddToCart: (item: MealKit) => void;
  onSelectMeal: (meal: MealKit) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  savedMealIds: string[];
  onToggleSave: (id: string) => void;
  peopleCount: number;
  cartItems: CartItem[];
  boxLimit: number;
}

const Menu: React.FC<MenuProps> = ({ 
  onAddToCart, 
  onSelectMeal, 
  activeCategory, 
  setActiveCategory, 
  savedMealIds, 
  onToggleSave, 
  peopleCount,
  cartItems,
  boxLimit 
}) => {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MealKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recipes from Supabase
  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      try {
        const recipes = await getRecipes();
        setMenuItems(recipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipes();
  }, []);

  const filteredItems = menuItems.filter(item => {
    if (activeCategory === 'Saved') return savedMealIds.includes(item.id);
    return activeCategory === 'All' || item.category === activeCategory;
  });

  // Get unique categories from loaded recipes
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category))), 'Saved'];
  const priceMultiplier = peopleCount / 2;
  const currentUniqueCount = cartItems.length;

  const handleAdd = (e: React.MouseEvent, item: MealKit) => {
    e.stopPropagation();
    setAddingId(item.id);
    onAddToCart(item);
    setTimeout(() => setAddingId(null), 800);
  };

  if (isLoading) {
    return (
      <section id="menu" className="py-24 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-sage"></div>
            <p className="mt-4 text-brand-ink/40 text-sm uppercase tracking-widest">Loading recipes...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Floating Context Bar */}
        <div className="sticky top-20 z-40 mb-20">
          <div className="p-1 bg-white/80 backdrop-blur-xl border border-black/5 rounded-full shadow-2xl flex items-center justify-between pr-1 pl-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-6">
              <span className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40">Your Box</span>
              <div className="h-4 w-px bg-black/5" />
              <p className="font-serif text-sm italic tracking-tight text-brand-ink">
                <span className="font-bold font-sans not-italic text-brand-sage">{currentUniqueCount} of {boxLimit}</span> meals selected
              </p>
            </div>
            <a href="#plans" className="bg-brand-ink text-white px-6 py-2.5 rounded-full text-[9px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all">
              {currentUniqueCount === boxLimit ? 'Box Ready' : 'Change Plan'}
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-12">
          <div className="max-w-xl">
            <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">This Week's Menu</span>
            <h2 className="font-serif text-6xl md:text-7xl text-brand-ink tracking-tighter leading-none">
              Choose your <span className="italic">meals</span>.
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-hide">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`whitespace-nowrap text-[10px] tracking-widest uppercase px-6 py-3 rounded border transition-all font-bold ${
                   activeCategory === cat 
                   ? 'bg-brand-ink text-white border-brand-ink shadow-md' 
                   : 'text-brand-ink/30 border-black/5 hover:border-black/20'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredItems.map((item) => {
            const isInBox = cartItems.some(ci => ci.id === item.id);
            const isAdding = addingId === item.id;
            
            return (
              <div 
                key={item.id} 
                onClick={() => onSelectMeal(item)}
                className="group cursor-pointer flex flex-col bg-white transition-all animate-in fade-in slide-in-from-bottom-8 duration-700"
              >
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-8 border border-black/5 bg-[#F9F9F9]">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/5 transition-all" />
                  
                  {/* Float Overlays */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(item.id);
                    }}
                    className="absolute top-6 right-6 bg-white/95 backdrop-blur w-10 h-10 flex items-center justify-center rounded transition-all hover:scale-110 shadow-sm"
                  >
                    <svg className={`w-4 h-4 transition-colors ${savedMealIds.includes(item.id) ? 'text-brand-terracotta' : 'text-brand-ink/20'}`} fill={savedMealIds.includes(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  
                  <span className="absolute bottom-6 left-6 bg-brand-ink/90 text-white text-[9px] tracking-widest uppercase font-bold px-4 py-2 rounded">
                    {item.category}
                  </span>

                  {isInBox && (
                    <div className="absolute top-6 left-6 bg-brand-sage text-white text-[8px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 rounded shadow-xl animate-in fade-in zoom-in duration-300">
                      In Your Box
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-serif text-3xl leading-none tracking-tighter text-brand-ink group-hover:text-brand-sage transition-colors">
                      {item.title}
                    </h3>
                    <span className="font-serif text-xl italic text-brand-ink/40">£{(item.price * priceMultiplier).toFixed(2)}</span>
                  </div>
                  
                  <p className="text-brand-ink/40 text-sm italic font-serif leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-6 pt-2">
                     <div className="flex items-center space-x-2">
                        <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/30">{item.prepTime}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                        <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/30">{item.skillLevel}</span>
                     </div>
                  </div>

                  <button 
                    onClick={(e) => handleAdd(e, item)}
                    className={`w-full mt-4 py-4 rounded border transition-all text-[10px] tracking-widest uppercase font-bold ${
                      isAdding 
                        ? 'bg-brand-sage text-white border-brand-sage scale-95' 
                        : isInBox 
                        ? 'bg-brand-sage/10 text-brand-sage border-brand-sage/20 hover:bg-brand-ink hover:text-white' 
                        : 'bg-[#F9F9F9] border-black/5 text-brand-ink hover:bg-brand-ink hover:text-white'
                    }`}
                  >
                    {isAdding ? 'Added' : isInBox ? 'Add Another' : 'Add to Box'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Menu;
