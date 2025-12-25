
import React, { useState } from 'react';
import { CartItem, BoxConfig } from '../types';

interface CheckoutProps {
  items: CartItem[];
  onBack: () => void;
  onComplete: () => void;
  boxConfig: BoxConfig;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onBack, onComplete, boxConfig }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postcode: ''
  });
  
  const priceMultiplier = boxConfig.people / 2;
  const subtotal = items.reduce((sum, item) => sum + (item.price * priceMultiplier) * item.quantity, 0);
  const shipping = 4.95;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.address && formData.postcode;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center text-brand-ink/40 text-[10px] tracking-widest uppercase font-bold mb-12 hover:text-brand-ink transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-12">
              <h1 className="font-serif text-5xl tracking-tighter italic">Checkout</h1>
              <div className="flex space-x-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-10 h-1 rounded ${step >= s ? 'bg-brand-sage' : 'bg-black/5'}`} />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl tracking-tighter italic text-brand-ink">1. Delivery Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="col-span-2 bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Shipping Address" className="col-span-2 bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                  <input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="Postcode" className="bg-[#F9F9F9] border border-black/5 rounded px-6 py-4 focus:ring-1 focus:ring-brand-sage outline-none text-sm" />
                </div>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!isFormValid}
                  className="w-full bg-brand-ink text-white py-4 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all shadow-md disabled:opacity-20"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl tracking-tighter italic text-brand-ink">2. Shipping Method</h2>
                <div className="space-y-3">
                  <div className="p-6 bg-white border border-brand-sage rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm tracking-tight uppercase">Premium Heritage Courier</p>
                      <p className="text-xs text-brand-ink/40 italic mt-1">Insulated, plastic-free delivery this Thursday.</p>
                    </div>
                    <span className="font-bold text-sm">£4.95</span>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="w-full bg-brand-ink text-white py-4 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-serif text-2xl tracking-tighter italic text-brand-ink">3. Secure Payment</h2>
                <div className="bg-[#F9F9F9] border border-black/5 p-12 rounded-lg text-center space-y-6">
                  <svg className="w-12 h-12 mx-auto text-brand-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl italic tracking-tighter">Ready to cook?</h3>
                    <p className="text-brand-ink/40 text-sm max-w-xs mx-auto italic">Complete your subscription setup. You can pause or skip any week after this first box.</p>
                  </div>
                  <button 
                    onClick={onComplete}
                    className="w-full bg-brand-ink text-white py-4 rounded text-[11px] tracking-widest uppercase font-bold hover:bg-brand-sage transition-all shadow-lg"
                  >
                    Confirm Order • £{total.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#F9F9F9] border border-black/5 p-8 rounded-lg sticky top-32">
              <h3 className="font-serif text-2xl tracking-tighter italic mb-8">Summary</h3>
              <div className="space-y-4 mb-8 border-b border-black/5 pb-8">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={item.imageUrl} className="w-10 h-10 rounded object-cover border border-black/5" />
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-sage text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-ink/60">
                        {item.title} <span className="opacity-40 ml-1">({boxConfig.people}p)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold">£{((item.price * priceMultiplier) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-[10px] uppercase tracking-widest font-bold mb-8">
                <div className="flex justify-between text-brand-ink/30">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-ink/30">
                  <span>Delivery</span>
                  <span>£{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium tracking-tighter text-brand-ink pt-4 border-t border-black/5">
                  <span className="font-serif italic capitalize tracking-tighter text-xl">Total</span>
                  <span className="font-sans font-bold">£{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
