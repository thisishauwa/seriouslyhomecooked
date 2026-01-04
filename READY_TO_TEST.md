# ✅ Ready to Test Payments!

## 🎉 Plan Codes Added!

You've successfully added all 8 Paystack plan codes:
- ✅ `PLN_okj9nf158ai0nlj` - 2 People, 2 Meals (£34/week)
- ✅ `PLN_xjnm09ctxe03ge6` - 2 People, 3 Meals (£51/week)
- ✅ `PLN_7qr6oi2hpvuxjd0` - 2 People, 4 Meals (£68/week)
- ✅ `PLN_en2qc30u0ihj9qm` - 2 People, 5 Meals (£85/week)
- ✅ `PLN_04v190u3x4asbc5` - 4 People, 2 Meals (£68/week)
- ✅ `PLN_0e4zj6t43fpczfz` - 4 People, 3 Meals (£102/week)
- ✅ `PLN_rl4ma4imm3veylp` - 4 People, 4 Meals (£136/week)
- ✅ `PLN_unfkd3blm046vx6` - 4 People, 5 Meals (£170/week)

---

## 🚀 Final Steps Before Testing

### 1. Run Database Migration (2 minutes)

**In Supabase SQL Editor**, run this:

```sql
-- Add Paystack fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_authorization_code TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subscription 
ON public.profiles(paystack_subscription_code);

CREATE INDEX IF NOT EXISTS idx_profiles_paystack_customer 
ON public.profiles(paystack_customer_code);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name LIKE 'paystack%';
```

You should see 3 new columns:
- `paystack_subscription_code`
- `paystack_customer_code`
- `paystack_authorization_code`

---

### 2. Push Changes to GitHub (1 minute)

The plan codes are updated locally. Let's push them:

```bash
git add lib/paystack.ts
git commit -m "Add real Paystack plan codes"
git push origin main
```

---

### 3. Wait for Vercel Deploy (2-3 minutes)

Vercel will automatically deploy the latest changes.
Check: https://vercel.com/your-project/deployments

---

## 🧪 Test the Payment Flow

### Step 1: Go Through Onboarding
1. Open your app (localhost or Vercel URL)
2. Sign in with Google
3. Complete onboarding steps 1-3
4. On Step 4, you'll see your plan summary

### Step 2: Test Payment
1. Click **"Subscribe & Pay Now"**
2. Paystack popup should open
3. Enter test card details:
   - **Card**: `4084084084084081`
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
4. Click "Pay"
5. Enter PIN: `1234`
6. Enter OTP: `123456`
7. Payment should succeed!

### Step 3: Verify Success
After successful payment, check:

**1. Browser Console (F12):**
```
Payment successful: {reference: "...", subscription: {...}}
Subscription status updated successfully
```

**2. Supabase Database:**
```sql
SELECT 
  email,
  subscription_status,
  paystack_subscription_code,
  paystack_customer_code
FROM profiles
WHERE email = 'your-email@gmail.com';
```

Should show:
- `subscription_status`: `active`
- `paystack_subscription_code`: `SUB_xxx`
- `paystack_customer_code`: `CUS_xxx`

**3. Paystack Dashboard:**
- Go to: https://dashboard.paystack.com/#/subscriptions
- You should see your test subscription
- Status: Active
- Plan: Seriously Homecooked - 2 People, 3 Meals (or whatever you selected)

**4. App Behavior:**
- You should be redirected to the menu
- Hero should say "Your next meal kit for 2 people is arriving this Thursday"
- You should be able to add meals to cart
- Profile should show "Active" subscription

---

## 🎯 What to Test

### Test Case 1: Successful Payment
- ✅ Select 2 people, 3 meals
- ✅ Click "Subscribe & Pay Now"
- ✅ Complete payment with test card
- ✅ Verify subscription_status = 'active'
- ✅ Verify Paystack subscription created

### Test Case 2: Payment Cancelled
- ✅ Select any plan
- ✅ Click "Subscribe & Pay Now"
- ✅ Close Paystack popup without paying
- ✅ Verify subscription_status = 'inactive' (unchanged)
- ✅ Verify user can try again

### Test Case 3: Skip Payment
- ✅ Select any plan
- ✅ Click "Skip & Pay Later"
- ✅ Verify subscription_status = 'inactive'
- ✅ Verify user can browse menu
- ✅ Verify user sees "Start your subscription" message

### Test Case 4: Different Plans
- ✅ Test 2 people, 2 meals (£34)
- ✅ Test 2 people, 5 meals (£85)
- ✅ Test 4 people, 3 meals (£102)
- ✅ Verify correct plan code is used
- ✅ Verify correct amount is charged

---

## 🐛 Troubleshooting

### Paystack Popup Not Opening?
**Check:**
- Browser console for errors
- `window.PaystackPop` is defined (Paystack script loaded)
- `VITE_PAYSTACK_PUBLIC_KEY` is set in `.env`

**Fix:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check index.html has Paystack script
- Verify environment variables are loaded

### Payment Successful But Status Not Updated?
**Check:**
- Browser console for Supabase errors
- User is logged in (`supabase.auth.getUser()`)
- Supabase RLS policies allow updates

**Fix:**
- Check `updateSubscriptionStatus()` function
- Verify user ID is correct
- Check Supabase logs

### Wrong Plan Code Error?
**Check:**
- Plan codes in `lib/paystack.ts` match Paystack dashboard
- Plan is active in Paystack dashboard

**Fix:**
- Copy correct plan code from Paystack
- Update `lib/paystack.ts`
- Redeploy

---

## 📊 Expected Flow

```
User: Selects 2 people, 3 meals
    ↓
App: Calculates £51.00 (5100 pence)
    ↓
App: Gets plan code PLN_xjnm09ctxe03ge6
    ↓
User: Clicks "Subscribe & Pay Now"
    ↓
Paystack: Opens popup with £51.00 weekly subscription
    ↓
User: Enters test card 4084084084084081
    ↓
Paystack: Processes payment
    ↓
Paystack: Returns success response with:
  - reference
  - subscription_code (SUB_xxx)
  - customer_code (CUS_xxx)
    ↓
App: Updates Supabase:
  - subscription_status = 'active'
  - paystack_subscription_code = SUB_xxx
  - paystack_customer_code = CUS_xxx
    ↓
App: Redirects to menu
    ↓
User: Can now order meals! 🎉
```

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Paystack popup opens with correct amount
- ✅ Payment completes successfully
- ✅ Console shows "Subscription status updated successfully"
- ✅ Supabase shows subscription_status = 'active'
- ✅ Paystack dashboard shows new subscription
- ✅ User is redirected to menu
- ✅ Hero shows "Your next meal kit is arriving..."
- ✅ User can add meals to cart

---

## 🎊 You're Almost There!

Just need to:
1. ✅ Run SQL migration (2 min)
2. ✅ Push changes to GitHub (1 min)
3. ✅ Wait for Vercel deploy (2-3 min)
4. ✅ Test payment flow (5 min)

**Total time: ~10 minutes**

Then you're ready to accept real payments! 💳🚀

