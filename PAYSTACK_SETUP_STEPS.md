# Paystack Setup - Quick Steps

## ✅ Step 1: Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Copy contents of add-paystack-fields.sql
```

This adds:
- `paystack_subscription_code`
- `paystack_customer_code`
- `paystack_authorization_code`

---

## ✅ Step 2: Create Subscription Plans in Paystack

### Go to Paystack Dashboard:
https://dashboard.paystack.com/#/plans

### Create These Plans:

#### Plan 1: 2 People, 2 Meals
- **Name**: Seriously Homecooked - 2 People, 2 Meals
- **Amount**: 3400 (£34.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_2people2meals` ⚠️ **Copy this code!**

#### Plan 2: 2 People, 3 Meals (Most Popular)
- **Name**: Seriously Homecooked - 2 People, 3 Meals
- **Amount**: 5100 (£51.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_2people3meals`

#### Plan 3: 2 People, 4 Meals
- **Name**: Seriously Homecooked - 2 People, 4 Meals
- **Amount**: 6800 (£68.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_2people4meals`

#### Plan 4: 2 People, 5 Meals
- **Name**: Seriously Homecooked - 2 People, 5 Meals
- **Amount**: 8500 (£85.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_2people5meals`

#### Plan 5: 4 People, 2 Meals
- **Name**: Seriously Homecooked - 4 People, 2 Meals
- **Amount**: 6800 (£68.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_4people2meals`

#### Plan 6: 4 People, 3 Meals
- **Name**: Seriously Homecooked - 4 People, 3 Meals
- **Amount**: 10200 (£102.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_4people3meals`

#### Plan 7: 4 People, 4 Meals
- **Name**: Seriously Homecooked - 4 People, 4 Meals
- **Amount**: 13600 (£136.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_4people4meals`

#### Plan 8: 4 People, 5 Meals
- **Name**: Seriously Homecooked - 4 People, 5 Meals
- **Amount**: 17000 (£170.00 in pence)
- **Interval**: Weekly
- **Currency**: GBP
- **Plan Code**: `PLN_4people5meals`

---

## ✅ Step 3: Update Plan Codes in Code

After creating plans, update `lib/paystack.ts` if the plan codes are different:

```typescript
const planMap: Record<string, string> = {
  '2-2': 'PLN_xxx', // Replace with actual code from Paystack
  '2-3': 'PLN_xxx',
  // ... etc
};
```

---

## ✅ Step 4: Test with Test Cards

### Test Card Numbers:
- **Success**: `4084084084084081`
- **Insufficient Funds**: `5060666666666666666`
- **Declined**: Use CVV `000`

### Test Details:
- **CVV**: Any 3 digits (except 000 for error)
- **Expiry**: Any future date
- **PIN**: `1234`
- **OTP**: `123456`

---

## ✅ Step 5: Test the Flow

1. Go through onboarding
2. Select 2 people, 3 meals
3. Click "Subscribe & Pay Now"
4. Paystack popup should open
5. Enter test card: `4084084084084081`
6. Complete payment
7. Check Supabase - `subscription_status` should be 'active'
8. Check Paystack dashboard - subscription should appear

---

## ✅ Step 6: Set Up Webhooks (Optional but Recommended)

### Create Webhook Handler:
1. Deploy webhook endpoint (see `PAYSTACK_INTEGRATION_GUIDE.md`)
2. Go to https://dashboard.paystack.com/#/settings/developer
3. Add webhook URL: `https://your-app.vercel.app/api/paystack-webhook`
4. Select events:
   - `subscription.create`
   - `subscription.disable`
   - `charge.success`
   - `charge.failed`

---

## 🎯 Quick Checklist

- [ ] Run `add-paystack-fields.sql` in Supabase
- [ ] Create 8 subscription plans in Paystack dashboard
- [ ] Copy plan codes
- [ ] Update `lib/paystack.ts` if needed
- [ ] Test with test card
- [ ] Verify subscription status updates
- [ ] (Optional) Set up webhooks

---

## 💡 Tips

### Currency Note:
- Using **GBP (Pounds)** - amounts in pence
- To use **NGN (Naira)** - amounts in kobo
- 1 pound = 100 pence
- 1 naira = 100 kobo

### Pricing Formula:
```
Weekly Price = People × Meals Per Week × £8.50
Amount in Pence = Weekly Price × 100
```

Example:
- 2 people × 3 meals = 6 meals
- 6 × £8.50 = £51.00
- £51.00 × 100 = 5100 pence

---

## 🚀 You're Done!

Once you complete these steps, users can:
1. Sign up with Google
2. Go through onboarding
3. Subscribe and pay with Paystack
4. Get weekly meal kits delivered!

**Total setup time: ~30 minutes** ⏱️

