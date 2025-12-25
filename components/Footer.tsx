
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-brand-cream/40 py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-20 mb-32">
          <div className="md:col-span-2">
            <a href="#" className="font-serif text-4xl tracking-tight text-brand-cream mb-10 block">
              Seriously<span className="italic text-brand-terracotta ml-1">homecooked</span>
            </a>
            <p className="max-w-xs text-base leading-relaxed mb-12 font-light text-brand-cream/50">
              Elevating the home dining experience through exceptional sourcing, 
              minimal waste, and a passion for real cooking.
            </p>
            <div className="flex space-x-8 text-[10px] tracking-[0.4em] uppercase font-black text-brand-cream/80">
              <a href="#" className="hover:text-brand-gold transition-colors">Instagram</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Pinterest</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Journal</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-brand-gold text-[10px] tracking-[0.5em] uppercase font-black mb-10">Product</h4>
            <ul className="space-y-6 text-sm">
              <li><a href="#" className="hover:text-brand-cream transition-colors">Weekly Menu</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">The Journal</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Gifting</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-brand-gold text-[10px] tracking-[0.5em] uppercase font-black mb-10">Company</h4>
            <ul className="space-y-6 text-sm">
              <li><a href="#" className="hover:text-brand-cream transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Producers</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold text-[10px] tracking-[0.5em] uppercase font-black mb-10">Support</h4>
            <ul className="space-y-6 text-sm">
              <li><a href="#" className="hover:text-brand-cream transition-colors">Help Centre</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-brand-cream transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-[0.5em] uppercase font-black text-brand-cream/20">
          <p>© 2024 Seriously Homecooked Ltd.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <span>Heritage Producers First</span>
            <span className="text-brand-terracotta">Eat Seriously.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
