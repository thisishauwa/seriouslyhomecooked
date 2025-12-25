
import React from 'react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
  onGoPlans: () => void;
  onGoMenu: () => void;
  onGoProfile: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenAuth: () => void;
  onGoJournal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onOpenCart, 
  onGoHome, 
  onGoPlans, 
  onGoMenu, 
  onGoProfile,
  isLoggedIn, 
  onLogout, 
  onOpenAuth, 
  onGoJournal 
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <button onClick={onGoHome} className="flex items-center space-x-2 text-brand-ink focus:outline-none group">
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 40 40" fill="none">
              <path d="M10 20C10 14.4772 14.4772 10 20 10V30C14.4772 30 10 25.5228 10 20Z" fill="#1A1C19"/>
              <path d="M20 10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30V10Z" fill="#C17D5C"/>
            </svg>
            <span className="font-serif text-xl tracking-tighter font-medium leading-none">Seriously <span className="italic font-normal">homecooked</span></span>
          </button>
          <div className="hidden md:flex space-x-8 text-[10px] tracking-widest uppercase font-bold text-brand-ink/30">
            <button onClick={onGoPlans} className="hover:text-brand-ink transition-colors uppercase tracking-widest font-bold">Meal Plans</button>
            <button onClick={onGoMenu} className="hover:text-brand-ink transition-colors uppercase tracking-widest font-bold">The Menu</button>
            <button onClick={onGoJournal} className="hover:text-brand-ink transition-colors uppercase tracking-widest font-bold">Journal</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-6">
              <button 
                onClick={onLogout}
                className="text-[9px] tracking-widest uppercase font-bold text-brand-ink/20 hover:text-brand-terracotta transition-colors"
              >
                Sign out
              </button>
              <button 
                onClick={onGoProfile}
                className="flex items-center space-x-2 text-brand-ink group hover:opacity-70 transition-opacity"
              >
                <div className="w-7 h-7 rounded bg-brand-clay/50 flex items-center justify-center text-[9px] font-bold border border-black/5">JD</div>
                <span className="text-[9px] tracking-widest uppercase font-bold hidden lg:block opacity-40">My Profile</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40 hover:text-brand-ink transition-colors"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={onOpenCart}
            className="flex items-center space-x-2 text-brand-ink group"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-terracotta text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
          
          {!isLoggedIn && (
            <button 
              onClick={onOpenAuth}
              className="bg-brand-sage text-white px-6 py-2 rounded text-[10px] tracking-widest uppercase font-bold hover:shadow-lg transition-all"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
