
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import PlanSelector from './components/PlanSelector';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import MealDetail from './components/MealDetail';
import AuthModal from './components/AuthModal';
import ProducerModal from './components/ProducerModal';
import Journal from './components/Journal';
import Profile from './components/Profile';
import Onboarding from './components/Onboarding';
import Admin from './components/Admin';
import AdminLogin from './components/AdminLogin';
import { CartItem, MealKit, View, BoxConfig, Producer, UserProfile } from './types';
import { PRODUCERS, MOCK_HISTORY } from './constants';
import { supabase } from './lib/supabase';
import { getUserProfile, updateUserProfile, updateCart, getCart, getSavedRecipes, saveRecipe, unsaveRecipe, checkIsAdmin } from './lib/supabase-service';
import './lib/supabase-test'; // Test Supabase connection in dev mode

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedMealIds, setSavedMealIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<View | 'SUCCESS'>('HOME');
  const [selectedMeal, setSelectedMeal] = useState<MealKit | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    people: 2,
    recipesPerWeek: 3,
    skillLevel: 'All',
    allergies: [],
    preferences: []
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userName, setUserName] = useState("John");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        loadUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        await loadUserData(session.user.id);
        
        // Check if admin
        const isAdmin = await checkIsAdmin(session.user.id);
        if (isAdmin) {
          setIsAdminLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
        setUserId(null);
        setIsAdminLoggedIn(false);
      }
    });

    // Load admin auth from localStorage (for hardcoded admin)
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') setIsAdminLoggedIn(true);

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  const loadUserData = async (uid: string) => {
    try {
      // Load profile
      const profile = await getUserProfile(uid);
      if (profile) {
        setUserName(profile.full_name || 'User');
        setUserProfile({
          people: profile.people || 2,
          recipesPerWeek: profile.recipes_per_week || 3,
          skillLevel: profile.skill_level || 'All',
          allergies: profile.allergies || [],
          preferences: profile.preferences || [],
        });
      }

      // Load cart
      const cartData = await getCart(uid);
      if (cartData && cartData.length > 0) {
        setCart(cartData);
      }

      // Load saved recipes
      const savedIds = await getSavedRecipes(uid);
      if (savedIds && savedIds.length > 0) {
        setSavedMealIds(savedIds);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Sync cart to Supabase when it changes
  useEffect(() => {
    if (userId && isLoggedIn) {
      updateCart(userId, cart).catch(err => console.error('Error syncing cart:', err));
    }
    // Also keep localStorage as backup
    localStorage.setItem('sh_cart', JSON.stringify(cart));
  }, [cart, userId, isLoggedIn]);

  // Sync profile to Supabase when it changes
  useEffect(() => {
    if (userId && isLoggedIn) {
      updateUserProfile(userId, userProfile).catch(err => console.error('Error syncing profile:', err));
    }
    // Also keep localStorage as backup
    localStorage.setItem('sh_profile', JSON.stringify(userProfile));
  }, [userProfile, userId, isLoggedIn]);

  const addToCart = (meal: MealKit) => {
    const isAlreadyInCart = cart.some(item => item.id === meal.id);
    const currentUniqueCount = cart.length;
    const nextUniqueCount = isAlreadyInCart ? currentUniqueCount : currentUniqueCount + 1;

    setCart(prev => {
      const existing = prev.find(item => item.id === meal.id);
      if (existing) {
        return prev.map(item => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...meal, quantity: 1 }];
    });

    // Only open the cart if the user has reached their weekly quota
    if (nextUniqueCount >= userProfile.recipesPerWeek) {
      setIsCartOpen(true);
    }
  };

  const toggleSaveMeal = async (id: string) => {
    if (userId && isLoggedIn) {
      try {
        if (savedMealIds.includes(id)) {
          await unsaveRecipe(userId, id);
          setSavedMealIds(prev => prev.filter(mid => mid !== id));
        } else {
          await saveRecipe(userId, id);
          setSavedMealIds(prev => [...prev, id]);
        }
      } catch (error) {
        console.error('Error toggling saved recipe:', error);
      }
    } else {
      // Fallback to local state if not logged in
      setSavedMealIds(prev => 
        prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
      );
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleLogin = (isSignUp: boolean) => {
    setIsLoggedIn(true);
    localStorage.setItem('sh_auth', 'true');
    setShowAuth(false);
    if (isSignUp) {
      setView('ONBOARDING');
    } else {
      setView('HOME');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    setCart([]);
    setSavedMealIds([]);
    localStorage.setItem('sh_auth', 'false');
    setView('HOME');
  };

  const handleOrderComplete = async () => {
    if (userId && isLoggedIn) {
      try {
        const priceMultiplier = userProfile.people / 2;
        const subtotal = cart.reduce((sum, item) => sum + (item.price * priceMultiplier) * item.quantity, 0);
        const shipping = 4.95;
        const total = subtotal + shipping;
        
        // Create order in Supabase
        const { createOrder } = await import('./lib/supabase-service');
        await createOrder(userId, cart, total);
        
        // Clear cart in Supabase
        await updateCart(userId, []);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
    
    setCart([]);
    setView('SUCCESS');
    window.scrollTo(0, 0);
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Save to Supabase if user is logged in
    if (userId) {
      try {
        await updateUserProfile(userId, profile);
        console.log('Profile updated successfully in Supabase');
      } catch (error) {
        console.error('Error updating profile in Supabase:', error);
      }
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setView('ADMIN');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('admin_auth', 'false');
    setView('HOME');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Shared Navbar Props
  const navProps = {
    cartCount,
    onOpenCart: () => setIsCartOpen(true),
    onGoHome: () => setView('HOME'),
    onGoPlans: () => setView('PLANS'),
    onGoMenu: () => setView('MENU'),
    onGoProfile: () => setView('PROFILE'),
    isLoggedIn,
    onLogout: handleLogout,
    onOpenAuth: () => setShowAuth(true),
    onGoJournal: () => setView('JOURNAL'),
  };

  // Admin view handling
  if (view === 'ADMIN') {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <Admin onLogout={handleAdminLogout} />;
  }

  // Views handling
  if (view === 'ONBOARDING') {
    return (
      <div className="bg-brand-cream min-h-screen">
        <Onboarding onComplete={(profile) => {
          setUserProfile(profile);
          setView('MENU');
          window.scrollTo(0, 0);
        }} />
      </div>
    );
  }

  if (view === 'PROFILE') {
    return (
      <div className="selection:bg-brand-sage selection:text-white font-sans bg-white">
        <Navbar {...navProps} />
        <Profile 
          profile={userProfile} 
          onUpdate={handleUpdateProfile} 
          savedMealIds={savedMealIds}
          onSelectSavedMeal={(meal) => {
            setSelectedMeal(meal);
          }}
        />
        <Footer />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={() => handleLogin(false)} onAdminLogin={handleAdminLogin} />}
      </div>
    );
  }

  if (view === 'CHECKOUT') {
    return (
      <div className="selection:bg-brand-sage selection:text-white font-sans bg-white">
        <Navbar {...navProps} />
        <Checkout 
          items={cart} 
          onBack={() => setView('MENU')} 
          onComplete={handleOrderComplete}
          boxConfig={userProfile}
        />
        <Footer />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={() => handleLogin(false)} onAdminLogin={handleAdminLogin} />}
      </div>
    );
  }

  if (view === 'SUCCESS') {
    return (
      <div className="selection:bg-brand-sage selection:text-white font-sans bg-white min-h-screen">
        <Navbar {...navProps} />
        <div className="pt-40 pb-20 px-6 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="w-16 h-16 bg-brand-sage text-white rounded-lg mx-auto flex items-center justify-center">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
           </div>
           <h1 className="font-serif text-6xl tracking-tighter leading-none italic text-brand-ink">Dinner is <br />on the way.</h1>
           <p className="text-brand-ink/40 text-lg font-serif italic">Your box will arrive this Thursday. We've sent a cooking guide to your email.</p>
           <button 
             onClick={() => setView('HOME')}
             className="bg-brand-ink text-white px-10 py-4 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
           >
             Return Home
           </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brand-sage selection:text-white bg-white overflow-x-hidden">
      <Navbar {...navProps} />
      
      <main className="animate-in fade-in duration-700">
        {view === 'HOME' && (
          <>
            <Hero 
              onStartPlan={() => setView('PLANS')}
              onBrowseMenu={() => setView('MENU')}
              isLoggedIn={isLoggedIn}
              userName={userName}
              config={userProfile}
            />

            {isLoggedIn && (
              <section className="py-20 bg-white border-t border-black/5 animate-in slide-in-from-bottom-8 duration-1000">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Plan Summary */}
                    <div className="lg:col-span-4 bg-[#FDFBF7] p-10 rounded-lg border border-black/5">
                      <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-6 block">Your Current Plan</span>
                      <div className="space-y-6">
                        <div>
                          <p className="text-brand-ink/30 text-[9px] uppercase tracking-widest font-bold mb-1">Weekly Setup</p>
                          <p className="font-serif text-3xl italic tracking-tighter text-brand-ink">{userProfile.people} People • {userProfile.recipesPerWeek} meals/week</p>
                        </div>
                        <div className="pt-6 border-t border-black/5">
                          <button 
                            onClick={() => setView('PROFILE')}
                            className="text-brand-ink text-[10px] tracking-widest uppercase font-bold border-b border-brand-ink/10 pb-1 hover:border-brand-sage transition-all"
                          >
                            Change My Plan
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-8 space-y-8">
                       <h2 className="font-serif text-4xl tracking-tighter italic text-brand-ink">Order History</h2>
                       <div className="grid gap-4">
                         {MOCK_HISTORY.map(history => (
                           <div key={history.id} className="flex flex-col sm:flex-row justify-between items-center p-6 bg-white border border-black/5 rounded-lg group hover:border-black/20 transition-all">
                              <div>
                                <p className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-[0.2em] mb-1">{history.date}</p>
                                <h4 className="font-serif text-xl italic tracking-tighter text-brand-ink">{history.meals.join(' & ')}</h4>
                              </div>
                              <div className="mt-4 sm:mt-0 flex items-center gap-4">
                                <span className="text-brand-sage text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-sage/5 rounded">{history.status}</span>
                                <button 
                                  onClick={() => setView('MENU')}
                                  className="text-[9px] tracking-widest uppercase font-bold text-brand-ink/20 hover:text-brand-ink transition-colors"
                                >
                                  Reorder items
                                </button>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
            
            <section className="py-20 border-y border-black/5 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                  <div>
                    <h3 className="font-serif text-2xl mb-4 italic tracking-tighter text-brand-ink">Easy Prep</h3>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/30 max-w-xs mx-auto">Chef-curated ingredients delivered fresh to your door.</p>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl mb-4 italic tracking-tighter text-brand-ink">Quality Sourcing</h3>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/30 max-w-xs mx-auto">Fresh proteins and organic produce from local farms.</p>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl mb-4 italic tracking-tighter text-brand-ink">Eco-Friendly</h3>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/30 max-w-xs mx-auto">100% recyclable and compostable packaging.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-40 bg-[#F9F9F9]">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-24">
                  <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                    {PRODUCERS.map((p, idx) => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProducer(p)}
                        className={`group cursor-pointer rounded-lg overflow-hidden relative ${idx === 1 ? 'mt-8' : ''} border border-black/5`}
                      >
                        <img 
                          src={p.imageUrl} 
                          className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110" 
                          alt={p.name}
                        />
                        <div className="absolute inset-0 bg-brand-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-[10px] tracking-widest uppercase font-bold bg-brand-ink/60 px-3 py-2 rounded">Read story</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="lg:w-1/2 space-y-10">
                     <span className="text-brand-terracotta text-[10px] tracking-[0.3em] uppercase font-bold block">Our Producers</span>
                     <h2 className="font-serif text-6xl tracking-tighter leading-none text-brand-ink">Real food, <span className="italic">properly</span> cooked.</h2>
                     <p className="text-brand-ink/40 text-xl font-serif tracking-tight leading-snug">
                       Cooking at home should be a joy, not a chore. We take care of the planning and sourcing, so you can enjoy the best part: the cooking.
                     </p>
                     <div className="flex flex-col sm:flex-row items-center gap-6">
                       <button 
                         onClick={() => setView('PLANS')}
                         className="bg-brand-ink text-white px-10 py-5 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all shadow-xl"
                       >
                         {isLoggedIn ? 'Manage My Plan' : 'View Meal Plans'}
                       </button>
                       <button 
                         onClick={() => setSelectedProducer(PRODUCERS[0])}
                         className="text-brand-ink font-bold text-[10px] tracking-widest uppercase border-b border-brand-sage/20 pb-1 hover:text-brand-sage hover:border-brand-sage transition-all"
                       >
                         Meet our producers
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </section>
            
            <Journal />

            <section className="py-32 bg-white">
              <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
                <h2 className="font-serif text-5xl tracking-tighter leading-none text-brand-ink">The <span className="italic text-brand-sage">Seriously</span> Journal</h2>
                <p className="text-brand-ink/40 italic text-lg tracking-tight font-serif">Join 45,000+ home cooks for seasonal guides and recipes.</p>
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className="flex-1 bg-[#F9F9F9] px-6 py-4 rounded border border-black/5 focus:outline-none focus:ring-1 focus:ring-brand-sage text-sm"
                  />
                  <button className="bg-brand-ink text-white px-8 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all">
                    Join
                  </button>
                </form>
              </div>
            </section>
          </>
        )}

        {view === 'PLANS' && (
          <div className="animate-in fade-in duration-500">
            <PlanSelector 
              config={userProfile} 
              onChange={handleUpdateProfile} 
              onContinue={() => {
                setView('MENU');
                window.scrollTo(0, 0);
              }}
            />
          </div>
        )}

        {view === 'MENU' && (
          <div className="animate-in fade-in duration-500">
            <Menu 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onAddToCart={addToCart} 
              onSelectMeal={(meal) => setSelectedMeal(meal)}
              savedMealIds={savedMealIds}
              onToggleSave={toggleSaveMeal}
              peopleCount={userProfile.people}
              cartItems={cart}
              boxLimit={userProfile.recipesPerWeek}
            />
          </div>
        )}

        {view === 'JOURNAL' && (
          <div className="animate-in fade-in duration-500">
            <div className="pt-32 pb-12 px-6 border-b border-black/5 bg-white">
              <div className="max-w-7xl mx-auto text-center md:text-left">
                <h1 className="font-serif text-5xl md:text-7xl tracking-tighter italic leading-none text-brand-ink">The Journal</h1>
                <p className="text-brand-ink/40 font-serif italic text-xl mt-4 max-w-xl">Seasonal guides and cooking secrets from our kitchens.</p>
              </div>
            </div>
            <Journal />
            <div className="max-w-7xl mx-auto px-6 pb-20 text-center">
               <button 
                 onClick={() => setView('HOME')}
                 className="bg-brand-ink text-white px-10 py-4 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
               >
                 Return Home
               </button>
            </div>
          </div>
        )}
      </main>

      {/* Overlays */}
      {selectedMeal && (
        <MealDetail 
          meal={selectedMeal} 
          onClose={() => setSelectedMeal(null)} 
          onAddToCart={addToCart}
          isSaved={savedMealIds.includes(selectedMeal.id)}
          onToggleSave={toggleSaveMeal}
          peopleCount={userProfile.people}
          boxLimit={userProfile.recipesPerWeek}
          cartCount={cart.length}
        />
      )}

      {selectedProducer && (
        <ProducerModal 
          producer={selectedProducer} 
          onClose={() => setSelectedProducer(null)} 
        />
      )}
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateQuantity}
        boxLimit={userProfile.recipesPerWeek}
        peopleCount={userProfile.people}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!isLoggedIn) {
            setShowAuth(true);
          } else {
            setView('CHECKOUT');
            window.scrollTo(0, 0);
          }
        }}
      />
      
      <Footer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(isSignUp) => handleLogin(isSignUp)} onAdminLogin={handleAdminLogin} />}
    </div>
  );
};

export default App;
