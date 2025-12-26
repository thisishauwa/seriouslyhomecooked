# Incomplete Features & TODO List

## 🔴 CRITICAL - Payment & Subscription

### 1. **Payment Integration** (HIGH PRIORITY)
- [ ] **Paystack Integration** ✅ Keys added!
  - [ ] Install Paystack SDK (`npm install react-paystack`)
  - [ ] Create subscription plans in Paystack dashboard
  - [ ] Add Paystack script to index.html
  - [ ] Create `lib/paystack.ts` client
  - [ ] Handle successful payment callback
  - [ ] Update `subscription_status` to 'active' after payment
  - [ ] Store Paystack subscription/customer codes
  
- [ ] **Onboarding Payment Step**
  - [ ] Replace alert with Paystack payment popup
  - [ ] Initialize Paystack with user email and plan
  - [ ] Handle payment success/failure callbacks
  - [ ] Update Supabase after successful payment
  - [ ] Redirect to menu after successful payment

- [ ] **Checkout Payment**
  - [ ] Add Paystack payment to Checkout component
  - [ ] Check subscription status before checkout
  - [ ] If inactive, show "Subscribe to continue" modal
  - [ ] Process one-time or subscription payment

**Files to modify:**
- `components/Onboarding.tsx` - Line 241 (replace alert with Paystack)
- `components/Checkout.tsx` - Add Paystack payment
- Create `lib/paystack.ts` - Paystack client setup
- Create `api/paystack-webhook.ts` - Webhook handler
- Add Paystack fields to `supabase-schema.sql`

**See `PAYSTACK_INTEGRATION_GUIDE.md` for complete implementation!**

---

### 2. **Subscription Management** (HIGH PRIORITY)
- [ ] **Profile Page Subscription Controls**
  - [ ] Show current subscription status
  - [ ] Add "Activate Subscription" button (if inactive)
  - [ ] Add "Pause Subscription" button (if active)
  - [ ] Add "Resume Subscription" button (if paused)
  - [ ] Add "Cancel Subscription" button (if active/paused)
  - [ ] Add "Update Payment Method" button

- [ ] **Subscription Status Logic**
  - [ ] Prevent checkout if status is 'inactive'
  - [ ] Show upgrade prompts for inactive users
  - [ ] Hide delivery dates for inactive users
  - [ ] Disable cart for inactive users (or show "Subscribe to order")

**Files to modify:**
- `components/Profile.tsx` - Add subscription controls
- `lib/supabase-service.ts` - Add subscription update functions
- `App.tsx` - Check status before checkout

---

## 🟡 MEDIUM PRIORITY - UI/UX Issues

### 3. **Conditional UI Based on Subscription Status**
- [x] Hero message (done - just committed)
- [ ] **Profile Page**
  - [ ] Hide "Next Delivery" if inactive
  - [ ] Hide "Order History" if no orders
  - [ ] Show "Activate Subscription" CTA if inactive
  - [ ] Show subscription status badge

- [ ] **Cart/Checkout**
  - [ ] Check subscription status before allowing checkout
  - [ ] Show "Subscribe first" modal if inactive
  - [ ] Disable "Complete Order" button if inactive

- [ ] **Menu Page**
  - [ ] Show "Subscribe to order" on meal cards if inactive
  - [ ] Add subscription prompt in cart drawer if inactive

**Files to modify:**
- `components/Profile.tsx` - Conditional rendering
- `components/CartDrawer.tsx` - Add subscription check
- `components/Checkout.tsx` - Add subscription gate
- `components/Menu.tsx` - Add subscription prompts

---

### 4. **Remove Hardcoded/Placeholder Data**
- [ ] **Profile Component**
  - [x] Order history (done - loads from Supabase)
  - [ ] Remove "Gold Member" hardcoded status
  - [ ] Calculate real member tier based on order count
  - [ ] Remove hardcoded "14 Deliveries" (done - uses real count)

- [ ] **Hero Component**
  - [x] User name (done - loads from Supabase)
  - [x] Delivery date (done - calculated dynamically)
  - [ ] Only show delivery info if subscription active

- [ ] **Journal Component**
  - [ ] Load journal entries from Supabase (currently uses JOURNAL_ENTRIES constant)
  - [ ] Remove hardcoded journal data

- [ ] **Producers Component**
  - [ ] Load producers from Supabase (currently uses PRODUCERS constant)
  - [ ] Remove hardcoded producer data

**Files to modify:**
- `components/Profile.tsx` - Remove "Gold Member", calculate tier
- `components/Journal.tsx` - Load from Supabase
- `App.tsx` - Pass producers from Supabase

---

## 🟢 LOW PRIORITY - Nice to Have

### 5. **Admin Dashboard Enhancements**
- [ ] **Subscription Management**
  - [ ] View all user subscriptions
  - [ ] Manually activate/deactivate subscriptions
  - [ ] View payment history
  - [ ] Issue refunds

- [ ] **Analytics**
  - [ ] Revenue tracking
  - [ ] Subscription churn rate
  - [ ] Most popular meals
  - [ ] User retention metrics

**Files to modify:**
- `components/Admin.tsx` - Add subscription tab
- `lib/supabase-service.ts` - Add admin subscription queries

---

### 6. **Email Notifications**
- [ ] **Transactional Emails**
  - [ ] Welcome email on signup
  - [ ] Order confirmation email
  - [ ] Delivery reminder (day before)
  - [ ] Payment receipt
  - [ ] Subscription paused/cancelled confirmation

- [ ] **Marketing Emails**
  - [ ] Weekly menu preview
  - [ ] New recipes announcement
  - [ ] Re-engagement for inactive users

**Implementation:**
- Use SendGrid, Resend, or Supabase Edge Functions
- Create email templates
- Set up triggers in Supabase

---

### 7. **Delivery Management**
- [ ] **Delivery Scheduling**
  - [ ] Allow users to choose delivery day
  - [ ] Skip a week functionality
  - [ ] Reschedule delivery
  - [ ] Delivery address management

- [ ] **Delivery Tracking**
  - [ ] Integration with courier API
  - [ ] Real-time tracking link
  - [ ] Delivery status updates

**Files to modify:**
- `components/Profile.tsx` - Add delivery management section
- Create `components/DeliveryManager.tsx`
- `supabase-schema.sql` - Add delivery_addresses table

---

### 8. **Recipe Improvements**
- [ ] **Recipe Details**
  - [ ] Add cooking videos
  - [ ] Add step-by-step photos
  - [ ] Add user ratings/reviews
  - [ ] Add cooking tips

- [ ] **Recipe Filtering**
  - [ ] Filter by dietary restrictions (already has allergies)
  - [ ] Filter by prep time
  - [ ] Filter by cuisine type
  - [ ] Search functionality

**Files to modify:**
- `components/MealDetail.tsx` - Add videos, photos
- `components/Menu.tsx` - Enhanced filtering
- `supabase-schema.sql` - Add reviews table

---

### 9. **User Account Features**
- [ ] **Profile Management**
  - [ ] Change password
  - [ ] Update email
  - [ ] Upload profile photo
  - [ ] Manage dietary preferences

- [ ] **Referral Program**
  - [ ] Generate referral code
  - [ ] Track referrals
  - [ ] Reward system

**Files to modify:**
- `components/Profile.tsx` - Add account settings
- Create `components/ReferralProgram.tsx`

---

### 10. **Mobile App**
- [ ] **React Native App**
  - [ ] iOS app
  - [ ] Android app
  - [ ] Push notifications
  - [ ] Offline mode

---

## 📊 Summary by Priority

### 🔴 MUST DO (Before Launch):
1. ✅ User authentication (done)
2. ✅ Database setup (done)
3. ✅ Recipe management (done)
4. ✅ Cart functionality (done)
5. ❌ **Payment integration (Stripe)** ⚠️
6. ❌ **Subscription status checks** ⚠️
7. ❌ **Remove all hardcoded data** ⚠️

### 🟡 SHOULD DO (Soon After Launch):
8. Email notifications
9. Subscription management UI
10. Delivery scheduling
11. Order history (partially done)

### 🟢 NICE TO HAVE (Future):
12. Recipe reviews
13. Referral program
14. Advanced analytics
15. Mobile app

---

## 🛠️ Quick Implementation Guide

### To Add Payment (Paystack):

1. **Install Paystack:**
```bash
npm install react-paystack
```

2. **Add env variables:** ✅ Already done!
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

3. **Add Paystack script to index.html:**
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

4. **Create Paystack client:**
```typescript
// lib/paystack.ts
import { usePaystackPayment } from 'react-paystack';

export const paystackConfig = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  currency: 'GBP', // or 'NGN'
};
```

5. **Use in Onboarding.tsx:**
```typescript
const config = {
  reference: new Date().getTime().toString(),
  email: user.email,
  amount: 5100, // £51.00 in pence
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
};

const initializePayment = usePaystackPayment(config);

<button onClick={() => initializePayment(onSuccess, onClose)}>
  Subscribe & Pay Now
</button>
```

6. **Handle webhook:**
```typescript
// api/paystack-webhook.ts
// Listen for 'subscription.create' event
// Update user's subscription_status to 'active'
```

**See `PAYSTACK_INTEGRATION_GUIDE.md` for full details!**

---

### To Fix Hardcoded Data:

1. **Profile "Gold Member":**
```typescript
// Calculate tier based on order count
const tier = orderHistory.length >= 20 ? 'Platinum' : 
             orderHistory.length >= 10 ? 'Gold' : 
             orderHistory.length >= 5 ? 'Silver' : 'Bronze';
```

2. **Hide UI for Inactive Users:**
```typescript
{subscriptionStatus === 'active' ? (
  <div>Show delivery info</div>
) : (
  <div>Show "Activate Subscription" CTA</div>
)}
```

3. **Load Journal from Supabase:**
```typescript
// Already have getJournalEntries() in supabase-service.ts
const [journalEntries, setJournalEntries] = useState([]);
useEffect(() => {
  getJournalEntries().then(setJournalEntries);
}, []);
```

---

## 📝 Estimated Time to Complete

- **Payment Integration**: 2-3 days
- **Subscription Status UI**: 1 day
- **Remove Hardcoded Data**: 1 day
- **Email Notifications**: 2-3 days
- **Delivery Management**: 3-5 days
- **Recipe Enhancements**: 5-7 days

**Total for MVP (Payment + Status + Clean Data):** ~5 days

---

## ✅ What's Already Done

- ✅ Google OAuth authentication
- ✅ Supabase database setup
- ✅ User profiles with preferences
- ✅ Recipe CRUD (admin dashboard)
- ✅ Cart functionality
- ✅ Saved recipes
- ✅ Order creation (structure in place)
- ✅ Real user name display
- ✅ Dynamic delivery dates
- ✅ Onboarding flow with payment step (UI only)
- ✅ Subscription status field in database
- ✅ Mobile responsive design
- ✅ Admin dashboard (recipes, users, orders, journal, plans)

---

## 🎯 Next Immediate Steps

1. **Fix conditional UI** (30 min) - Hide delivery info if inactive
2. **Add Stripe** (2-3 days) - Payment integration
3. **Remove hardcoded data** (1 day) - Gold Member, journal, producers
4. **Test subscription flow** (1 day) - End-to-end testing

**After these 4 steps, the app will be launch-ready!** 🚀

