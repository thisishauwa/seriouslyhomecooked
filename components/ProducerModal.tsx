
import React from 'react';
import { Producer } from '../types';

interface ProducerModalProps {
  producer: Producer;
  onClose: () => void;
}

const ProducerModal: React.FC<ProducerModalProps> = ({ producer, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img src={producer.imageUrl} className="w-full h-full object-cover" alt={producer.name} />
        </div>
        <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-[#FDFBF7]">
          <span className="text-brand-terracotta text-[9px] tracking-[0.3em] uppercase font-bold mb-4 block">Our Heritage Partners</span>
          <h2 className="font-serif text-5xl mb-6 tracking-tighter italic leading-none">{producer.name}</h2>
          <div className="space-y-2 mb-8 border-l border-black/10 pl-6">
            <p className="text-brand-ink/60 text-[10px] tracking-widest uppercase font-bold">Location: {producer.location}</p>
            <p className="text-brand-ink/60 text-[10px] tracking-widest uppercase font-bold">Focus: {producer.specialty}</p>
          </div>
          <p className="text-brand-ink/80 text-xl font-serif tracking-tight leading-snug italic mb-10">"{producer.story}"</p>
          <button 
            onClick={onClose}
            className="w-full py-4 rounded bg-brand-ink text-white text-[10px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
          >
            Return to Menu
          </button>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-white md:text-brand-ink/20 hover:text-brand-ink transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ProducerModal;
