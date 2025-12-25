
import React, { useState, useEffect } from 'react';
import { MealKit } from '../types';

interface MealDetailProps {
  meal: MealKit;
  onClose: () => void;
  onAddToCart: (meal: MealKit) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  peopleCount: number;
  boxLimit: number;
  cartCount: number;
}

const MealDetail: React.FC<MealDetailProps> = ({ meal, onClose, onAddToCart, isSaved, onToggleSave, peopleCount, boxLimit, cartCount }) => {
  const [showToast, setShowToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const priceMultiplier = peopleCount / 2;

  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(meal);
    
    // Check if adding this meal will trigger the drawer automatically in App.tsx
    // If not, we show our local toast feedback.
    setTimeout(() => {
      setIsAdding(false);
      setShowToast(true);
      
      // If the box is now full, close the modal so the drawer is visible
      if (cartCount + 1 >= boxLimit) {
        setTimeout(() => onClose(), 600);
      }
    }, 400);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-500">
      {/* Toast Notification */}
      <div 
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-[150] transition-all duration-400 transform ${
          showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-brand-ink text-white px-6 py-3 rounded shadow-2xl flex items-center space-x-3">
          <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] tracking-widest uppercase font-bold">Added to your box</span>
        </div>
      </div>

      {/* Header / Nav */}
      <div className="sticky top-0 z-[110] bg-white/80 backdrop-blur-md px-6 py-4 border-b border-black/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 text-[10px] tracking-widest uppercase font-bold text-brand-ink/30">
            <button onClick={onClose} className="hover:text-brand-ink">Home</button>
            <span>/</span>
            <span className="text-brand-ink">{meal.title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Image Section - 8px radius */}
          <div className="bg-[#F9F9F9] rounded-lg aspect-square flex items-center justify-center p-8 lg:sticky lg:top-24 border border-black/5">
            <img 
              src={meal.imageUrl} 
              alt={meal.title} 
              className="w-full h-full object-cover circle-mask shadow-2xl scale-110"
            />
          </div>

          {/* Right Content */}
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-brand-terracotta text-[10px] tracking-[0.3em] uppercase font-bold">By Seriously Homecooked</span>
              <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-[0.95] text-brand-ink">{meal.title}</h1>
              <p className="text-brand-ink/40 text-xl tracking-tight leading-snug font-serif max-w-xl">{meal.description}</p>
            </div>

            {/* Stats Grid - 8px radius */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-black/5 border border-black/5 rounded-lg overflow-hidden">
              {[
                { label: 'Skill', value: meal.skillLevel },
                { label: 'Time', value: meal.prepTime },
                { label: 'Dining', value: `${peopleCount}p` },
                { label: 'Calories', value: `${meal.calories}` },
                { label: 'Price', value: `£${(meal.price * priceMultiplier).toFixed(2)}` }
              ].map((detail, idx) => (
                <div key={idx} className="bg-white p-4 space-y-0.5">
                  <span className="text-[8px] tracking-widest uppercase text-brand-ink/20 font-bold block">{detail.label}</span>
                  <p className="text-[11px] font-bold text-brand-ink uppercase">{detail.value}</p>
                </div>
              ))}
            </div>

            {/* Ingredients Section */}
            <div className="space-y-6">
              <h3 className="font-serif text-3xl tracking-tighter italic">Ingredients</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {meal.ingredients?.map((ing, idx) => (
                  <div key={idx} className="flex-shrink-0 w-28 space-y-2">
                    <div className="aspect-square bg-[#F9F9F9] rounded-lg p-3 flex items-center justify-center border border-black/5">
                      <img src={ing.imageUrl || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=100&q=80'} className="w-full h-full object-contain grayscale opacity-60" alt={ing.name} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-brand-ink uppercase leading-none">{ing.name}</p>
                      <p className="text-[8px] text-brand-ink/30 uppercase tracking-widest mt-1">{ing.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-8">
              <h3 className="font-serif text-3xl tracking-tighter italic">Method</h3>
              <div className="space-y-10">
                {meal.steps?.map((step, idx) => (
                  <div key={idx} className="flex gap-8 border-t border-black/5 pt-8 first:border-0 first:pt-0">
                    <span className="font-serif text-5xl text-brand-ink/10 leading-none tracking-tighter">0{idx + 1}</span>
                    <div className="space-y-3">
                      <h4 className="font-serif text-2xl tracking-tighter italic">{step.title}</h4>
                      <p className="text-brand-ink/50 text-base tracking-tight leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sticky Bar - Buttons are 4px radius */}
      <div className="sticky bottom-0 z-[120] bg-white/90 backdrop-blur-md border-t border-black/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <div className="flex items-center bg-[#F9F9F9] rounded border border-black/5 px-4 py-2.5">
            <span className="text-[10px] font-bold tracking-widest uppercase whitespace-nowrap px-4">For {peopleCount} People</span>
          </div>
          <button 
            onClick={() => onToggleSave(meal.id)}
            className={`flex items-center space-x-2 border border-black/5 px-6 py-3 rounded text-[10px] tracking-widest uppercase font-bold transition-all ${
              isSaved ? 'bg-brand-sage text-white' : 'bg-white text-brand-ink hover:bg-black/5'
            }`}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button 
            onClick={handleAdd}
            disabled={isAdding}
            className={`flex-1 relative bg-brand-terracotta text-white py-3 rounded text-[10px] tracking-widest uppercase font-bold transition-all ${
              isAdding ? 'opacity-80 scale-95' : 'hover:opacity-95 shadow-sm active:scale-95'
            }`}
          >
            {isAdding ? 'Adding...' : 'Add to Box'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealDetail;
