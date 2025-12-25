
import React from 'react';
import { BoxConfig } from '../types';

interface PlanSelectorProps {
  config: BoxConfig;
  onChange: (config: BoxConfig) => void;
  onContinue: () => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ config, onChange, onContinue }) => {
  return (
    <section id="plans" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Meal Plans</span>
            <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none text-brand-ink">
              Choose a plan that <br /><span className="italic text-brand-sage">works</span> for you.
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-brand-ink/30 italic text-xl font-serif max-w-sm ml-auto">
              Select your servings and frequency. You can pause or change your plan at any time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Step 1: People */}
          <div className="md:col-span-7 group">
            <div className="bg-[#FDFBF7] rounded-lg border border-black/5 p-10 md:p-14 h-full flex flex-col justify-between transition-all hover:bg-white hover:shadow-xl">
              <div>
                <span className="text-brand-gold text-[9px] tracking-[0.3em] uppercase font-bold mb-8 block">01 / Servings</span>
                <h3 className="font-serif text-4xl mb-6 tracking-tighter italic leading-none">Who are you cooking for?</h3>
                <p className="text-brand-ink/40 text-base mb-10 leading-relaxed max-w-sm font-serif italic">
                  Generous portions designed for a great home-cooked experience.
                </p>
              </div>
              
              <div className="flex gap-4">
                {[2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => onChange({ ...config, people: num })}
                    className={`flex-1 py-4 rounded text-[10px] uppercase tracking-widest font-bold transition-all border ${
                      config.people === num 
                      ? 'bg-brand-ink text-white border-brand-ink shadow-lg' 
                      : 'bg-white border-black/5 text-brand-ink hover:border-black/20'
                    }`}
                  >
                    {num === 2 ? '2 People' : '4 People'}
                    <span className="block text-[8px] opacity-40 mt-1">(Serves {num})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Visual */}
          <div className="md:col-span-5 relative overflow-hidden rounded-lg bg-brand-ink flex flex-col items-center justify-center p-12 text-center text-white min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" 
              alt="Kitchen" 
            />
            <div className="relative z-10 space-y-4">
              <h4 className="font-serif text-2xl italic tracking-tighter opacity-60">Meal rates from</h4>
              <div className="text-8xl font-medium tracking-tighter leading-none">£5<span className="text-4xl">.50</span></div>
              <p className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-40 pt-4">Per Serving</p>
            </div>
          </div>

          {/* Step 2: Frequency */}
          <div className="md:col-span-12">
            <div className="bg-[#F9F9F9] rounded-lg border border-black/5 p-10 md:p-14 flex flex-col lg:flex-row items-center gap-16 transition-all hover:bg-white hover:shadow-xl">
              <div className="lg:w-1/3">
                <span className="text-brand-gold text-[9px] tracking-[0.3em] uppercase font-bold mb-8 block">02 / Frequency</span>
                <h3 className="font-serif text-4xl mb-4 tracking-tighter italic leading-none">How many meals?</h3>
                <p className="text-brand-ink/40 text-base leading-relaxed font-serif italic">
                  Choose how many recipes you'd like delivered each week.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => onChange({ ...config, recipesPerWeek: num })}
                    className={`py-8 rounded transition-all flex flex-col items-center justify-center border ${
                      config.recipesPerWeek === num 
                      ? 'bg-brand-sage text-white border-brand-sage shadow-xl scale-[1.02]' 
                      : 'bg-white border-black/5 text-brand-ink hover:border-black/20'
                    }`}
                  >
                    <span className="text-5xl font-medium tracking-tighter leading-none">{num}</span>
                    <span className="text-[9px] tracking-[0.2em] uppercase font-bold mt-2 opacity-60">Meals Per Week</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 flex flex-col items-center space-y-8 animate-in slide-in-from-bottom-4 duration-700">
           <button 
             onClick={onContinue}
             className="bg-brand-sage text-white px-16 py-5 rounded text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-brand-ink transition-all shadow-xl active:scale-95"
           >
             Continue to Menu
           </button>
           <p className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/20 italic">Next, you'll choose the specific meals you want for your first delivery.</p>
        </div>
      </div>
    </section>
  );
};

export default PlanSelector;
