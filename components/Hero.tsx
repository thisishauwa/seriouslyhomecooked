
import React from 'react';
import { BoxConfig } from '../types';

interface HeroProps {
  onStartPlan: () => void;
  onBrowseMenu: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  config?: BoxConfig;
  subscriptionStatus?: 'active' | 'inactive' | 'paused' | 'cancelled';
}

const Hero: React.FC<HeroProps> = ({ onStartPlan, onBrowseMenu, isLoggedIn, userName, config, subscriptionStatus }) => {
  // Calculate next delivery date (next Thursday from today)
  const getNextDeliveryDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
    return nextThursday.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const hasActiveSubscription = subscriptionStatus === 'active';

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-white overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {isLoggedIn ? (
          <div className="animate-in fade-in duration-700">
             <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-6 block italic">Welcome back, {userName}</span>
             <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter leading-[0.9] text-brand-ink mb-8 text-balance">
              What would you <br />
              <span className="italic text-brand-sage font-normal">like</span> for dinner?
            </h1>
            {hasActiveSubscription ? (
              <p className="text-xl md:text-2xl text-brand-ink/30 mb-12 max-w-2xl mx-auto font-serif tracking-tight leading-snug">
                Your next meal kit for <span className="text-brand-ink font-bold not-italic">{config?.people} people</span> is arriving this {getNextDeliveryDay()}. <br/>
                Ready to select your meals for next week?
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-brand-ink/30 mb-12 max-w-2xl mx-auto font-serif tracking-tight leading-snug">
                Browse our chef-curated menu and <span className="text-brand-ink font-bold not-italic">start your subscription</span> to get <br className="hidden sm:block" />
                fresh meal kits delivered weekly.
              </p>
            )}
          </div>
        ) : (
          <>
            <h1 className="font-serif text-5xl md:text-8xl font-medium tracking-tighter leading-[0.9] text-brand-ink mb-8 text-balance">
              Cook the world’s <br />
              <span className="italic text-brand-sage font-normal">best</span> recipes at home.
            </h1>
            <p className="text-xl md:text-2xl text-brand-ink/30 mb-12 max-w-2xl mx-auto font-serif tracking-tight leading-snug">
              Freshly sourced, chef-curated meal kits <br className="hidden sm:block" /> delivered to your door.
            </p>
          </>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button 
            onClick={onStartPlan}
            className="bg-brand-ink text-white px-12 py-5 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-sage transition-all shadow-2xl active:scale-95"
          >
            {isLoggedIn ? 'Manage My Plan' : 'View Meal Plans'}
          </button>
          <button 
            onClick={onBrowseMenu}
            className="text-brand-ink text-[11px] uppercase tracking-[0.2em] font-bold border-b-2 border-brand-ink/10 pb-1.5 hover:border-brand-ink transition-all active:translate-y-px"
          >
            Browse the Menu
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
