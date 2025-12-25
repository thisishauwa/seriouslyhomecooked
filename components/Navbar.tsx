
import React, { useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo - Text Only */}
          <button 
            onClick={onGoHome} 
            className="flex items-center text-brand-ink focus:outline-none group"
          >
            <span className="font-serif text-lg sm:text-xl tracking-tighter font-medium leading-none">
              Seriously <span className="italic font-normal">homecooked</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8 text-[10px] tracking-widest uppercase font-bold text-brand-ink/30">
              <button onClick={onGoPlans} className="hover:text-brand-ink transition-colors">Meal Plans</button>
              <button onClick={onGoMenu} className="hover:text-brand-ink transition-colors">The Menu</button>
              <button onClick={onGoJournal} className="hover:text-brand-ink transition-colors">Journal</button>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
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
                    <div className="w-7 h-7 rounded bg-brand-clay/50 flex items-center justify-center text-[9px] font-bold border border-black/5">
                      JD
                    </div>
                  </button>
                </>
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
                className="flex items-center text-brand-ink relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-terracotta text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
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

          {/* Mobile: Cart + Hamburger */}
          <div className="flex md:hidden items-center space-x-3">
            <button 
              onClick={onOpenCart}
              className="flex items-center text-brand-ink relative p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-terracotta text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-ink focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col p-6 space-y-6">
              <button 
                onClick={() => handleNavClick(onGoPlans)}
                className="text-left text-sm tracking-widest uppercase font-bold text-brand-ink hover:text-brand-sage transition-colors"
              >
                Meal Plans
              </button>
              <button 
                onClick={() => handleNavClick(onGoMenu)}
                className="text-left text-sm tracking-widest uppercase font-bold text-brand-ink hover:text-brand-sage transition-colors"
              >
                The Menu
              </button>
              <button 
                onClick={() => handleNavClick(onGoJournal)}
                className="text-left text-sm tracking-widest uppercase font-bold text-brand-ink hover:text-brand-sage transition-colors"
              >
                Journal
              </button>

              <div className="border-t border-black/5 pt-6 space-y-4">
                {isLoggedIn ? (
                  <>
                    <button 
                      onClick={() => handleNavClick(onGoProfile)}
                      className="w-full text-left text-sm tracking-widest uppercase font-bold text-brand-ink hover:text-brand-sage transition-colors"
                    >
                      My Profile
                    </button>
                    <button 
                      onClick={() => handleNavClick(onLogout)}
                      className="w-full text-left text-sm tracking-widest uppercase font-bold text-brand-terracotta hover:opacity-70 transition-opacity"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleNavClick(onOpenAuth)}
                      className="w-full text-left text-sm tracking-widest uppercase font-bold text-brand-ink hover:text-brand-sage transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => handleNavClick(onOpenAuth)}
                      className="w-full bg-brand-sage text-white px-6 py-3 rounded text-[10px] tracking-widest uppercase font-bold hover:shadow-lg transition-all"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
