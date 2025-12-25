
import React, { useState } from 'react';
import { UserProfile, MealKit } from '../types';
import { MOCK_HISTORY, MENU_ITEMS } from '../constants';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  savedMealIds?: string[];
  onSelectSavedMeal?: (meal: MealKit) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, savedMealIds = [], onSelectSavedMeal }) => {
  const [editing, setEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleSave = () => {
    onUpdate(localProfile);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setEditing(false);
  };

  const savedMeals = MENU_ITEMS.filter(item => savedMealIds.includes(item.id));

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="h-px w-8 bg-brand-terracotta/30"></span>
              <span className="text-brand-terracotta text-[10px] tracking-[0.5em] uppercase font-bold">Chef's Dashboard</span>
            </div>
            <h1 className="font-serif text-6xl md:text-8xl tracking-tighter italic text-brand-ink leading-[0.85]">
              Seriously <span className="text-brand-sage">Personal</span>.
            </h1>
            <p className="font-serif text-2xl text-brand-ink/40 max-w-xl italic leading-tight">
              A curated space for your weekly deliveries, culinary progress, and kitchen settings.
            </p>
          </div>
          <div className="flex items-center gap-3">
             {editing ? (
               <>
                <button 
                  onClick={handleCancel}
                  className="px-8 py-4 rounded text-[10px] tracking-widest uppercase font-bold text-brand-ink/40 border border-black/5 hover:border-black/20 bg-white transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-brand-sage text-white px-8 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-ink transition-all shadow-xl shadow-brand-sage/10"
                >
                  Confirm Updates
                </button>
               </>
             ) : (
                <button 
                  onClick={() => setEditing(true)}
                  className="bg-brand-ink text-white px-10 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all shadow-2xl shadow-brand-ink/10"
                >
                  Refine Preferences
                </button>
             )}
          </div>
        </div>

        {/* Sophisticated Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch auto-rows-min">
          
          {/* Main Card: Subscription Stats (Spans 8 cols) */}
          <div className="md:col-span-8 bg-white border border-black/[0.03] rounded-lg p-10 md:p-14 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 40 40">
                <path d="M10 20C10 14.4772 14.4772 10 20 10V30C14.4772 30 10 25.5228 10 20Z"/>
                <path d="M20 10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30V10Z" opacity="0.4"/>
              </svg>
            </div>

            <div className="relative z-10 space-y-12">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <h2 className="font-serif text-5xl tracking-tighter italic text-brand-ink">Weekly Box</h2>
                   <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sage bg-brand-sage/5 inline-block px-3 py-1 rounded">Heritage Subscription Active</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 block border-b border-black/[0.03] pb-2">The Gathering</label>
                  {editing ? (
                    <div className="flex gap-2 p-1.5 bg-brand-cream/50 rounded border border-black/5">
                      {[2, 4].map(n => (
                        <button 
                          key={n}
                          onClick={() => setLocalProfile({...localProfile, people: n})}
                          className={`flex-1 py-4 rounded text-[10px] font-bold transition-all ${localProfile.people === n ? 'bg-brand-ink text-white shadow-xl' : 'bg-transparent text-brand-ink/40 hover:bg-black/5'}`}
                        >
                          {n} Guests
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-6xl italic text-brand-ink leading-none">{profile.people}</span>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-brand-ink">People</p>
                        <p className="text-[10px] italic text-brand-ink/30 font-serif">Served per recipe</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 block border-b border-black/[0.03] pb-2">Weekly Cadence</label>
                  {editing ? (
                    <div className="flex gap-2 p-1.5 bg-brand-cream/50 rounded border border-black/5 overflow-x-auto scrollbar-hide">
                      {[2, 3, 4, 5].map(n => (
                        <button 
                          key={n}
                          onClick={() => setLocalProfile({...localProfile, recipesPerWeek: n})}
                          className={`flex-1 px-4 py-4 rounded text-[10px] font-bold transition-all whitespace-nowrap ${localProfile.recipesPerWeek === n ? 'bg-brand-sage text-white shadow-xl' : 'bg-transparent text-brand-ink/40 hover:bg-black/5'}`}
                        >
                          {n} Meals
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-6xl italic text-brand-ink leading-none">{profile.recipesPerWeek}</span>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-brand-ink">Meals</p>
                        <p className="text-[10px] italic text-brand-ink/30 font-serif">Delivered weekly</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-black/[0.05] flex flex-wrap gap-8 items-center justify-between">
              <div className="flex items-center space-x-12">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-widest font-bold text-brand-ink/20 block">Next Delivery</span>
                  <p className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">Thursday, Oct 24</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-widest font-bold text-brand-ink/20 block">Billing Total</span>
                  <p className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">£{(profile.people * profile.recipesPerWeek * 8.5).toFixed(2)}</p>
                </div>
              </div>
              <p className="text-[9px] font-serif italic text-brand-ink/30">Skip any week before Monday midnight.</p>
            </div>
          </div>

          {/* Side Card: The Dark Heritage Box (Spans 4 cols) */}
          <div className="md:col-span-4 bg-brand-ink text-white rounded-lg p-10 md:p-12 flex flex-col justify-between shadow-2xl shadow-brand-ink/20 relative overflow-hidden group border border-white/[0.05]">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-sage/20 blur-[80px] rounded-full group-hover:bg-brand-sage/30 transition-all duration-1000"></div>
            
            <div className="relative z-10 space-y-10">
              <h3 className="font-serif text-3xl tracking-tighter italic text-brand-gold">Kitchen Studio</h3>
              <div className="space-y-6">
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block">Heritage Status</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-brand-sage">Gold Member</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block">Member Since</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Oct 2024</span>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                   <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 block">Total Enjoyed</span>
                   <span className="text-sm font-bold uppercase tracking-widest">14 Deliveries</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-3 mt-12">
               <button className="w-full py-4 border border-white/10 rounded text-[9px] tracking-widest uppercase font-bold hover:bg-white hover:text-brand-ink hover:border-white transition-all">
                  Manage Payment
               </button>
               <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-20 text-center">Encrypted by Seriously Secure</p>
            </div>
          </div>

          {/* Preferences Bento Box (Spans 5 cols) */}
          <div className="md:col-span-5 bg-white border border-black/[0.03] rounded-lg p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
            <div className="space-y-8">
              <h3 className="font-serif text-3xl tracking-tighter italic text-brand-ink">Cooking Mastery</h3>
              <div className="space-y-6">
                <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 block">Experience Level</label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {['Easy', 'Medium', 'Advanced', 'All'].map(lvl => (
                      <button 
                        key={lvl}
                        onClick={() => setLocalProfile({...localProfile, skillLevel: lvl as any})}
                        className={`py-4 rounded text-[10px] font-bold border transition-all ${localProfile.skillLevel === lvl ? 'bg-brand-ink text-white border-brand-ink shadow-lg' : 'bg-transparent border-black/5 text-brand-ink/40 hover:border-black/20'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-serif text-2xl italic text-brand-ink">{profile.skillLevel === 'All' ? 'Curating all levels' : `Mastering ${profile.skillLevel}`}</p>
                    <div className="h-0.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-sage transition-all duration-1000 ease-out" 
                        style={{ width: profile.skillLevel === 'Easy' ? '30%' : profile.skillLevel === 'Medium' ? '60%' : '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-black/[0.03] flex items-center justify-between">
               <span className="text-[10px] font-serif italic text-brand-ink/30">Adapting recipes to your pace.</span>
               <svg className="w-5 h-5 text-brand-gold opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>

          {/* Past Meals Box (Spans 7 cols) */}
          <div className="md:col-span-7 bg-[#F9F9F9] border border-black/[0.03] rounded-lg p-10 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-serif text-3xl tracking-tighter italic text-brand-ink">Recent Deliveries</h3>
                <button className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/20 hover:text-brand-ink transition-colors">History Archive</button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_HISTORY.map(order => (
                  <div key={order.id} className="p-6 bg-white border border-black/5 rounded group/item hover:border-brand-terracotta/20 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[8px] font-bold text-brand-ink/20 uppercase tracking-[0.2em]">{order.date}</span>
                      <div className="w-1.5 h-1.5 bg-brand-sage rounded-full"></div>
                    </div>
                    <p className="font-serif text-lg tracking-tight italic text-brand-ink group-hover/item:text-brand-terracotta transition-colors leading-tight">{order.meals[0]}</p>
                    <div className="mt-6 flex items-center justify-between text-[8px] uppercase tracking-widest font-bold text-brand-ink/20 group-hover/item:text-brand-ink transition-colors">
                       <span>Review Menu</span>
                       <svg className="w-3 h-3 translate-x-0 group-hover/item:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Saved Rituals Box (Spans 6 cols) */}
          <div className="md:col-span-6 bg-white border border-black/[0.03] rounded-lg p-10 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-serif text-3xl tracking-tighter italic text-brand-ink">Saved Menus</h3>
              <p className="text-[10px] font-bold text-brand-ink/20 uppercase tracking-widest">{savedMeals.length} Favorites</p>
            </div>
            
            <div className="space-y-4 max-h-[280px] overflow-y-auto scrollbar-hide">
              {savedMeals.length > 0 ? (
                savedMeals.map(meal => (
                  <div 
                    key={meal.id} 
                    onClick={() => onSelectSavedMeal?.(meal)}
                    className="flex items-center space-x-4 p-4 border border-black/5 rounded hover:border-brand-sage/20 transition-all cursor-pointer group/meal"
                  >
                    <img src={meal.imageUrl} className="w-12 h-12 object-cover rounded border border-black/5" alt={meal.title} />
                    <div className="flex-1">
                       <p className="font-serif text-base italic leading-tight group-hover/meal:text-brand-sage transition-colors">{meal.title}</p>
                       <p className="text-[8px] uppercase tracking-widest font-bold text-brand-ink/20">{meal.category}</p>
                    </div>
                    <svg className="w-3 h-3 text-brand-terracotta" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-4">
                  <p className="font-serif text-lg italic text-brand-ink/20">Your favorite menus will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Exclusions Box (Spans 6 cols) */}
          <div className="md:col-span-6 bg-white border border-black/[0.03] rounded-lg p-10 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="font-serif text-3xl tracking-tighter italic text-brand-ink">Dietary Nuance</h3>
              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 block">Safeguarding Your Table</label>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {profile.allergies.length > 0 ? (
                    profile.allergies.map(a => (
                      <span key={a} className="px-5 py-2.5 bg-brand-terracotta/[0.03] text-brand-terracotta text-[10px] uppercase tracking-widest font-bold rounded border border-brand-terracotta/10">
                        {a}
                      </span>
                    ))
                  ) : (
                    <p className="font-serif text-lg italic text-brand-ink/20">No exclusions specified. We'll show you the full menu.</p>
                  )}
                </div>
              </div>
            </div>
            
            {editing && (
              <div className="mt-8 pt-6 border-t border-black/[0.03]">
                <button className="text-[10px] uppercase tracking-widest font-bold text-brand-sage border-b border-brand-sage/20 pb-0.5 hover:text-brand-ink hover:border-brand-ink transition-all">Modify Exclusions in Onboarding</button>
              </div>
            )}
          </div>

          {/* Support/Pause Box (Spans 6 cols) */}
          <div className="md:col-span-6 bg-brand-cream border border-brand-terracotta/10 rounded-lg p-10 flex flex-col justify-center text-center space-y-6 shadow-sm">
             <div className="w-12 h-12 bg-brand-terracotta/10 rounded-full flex items-center justify-center mx-auto text-brand-terracotta">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div className="space-y-2">
               <h4 className="font-serif text-3xl italic tracking-tighter text-brand-ink">Skip a Week?</h4>
               <p className="text-[11px] text-brand-ink/40 uppercase tracking-widest font-bold leading-relaxed max-w-[280px] mx-auto">Pause deliveries temporarily or manage your schedule with a single touch.</p>
             </div>
             <button className="text-[10px] tracking-widest uppercase font-bold text-brand-ink border-b border-black/10 pb-0.5 hover:text-brand-terracotta hover:border-brand-terracotta transition-all inline-block mx-auto">Access Delivery Schedule</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
