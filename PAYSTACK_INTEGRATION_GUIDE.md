# Paystack Integration Guide

## 🇳🇬 Payment Integration with Paystack

Paystack is perfect for Nigerian/African payments and has excellent subscription support!

---

## 📦 Step 1: Install Paystack SDK

```bash
npm install @paystack/inline-js
npm install --save-dev @types/paystack-js
```

Or use the React wrapper:
```bash
npm install react-paystack
```

---

## 🔑 Step 2: Environment Variables (Already Added!)

You've already added these to `.env`:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

✅ **Test keys are perfect for development!**

---

## 🛠️ Step 3: Create Paystack Client

Create `lib/paystack.ts`:

```typescript
import { PaystackButton } from 'react-paystack';

// Paystack configuration
export const paystackConfig = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  currency: 'GBP', // or 'NGN' for Naira
};

// Check if Paystack is configured
export const hasPaystackCredentials = !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// Initialize Paystack Inline
export const initializePaystack = () => {
  if (typeof window !== 'undefined' && (window as any).PaystackPop) {
    return (window as any).PaystackPop;
  }
  console.error('Paystack not loaded');
  return null;
};

// Create subscription plan
export interface PaystackSubscriptionPlan {
  name: string;
  amount: number; // in kobo (NGN) or pence (GBP)
  interval: 'daily' | 'weekly' | 'monthly' | 'annually';
  description?: string;
}

// Create a subscription
export const createSubscription = async (
  email: string,
  planCode: string,
  metadata?: Record<string, any>
) => {
  const PaystackPop = initializePaystack();
  if (!PaystackPop) return;

  const handler = PaystackPop.setup({
    key: paystackConfig.publicKey,
    email,
    plan: planCode,
    currency: paystackConfig.currency,
    metadata,
    onClose: () => {
      console.log('Payment popup closed');
    },
    callback: (response: any) => {
      console.log('Payment successful:', response);
      // Verify the transaction on your backend
      return response;
    },
  });

  handler.openIframe();
};

// One-time payment
export const makePayment = async (
  email: string,
  amount: number, // in kobo/pence
  metadata?: Record<string, any>
) => {
  const PaystackPop = initializePaystack();
  if (!PaystackPop) return;

  const handler = PaystackPop.setup({
    key: paystackConfig.publicKey,
    email,
    amount,
    currency: paystackConfig.currency,
    metadata,
    onClose: () => {
      console.log('Payment popup closed');
    },
    callback: (response: any) => {
      console.log('Payment successful:', response);
      return response;
    },
  });

  handler.openIframe();
};
```

---

## 📝 Step 4: Create Subscription Plans in Paystack Dashboard

### Option A: Via Paystack Dashboard (Recommended)
1. Go to https://dashboard.paystack.com/#/plans
2. Click "Create Plan"
3. Fill in details:
   - **Name**: "Seriously Homecooked - 2 People, 3 Meals"
   - **Amount**: £51.00 = 5100 pence (or ₦51,000 = 5100000 kobo)
   - **Interval**: Weekly
   - **Currency**: GBP (or NGN)
4. Save and copy the **Plan Code** (e.g., `PLN_xxx`)

### Option B: Via API (Programmatic)
```typescript
// api/create-paystack-plan.ts
export const createPaystackPlan = async (
  name: string,
  amount: number,
  interval: string
) => {
  const response = await fetch('https://api.paystack.co/plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      amount, // in kobo/pence
      interval, // daily, weekly, monthly, annually
      currency: 'GBP', // or NGN
    }),
  });
  
  const data = await response.json();
  return data.data.plan_code;
};
```

---

## 🎨 Step 5: Update Onboarding Component

Replace the alert in `components/Onboarding.tsx`:

```typescript
import { usePaystackPayment } from 'react-paystack';
import { supabase } from '../lib/supabase';

// Inside the component:
const [isProcessingPayment, setIsProcessingPayment] = useState(false);

// Calculate plan code based on user selection
const getPlanCode = () => {
  // Map your plans to Paystack plan codes
  const planMap: Record<string, string> = {
    '2-3': 'PLN_2people3meals', // 2 people, 3 meals
    '2-4': 'PLN_2people4meals',
    '4-3': 'PLN_4people3meals',
    '4-4': 'PLN_4people4meals',
  };
  
  const key = `${profile.people}-${profile.recipesPerWeek}`;
  return planMap[key] || 'PLN_2people3meals';
};

// Paystack configuration
const paystackConfig = {
  reference: `sub_${new Date().getTime()}`,
  email: 'user@email.com', // Get from auth
  amount: profile.people * profile.recipesPerWeek * 850, // £8.50 = 850 pence
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  plan: getPlanCode(),
  metadata: {
    userId: 'user-id', // Get from auth
    people: profile.people,
    recipesPerWeek: profile.recipesPerWeek,
  },
};

// Payment handlers
const onSuccess = async (reference: any) => {
  console.log('Payment successful:', reference);
  setIsProcessingPayment(true);
  
  try {
    // Update user's subscription status in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          paystack_subscription_code: reference.subscription_code,
          paystack_customer_code: reference.customer_code,
        })
        .eq('id', user.id);
    }
    
    // Complete onboarding
    onComplete(profile);
  } catch (error) {
    console.error('Error updating subscription:', error);
    alert('Payment successful but failed to update account. Please contact support.');
  } finally {
    setIsProcessingPayment(false);
  }
};

const onClose = () => {
  console.log('Payment popup closed');
};

const initializePayment = usePaystackPayment(paystackConfig);

// Replace the "Subscribe & Pay Now" button:
<button 
  onClick={() => {
    initializePayment(onSuccess, onClose);
  }}
  disabled={isProcessingPayment}
  className="w-full bg-brand-ink text-white py-6 rounded text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-sage transition-all shadow-lg disabled:opacity-50"
>
  {isProcessingPayment ? 'Processing...' : 'Subscribe & Pay Now'}
</button>
```

---

## 🗄️ Step 6: Update Database Schema

Add Paystack fields to profiles table:

```sql
-- Add Paystack subscription tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_authorization_code TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subscription 
ON public.profiles(paystack_subscription_code);
```

---

## 🔔 Step 7: Set Up Webhooks

Paystack will send webhooks for subscription events. Create a webhook handler:

### Create Supabase Edge Function or API Route:

```typescript
// api/paystack-webhook.ts (Vercel API route)
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key
  );

  try {
    switch (event.event) {
      case 'subscription.create':
        // New subscription created
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            paystack_subscription_code: event.data.subscription_code,
            paystack_customer_code: event.data.customer.customer_code,
          })
          .eq('email', event.data.customer.email);
        break;

      case 'subscription.disable':
        // Subscription cancelled
        await supabase
          .from('profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('paystack_subscription_code', event.data.subscription_code);
        break;

      case 'charge.success':
        // Recurring payment successful
        console.log('Payment successful:', event.data);
        // Create order record
        break;

      case 'charge.failed':
        // Payment failed
        await supabase
          .from('profiles')
          .update({ subscription_status: 'paused' })
          .eq('paystack_subscription_code', event.data.subscription_code);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

### Configure Webhook in Paystack Dashboard:
1. Go to https://dashboard.paystack.com/#/settings/developer
2. Add webhook URL: `https://your-app.vercel.app/api/paystack-webhook`
3. Select events:
   - `subscription.create`
   - `subscription.disable`
   - `charge.success`
   - `charge.failed`

---

## 💳 Step 8: Subscription Management

### Cancel Subscription:
```typescript
export const cancelSubscription = async (
  subscriptionCode: string,
  emailToken: string
) => {
  const response = await fetch(
    `https://api.paystack.co/subscription/disable`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    }
  );
  
  return await response.json();
};
```

### Pause Subscription:
Paystack doesn't have a native "pause" feature, but you can:
1. Disable the subscription
2. Store the plan details
3. Create a new subscription when user wants to resume

---

## 🧪 Step 9: Testing

### Test Cards (Paystack Test Mode):
- **Success**: `4084084084084081`
- **Insufficient Funds**: `5060666666666666666`
- **Invalid CVV**: Any card with CVV `000`

**Test Details:**
- CVV: Any 3 digits (except 000 for error)
- Expiry: Any future date
- PIN: `1234`
- OTP: `123456`

### Test Flow:
1. Go through onboarding
2. Click "Subscribe & Pay Now"
3. Enter test card details
4. Complete payment
5. Check Supabase - `subscription_status` should be 'active'
6. Check Paystack dashboard - subscription should appear

---

## 📊 Paystack Dashboard Features

### View Subscriptions:
- https://dashboard.paystack.com/#/subscriptions
- See all active/cancelled subscriptions
- View payment history
- Manually cancel subscriptions

### View Transactions:
- https://dashboard.paystack.com/#/transactions
- See all successful/failed payments
- Export transaction reports

### View Customers:
- https://dashboard.paystack.com/#/customers
- See all customers
- View customer payment history

---

## 🎯 Implementation Checklist

- [ ] Install `react-paystack` package
- [ ] Create `lib/paystack.ts` client
- [ ] Add Paystack script to `index.html`
- [ ] Create subscription plans in Paystack dashboard
- [ ] Update `Onboarding.tsx` with Paystack payment
- [ ] Add Paystack fields to database schema
- [ ] Create webhook handler (`api/paystack-webhook.ts`)
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Test with test cards
- [ ] Add subscription management UI (cancel, pause)
- [ ] Switch to live keys for production

---

## 🚀 Quick Start Code

### Add Paystack Script to `index.html`:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

### Install Package:
```bash
npm install react-paystack
```

### Use in Component:
```typescript
import { usePaystackPayment } from 'react-paystack';

const config = {
  reference: new Date().getTime().toString(),
  email: user.email,
  amount: 5100, // £51.00 in pence
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
};

const initializePayment = usePaystackPayment(config);

<button onClick={() => initializePayment(onSuccess, onClose)}>
  Pay Now
</button>
```

---

## 💰 Pricing Notes

### GBP (Pounds):
- Amount is in **pence** (1 pound = 100 pence)
- £51.00 = 5100 pence

### NGN (Naira):
- Amount is in **kobo** (1 naira = 100 kobo)
- ₦51,000 = 5100000 kobo

### Paystack Fees:
- **Local cards (Nigeria)**: 1.5% capped at ₦2,000
- **International cards**: 3.9% + ₦100
- **No setup fees or monthly charges**

---

## 🔐 Security Best Practices

1. **Never expose secret key** - Only use on server-side
2. **Verify webhooks** - Always check signature
3. **Use HTTPS** - Required for production
4. **Validate amounts** - Double-check on server
5. **Test thoroughly** - Use test mode extensively

---

## 📚 Resources

- **Paystack Docs**: https://paystack.com/docs
- **Subscriptions Guide**: https://paystack.com/docs/payments/subscriptions
- **React Integration**: https://github.com/iamraphson/react-paystack
- **API Reference**: https://paystack.com/docs/api
- **Dashboard**: https://dashboard.paystack.com

---

## ✅ Next Steps

1. **Install packages** (5 min)
2. **Create subscription plans** in Paystack dashboard (10 min)
3. **Update Onboarding.tsx** (30 min)
4. **Add webhook handler** (30 min)
5. **Test end-to-end** (30 min)

**Total time: ~2 hours** 🎉

Much faster than Stripe for African markets!

