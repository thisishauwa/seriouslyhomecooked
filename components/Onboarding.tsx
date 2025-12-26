
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { 
  createSubscription, 
  generateReference, 
  getPlanCode, 
  calculateWeeklyPrice, 
  toPence,
  updateSubscriptionStatus,
  paystackConfig 
} from '../lib/paystack';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    people: 2,
    recipesPerWeek: 3,
    skillLevel: 'All',
    allergies: [],
    preferences: []
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Handle Paystack payment
  const handlePaystackPayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        alert('Please sign in to continue');
        setIsProcessingPayment(false);
        return;
      }

      // Calculate amount
      const weeklyPrice = calculateWeeklyPrice(profile.people, profile.recipesPerWeek);
      const amountInPence = toPence(weeklyPrice);

      // Get plan code (you'll need to create these plans in Paystack dashboard)
      const planCode = getPlanCode(profile.people, profile.recipesPerWeek);

      // Create subscription with Paystack
      createSubscription({
        reference: generateReference('sub'),
        email: user.email,
        amount: amountInPence,
        publicKey: paystackConfig.publicKey,
        plan: planCode,
        metadata: {
          userId: user.id,
          people: profile.people,
          recipesPerWeek: profile.recipesPerWeek,
          skillLevel: profile.skillLevel,
        },
        onSuccess: async (response: any) => {
          console.log('Payment successful:', response);
          
          // Update subscription status in Supabase
          const success = await updateSubscriptionStatus(user.id, {
            subscriptionCode: response.subscription?.subscription_code,
            customerCode: response.customer?.customer_code,
            authorizationCode: response.authorization?.authorization_code,
          });

          if (success) {
            // Update profile with active subscription
            const updatedProfile = {
              ...profile,
              subscriptionStatus: 'active' as const,
            };
            onComplete(updatedProfile);
          } else {
            alert('Payment successful but failed to update account. Please contact support.');
          }
          
          setIsProcessingPayment(false);
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsProcessingPayment(false);
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    const trimmedAllergy = allergy.trim();
    if (!trimmedAllergy) return;

    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.some(a => a.toLowerCase() === trimmedAllergy.toLowerCase())
        ? prev.allergies.filter(a => a.toLowerCase() !== trimmedAllergy.toLowerCase())
        : [...prev.allergies, trimmedAllergy]
    }));
  };

  const commonAllergies = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Soy', 'Eggs'];

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg border border-black/5 p-10 md:p-14 shadow-xl animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded transition-colors duration-500 ${step >= s ? 'bg-brand-sage' : 'bg-black/5'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div>
              <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Step 1 of 3</span>
              <h2 className="font-serif text-5xl tracking-tighter italic text-brand-ink">Choose your plan.</h2>
              <p className="text-brand-ink/40 font-serif italic text-lg mt-2">Let's start with the basics of your weekly box.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40">Cooking for</label>
                <div className="flex gap-4">
                  {[2, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setProfile({ ...profile, people: n })}
                      className={`flex-1 py-4 rounded text-[10px] uppercase tracking-widest font-bold transition-all border ${
                        profile.people === n ? 'bg-brand-ink text-white border-brand-ink shadow-md' : 'bg-white border-black/5 text-brand-ink hover:border-black/20'
                      }`}
                    >
                      {n} People
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40">Meals per week</label>
                <div className="grid grid-cols-2 gap-4">
                  {[2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setProfile({ ...profile, recipesPerWeek: n })}
                      className={`py-4 rounded text-[10px] uppercase tracking-widest font-bold transition-all border ${
                        profile.recipesPerWeek === n ? 'bg-brand-ink text-white border-brand-ink shadow-md' : 'bg-white border-black/5 text-brand-ink hover:border-black/20'
                      }`}
                    >
                      {n} Meals
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={nextStep}
              className="w-full bg-brand-sage text-white py-5 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-ink transition-all shadow-lg mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div>
              <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Step 2 of 3</span>
              <h2 className="font-serif text-5xl tracking-tighter italic text-brand-ink">Preferences & Allergies.</h2>
              <p className="text-brand-ink/40 font-serif italic text-lg mt-2">Help us curate the best recipes for your kitchen.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase font-bold text-brand-ink/40">Any dietary restrictions or allergies?</label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAllergy(a)}
                      className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all ${
                        profile.allergies.includes(a) ? 'bg-brand-terracotta text-white border-brand-terracotta shadow-sm' : 'bg-[#F9F9F9] border-black/5 text-brand-ink/40 hover:border-black/20'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (allergyInput.trim()) {
                          toggleAllergy(allergyInput);
                          setAllergyInput('');
                        }
                      }
                    }}
                    placeholder="Add other..."
                    className="flex-1 bg-[#F9F9F9] border border-black/5 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-sage"
                  />
                  <button 
                    onClick={() => {
                      if (allergyInput.trim()) {
                        toggleAllergy(allergyInput);
                        setAllergyInput('');
                      }
                    }}
                    className="px-6 bg-brand-ink text-white rounded text-[10px] uppercase tracking-widest font-bold hover:bg-brand-sage transition-colors"
                  >
                    Add
                  </button>
                </div>
                {profile.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {profile.allergies.filter(a => !commonAllergies.includes(a)).map(a => (
                      <span key={a} className="inline-flex items-center bg-brand-clay/50 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full text-brand-ink/60 border border-black/5">
                        {a}
                        <button onClick={() => toggleAllergy(a)} className="ml-2 hover:text-brand-terracotta">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button onClick={prevStep} className="px-8 py-5 border border-black/5 rounded text-[11px] uppercase tracking-widest font-bold hover:bg-black/5">Back</button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-brand-sage text-white py-5 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-ink transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div>
              <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Step 3 of 4</span>
              <h2 className="font-serif text-5xl tracking-tighter italic text-brand-ink">Cooking Skill.</h2>
              <p className="text-brand-ink/40 font-serif italic text-lg mt-2">What's your comfort level in the kitchen?</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 'Easy', label: 'Beginner', desc: 'Focus on simple techniques and quick meals.' },
                { id: 'Medium', label: 'Intermediate', desc: 'Comfortable with basic prep and longer cook times.' },
                { id: 'Advanced', label: 'Chef level', desc: 'Passionate about complex techniques and artisan ingredients.' },
                { id: 'All', label: 'Show me everything', desc: 'I love to experiment with all kinds of recipes.' }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setProfile({ ...profile, skillLevel: level.id as any })}
                  className={`w-full p-6 text-left rounded border transition-all ${
                    profile.skillLevel === level.id ? 'bg-brand-ink text-white border-brand-ink shadow-lg' : 'bg-white border-black/5 text-brand-ink hover:border-black/20'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-1">{level.label}</p>
                  <p className={`font-serif italic text-base ${profile.skillLevel === level.id ? 'text-white/60' : 'text-brand-ink/40'}`}>{level.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-8">
              <button onClick={prevStep} className="px-8 py-5 border border-black/5 rounded text-[11px] uppercase tracking-widest font-bold hover:bg-black/5">Back</button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-brand-sage text-white py-5 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-ink transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div>
              <span className="text-brand-terracotta text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Step 4 of 4</span>
              <h2 className="font-serif text-5xl tracking-tighter italic text-brand-ink">Choose Your Plan.</h2>
              <p className="text-brand-ink/40 font-serif italic text-lg mt-2">Start your culinary journey today.</p>
            </div>

            {/* Plan Summary */}
            <div className="bg-brand-cream/50 border border-black/5 rounded-lg p-8">
              <h3 className="font-serif text-2xl tracking-tighter text-brand-ink mb-6">Your Selection</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-brand-ink/60 text-sm">People</span>
                  <span className="font-bold text-brand-ink">{profile.people}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-ink/60 text-sm">Meals per week</span>
                  <span className="font-bold text-brand-ink">{profile.recipesPerWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-ink/60 text-sm">Skill level</span>
                  <span className="font-bold text-brand-ink">{profile.skillLevel}</span>
                </div>
                <div className="border-t border-black/10 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-brand-ink font-bold">Weekly Total</span>
                  <span className="font-serif text-3xl text-brand-sage">£{(profile.people * profile.recipesPerWeek * 8.5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <button 
                onClick={handlePaystackPayment}
                disabled={isProcessingPayment}
                className="w-full bg-brand-ink text-white py-6 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-sage transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? 'Processing...' : 'Subscribe & Pay Now'}
              </button>
              
              <button 
                onClick={() => onComplete(profile)}
                className="w-full border-2 border-brand-ink/10 text-brand-ink py-6 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-ink/5 transition-all"
              >
                Skip & Pay Later
              </button>
            </div>

            <p className="text-center text-brand-ink/40 text-xs font-serif italic">
              No commitment. Cancel anytime before Monday midnight.
            </p>

            <div className="pt-4">
              <button onClick={prevStep} className="text-brand-ink/40 text-[10px] uppercase tracking-widest font-bold hover:text-brand-ink">
                ← Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
