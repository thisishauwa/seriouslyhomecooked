
import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  boxLimit: number;
  peopleCount: number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onCheckout, boxLimit, peopleCount }) => {
  // Pricing logic: Base price in constant is for 2 people. Adjust if 4 people.
  const priceMultiplier = peopleCount / 2;
  const subtotal = items.reduce((sum, item) => sum + (item.price * priceMultiplier) * item.quantity, 0);
  const uniqueCount = items.length;
  const progress = Math.min((uniqueCount / boxLimit) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-black/5 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-3xl tracking-tighter italic">Your Box</h2>
              <p className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 mt-1">Plan: {peopleCount} People • {boxLimit} Kits</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Box Progress Bar */}
          <div className="px-8 py-6 bg-[#F9F9F9]">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40">Box Status</span>
              <span className="text-sm font-serif italic text-brand-ink tracking-tight">
                {uniqueCount < boxLimit ? `${boxLimit - uniqueCount} more needed` : 'Your box is full'}
              </span>
            </div>
            <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${uniqueCount >= boxLimit ? 'bg-brand-sage' : 'bg-brand-terracotta'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif text-xl italic text-brand-ink/20 mb-6">Your weekly box is empty</p>
                <button 
                  onClick={onClose}
                  className="text-brand-ink tracking-widest uppercase text-[10px] font-bold border border-black/10 px-6 py-3 rounded hover:bg-black hover:text-white transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-6 group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F9F9F9] border border-black/5">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-lg tracking-tighter leading-none text-brand-ink">{item.title}</h3>
                      <span className="font-sans text-xs font-bold text-brand-ink/80">£{((item.price * priceMultiplier) * item.quantity).toFixed(2)}</span>
                    </div>
                    <p className="text-[9px] text-brand-ink/30 uppercase tracking-widest mt-1">Serves {peopleCount}</p>
                    <div className="flex items-center space-x-6 mt-3">
                      <div className="flex items-center space-x-4 bg-brand-clay/40 rounded px-2 py-1">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-brand-ink/40 hover:text-brand-ink text-sm font-bold transition-colors">−</button>
                        <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-brand-ink/40 hover:text-brand-ink text-sm font-bold transition-colors">+</button>
                      </div>
                      <button onClick={() => onUpdateQuantity(item.id, -item.quantity)} className="text-[9px] tracking-widest uppercase font-bold text-brand-terracotta/40 hover:text-brand-terracotta transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-white border-t border-black/5 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="font-serif text-2xl italic tracking-tighter">Box Subtotal</span>
              <span className="font-sans font-bold text-xl text-brand-ink tracking-tighter">£{subtotal.toFixed(2)}</span>
            </div>
            
            <button 
              disabled={items.length === 0}
              onClick={onCheckout}
              className={`w-full py-4 rounded text-[10px] tracking-widest uppercase font-bold transition-all ${
                uniqueCount < boxLimit 
                ? 'bg-brand-sage/5 text-brand-sage/40 cursor-default' 
                : 'bg-brand-ink text-white hover:bg-brand-sage shadow-md'
              }`}
            >
              {uniqueCount < boxLimit ? `Pick ${boxLimit - uniqueCount} More` : 'Checkout Box'}
            </button>
            <p className="text-center text-[9px] tracking-widest uppercase font-bold text-brand-ink/10 italic">Pause anytime after your first ritual.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
