
import React, { useState } from 'react';
import { BoxConfig } from '../types';

interface SubscriptionManagerProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  boxConfig: BoxConfig;
  onChangePlan: (config: BoxConfig) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ isLoggedIn, onOpenAuth, boxConfig, onChangePlan }) => {
  const [pausedWeeks, setPausedWeeks] = useState<string[]>([]);

  const upcomingWeeks = [
    { id: 'w1', date: 'Oct 24', status: 'Scheduled' },
    { id: 'w2', date: 'Oct 31', status: 'Scheduled' },
    { id: 'w3', date: 'Nov 07', status: 'Scheduled' },
    { id: 'w4', date: 'Nov 14', status: 'Scheduled' },
  ];

  const togglePause = (id: string) => {
    setPausedWeeks(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-40 pb-20 px-6 text-center max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
        <h2 className="font-serif text-5xl tracking-tighter leading-none italic">Manage your ritual</h2>
        <p className="text-brand-ink/40 font-serif italic text-lg">Sign in to view your upcoming boxes, pause weeks, or adjust your dining preferences.</p>
        <button 
          onClick={onOpenAuth}
          className="bg-brand-ink text-white px-10 py-4 rounded text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Account Context */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-brand-clay rounded-lg flex items-center justify-center text-xl font-bold text-brand-ink border border-black/5">JD</div>
            <div>
              <h1 className="font-serif text-4xl tracking-tighter italic">John Doe</h1>
              <p className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/30 mt-1">Heritage Member since 2024</p>
            </div>
          </div>

          <div className="p-8 bg-[#F9F9F9] rounded-lg border border-black/5 space-y-6">
            <h3 className="text-[9px] tracking-[0.3em] uppercase font-bold text-brand-ink/30">Your Current Plan</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider text-brand-ink/60">Dining for</span>
                <span className="font-serif text-xl tracking-tight italic">{boxConfig.people} People</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider text-brand-ink/60">Frequency</span>
                <span className="font-serif text-xl tracking-tight italic">{boxConfig.recipesPerWeek} kits / week</span>
              </div>
            </div>
            <div className="pt-6 border-t border-black/5">
               <button 
                 onClick={() => {
                   const newPeople = boxConfig.people === 2 ? 4 : 2;
                   onChangePlan({ ...boxConfig, people: newPeople });
                 }}
                 className="w-full bg-white border border-black/5 py-3 rounded text-[9px] tracking-widest uppercase font-bold text-brand-ink hover:bg-brand-ink hover:text-white transition-all shadow-sm"
               >
                 Switch to {boxConfig.people === 2 ? '4' : '2'} People
               </button>
            </div>
          </div>
        </div>

        {/* Right: Box Schedule */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex justify-between items-baseline border-b border-black/5 pb-6">
            <h2 className="font-serif text-4xl tracking-tighter italic">Upcoming Rituals</h2>
            <span className="text-[10px] tracking-widest uppercase font-bold text-brand-sage">Subscription Active</span>
          </div>

          <div className="grid gap-4">
            {upcomingWeeks.map((week) => {
              const isPaused = pausedWeeks.includes(week.id);
              return (
                <div 
                  key={week.id} 
                  className={`p-6 rounded-lg border transition-all flex flex-col sm:flex-row justify-between items-center gap-4 ${
                    isPaused ? 'bg-white border-black/5 opacity-40' : 'bg-white border-black/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-brand-clay rounded-lg flex flex-col items-center justify-center border border-black/5">
                      <span className="text-[8px] tracking-widest uppercase font-bold text-brand-ink/30">{week.date.split(' ')[0]}</span>
                      <span className="text-lg font-serif tracking-tighter leading-none italic">{week.date.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight uppercase">{isPaused ? 'Paused Week' : 'Scheduled Delivery'}</h4>
                      <p className="text-[10px] text-brand-ink/40 italic mt-0.5">{isPaused ? 'Your box will skip this week' : 'Arriving Thursday, 8am - 12pm'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    {!isPaused && (
                      <button className="flex-1 sm:flex-none px-6 py-2.5 bg-[#F9F9F9] border border-black/5 rounded text-[9px] tracking-widest uppercase font-bold hover:bg-black/5 transition-all">
                        Edit Recipes
                      </button>
                    )}
                    <button 
                      onClick={() => togglePause(week.id)}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded text-[9px] tracking-widest uppercase font-bold transition-all border ${
                        isPaused 
                        ? 'bg-brand-sage text-white border-brand-sage' 
                        : 'bg-white text-brand-terracotta border-brand-terracotta/20 hover:bg-brand-terracotta hover:text-white'
                      }`}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-brand-clay/30 p-8 rounded-lg space-y-4">
             <h4 className="font-serif text-xl tracking-tighter italic">Going away for a while?</h4>
             <p className="text-sm text-brand-ink/40 leading-relaxed font-serif tracking-tight">You can pause your entire subscription for up to 3 months. No fees, no fuss.</p>
             <button className="text-[10px] tracking-widest uppercase font-bold text-brand-ink border-b border-black/10 pb-1 hover:text-brand-terracotta hover:border-brand-terracotta transition-all">Pause entire subscription</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
