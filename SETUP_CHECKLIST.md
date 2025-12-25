# Setup Checklist - Get Real Data Working

## ✅ What's Already Done
- ✅ Code updated to pull from Supabase
- ✅ MENU_ITEMS error fixed
- ✅ Profile saves to database
- ✅ Dynamic dates calculated
- ✅ User ID properly passed around

---

## 🔧 What You Need to Do

### 1. Update Your Supabase Database Schema

**Option A: Fresh Start (Recommended)**
If you haven't added real data yet, just re-run the entire schema:
```bash
# In Supabase SQL Editor:
# 1. Go to SQL Editor
# 2. Paste contents of supabase-schema.sql
# 3. Click "Run"
```

**Option B: Existing Database**
If you already have data, run the migration:
```bash
# In Supabase SQL Editor:
# 1. Go to SQL Editor
# 2. Paste contents of supabase-migration-add-subscription-fields.sql
# 3. Click "Run"
```

This adds these fields to your `profiles` table:
- `subscription_status` (active/paused/cancelled)
- `next_delivery_date` (optional date)
- `delivery_day` (Monday-Sunday, defaults to Thursday)

---

### 2. Test the Integration

1. **Sign in with Google**
   - Your real name should appear: "Welcome back, [Your Name]"
   
2. **Check the Profile page**
   - Should show your real member since date
   - Should show "0 Deliveries" (until you place an order)
   - Next delivery should be calculated (next Thursday)

3. **Update your preferences**
   - Change people count or meals per week
   - Open browser console (F12)
   - Should see: "Profile updated successfully in Supabase"
   - Refresh page - changes should persist

4. **Add items to cart**
   - Add a meal to cart
   - Refresh the page
   - Cart should still have the item (saved to Supabase)

---

### 3. Verify in Supabase Dashboard

1. Go to **Table Editor** → **profiles**
   - You should see your profile row
   - `full_name` should have your Google name
   - `created_at` should have today's date
   - `subscription_status` should be 'active'

2. Go to **Table Editor** → **carts**
   - Should see your cart items if you added any

3. Go to **Table Editor** → **saved_recipes**
   - Should see saved recipes if you favorited any

4. Go to **Table Editor** → **orders**
   - Will be empty until you complete checkout

---

## 🐛 Troubleshooting

### "Welcome back, User" (not your name)
**Problem**: Profile doesn't have your name
**Fix**: 
```sql
-- In Supabase SQL Editor:
UPDATE profiles 
SET full_name = 'Your Actual Name' 
WHERE id = 'your-user-id';
```

### "0 Deliveries" showing when you have orders
**Problem**: Orders not in database
**Fix**: Complete a checkout in the app, or manually insert test data:
```sql
INSERT INTO orders (user_id, total, status, meals)
VALUES (
  'your-user-id',
  45.50,
  'delivered',
  ARRAY['Pan-Roasted Seabass', 'Thai Green Curry']
);
```

### "Member Since: [Today's Date]" but you signed up earlier
**Problem**: Profile was created today
**Fix**: This is correct! The `created_at` field shows when you first signed in. If you want to change it:
```sql
UPDATE profiles 
SET created_at = '2024-01-01 00:00:00+00' 
WHERE id = 'your-user-id';
```

### Still seeing "Thursday, Oct 24" (static date)
**Problem**: Code not deployed or browser cache
**Fix**: 
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check Vercel deployment is latest
3. Clear browser cache

---

## 📝 Quick Test Script

Run this in your browser console (F12) after signing in:

```javascript
// Check if user data is loaded
console.log('User ID:', localStorage.getItem('supabase.auth.token'));
console.log('Profile:', JSON.parse(localStorage.getItem('sh_profile') || '{}'));
console.log('Cart:', JSON.parse(localStorage.getItem('sh_cart') || '[]'));

// Check Supabase connection
fetch('https://your-project.supabase.co/rest/v1/profiles?select=*', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(r => r.json())
.then(d => console.log('Profiles in DB:', d));
```

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ Your real name appears in the hero
- ✅ Profile page shows your actual data
- ✅ Dates are dynamic (not "Oct 24")
- ✅ Delivery count matches your orders
- ✅ Changes persist after refresh
- ✅ No "MENU_ITEMS is not defined" error
- ✅ Console shows "Profile updated successfully"

---

## 🎉 All Done!

Once you see your real data, everything is working! The app is now fully connected to Supabase and pulling 100% real user data.

