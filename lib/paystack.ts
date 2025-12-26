// Paystack Payment Integration
import { supabase } from './supabase';

// Paystack configuration
export const paystackConfig = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  currency: 'GBP', // Change to 'NGN' for Naira
};

// Check if Paystack is configured
export const hasPaystackCredentials = !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

if (!hasPaystackCredentials) {
  console.warn(
    '⚠️ Paystack credentials not configured. Payment functionality will be limited.\n' +
    'Add VITE_PAYSTACK_PUBLIC_KEY to your environment variables.'
  );
}

// Payment configuration interface
export interface PaystackConfig {
  reference: string;
  email: string;
  amount: number; // in kobo (NGN) or pence (GBP)
  publicKey: string;
  currency?: string;
  metadata?: Record<string, any>;
  plan?: string; // For subscriptions
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
}

// Initialize Paystack Inline (loaded from script tag)
export const initializePaystack = () => {
  if (typeof window !== 'undefined' && (window as any).PaystackPop) {
    return (window as any).PaystackPop;
  }
  console.error('Paystack not loaded. Make sure the script tag is in index.html');
  return null;
};

// Create a one-time payment
export const makePayment = (config: PaystackConfig) => {
  const PaystackPop = initializePaystack();
  if (!PaystackPop) {
    alert('Payment system not loaded. Please refresh the page.');
    return;
  }

  const handler = PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount,
    currency: config.currency || paystackConfig.currency,
    ref: config.reference,
    metadata: config.metadata,
    onClose: () => {
      console.log('Payment popup closed');
      config.onClose?.();
    },
    callback: (response: any) => {
      console.log('Payment successful:', response);
      config.onSuccess?.(response);
    },
  });

  handler.openIframe();
};

// Create a subscription
export const createSubscription = (config: PaystackConfig) => {
  const PaystackPop = initializePaystack();
  if (!PaystackPop) {
    alert('Payment system not loaded. Please refresh the page.');
    return;
  }

  if (!config.plan) {
    console.error('Plan code is required for subscriptions');
    return;
  }

  const handler = PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    plan: config.plan,
    currency: config.currency || paystackConfig.currency,
    ref: config.reference,
    metadata: config.metadata,
    onClose: () => {
      console.log('Subscription popup closed');
      config.onClose?.();
    },
    callback: (response: any) => {
      console.log('Subscription successful:', response);
      config.onSuccess?.(response);
    },
  });

  handler.openIframe();
};

// Update user subscription status after successful payment
export const updateSubscriptionStatus = async (
  userId: string,
  subscriptionData: {
    subscriptionCode?: string;
    customerCode?: string;
    authorizationCode?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        paystack_subscription_code: subscriptionData.subscriptionCode,
        paystack_customer_code: subscriptionData.customerCode,
        paystack_authorization_code: subscriptionData.authorizationCode,
      })
      .eq('id', userId);

    if (error) throw error;
    
    console.log('Subscription status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return false;
  }
};

// Generate unique payment reference
export const generateReference = (prefix: string = 'pay') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Convert amount to kobo/pence (Paystack uses smallest currency unit)
export const toPence = (amount: number) => {
  return Math.round(amount * 100);
};

// Convert kobo/pence back to main currency
export const fromPence = (amount: number) => {
  return amount / 100;
};

// Get plan code based on user selection
export const getPlanCode = (people: number, mealsPerWeek: number): string => {
  // You'll need to create these plans in Paystack dashboard first
  // Then update these codes with your actual plan codes
  const planMap: Record<string, string> = {
    '2-2': 'PLN_2people2meals', // £34.00/week
    '2-3': 'PLN_2people3meals', // £51.00/week
    '2-4': 'PLN_2people4meals', // £68.00/week
    '2-5': 'PLN_2people5meals', // £85.00/week
    '4-2': 'PLN_4people2meals', // £68.00/week
    '4-3': 'PLN_4people3meals', // £102.00/week
    '4-4': 'PLN_4people4meals', // £136.00/week
    '4-5': 'PLN_4people5meals', // £170.00/week
  };

  const key = `${people}-${mealsPerWeek}`;
  return planMap[key] || 'PLN_2people3meals'; // Default plan
};

// Calculate weekly price
export const calculateWeeklyPrice = (people: number, mealsPerWeek: number): number => {
  const pricePerMeal = 8.5; // £8.50 per meal per person
  return people * mealsPerWeek * pricePerMeal;
};

