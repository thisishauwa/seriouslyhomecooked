
import React from 'react';
import { JOURNAL_ENTRIES } from '../constants';

const Journal: React.FC = () => {
  return (
    <section id="journal" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-sage text-[9px] tracking-[0.4em] uppercase font-bold mb-3 block">Curated Content</span>
          <h2 className="font-serif text-5xl md:text-6xl tracking-tighter italic leading-none">Notes from the kitchen</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {JOURNAL_ENTRIES.map((entry) => (
            <div key={entry.id} className="group cursor-pointer">
              <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 relative border border-black/5 bg-[#F9F9F9]">
                <img src={entry.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={entry.title} />
                <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/5 transition-colors" />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded text-[8px] tracking-widest uppercase font-bold text-brand-ink shadow-sm">
                  {entry.category}
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] tracking-widest uppercase font-bold text-brand-ink/20">{entry.date}</p>
                <h3 className="font-serif text-2xl tracking-tighter italic leading-none group-hover:text-brand-sage transition-colors">{entry.title}</h3>
                <p className="text-brand-ink/40 text-sm tracking-tight leading-relaxed">{entry.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Journal;
