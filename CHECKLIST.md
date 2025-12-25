# Setup Checklist

Use this checklist to ensure everything is properly configured.

## ✅ Environment Variables

- [x] Created `.env.local` file
- [x] Added `VITE_SUPABASE_URL`
- [x] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Added `VITE_GOOGLE_CLIENT_ID` (optional, for Google Sign-In)

## 📊 Supabase Setup

- [ ] Created Supabase project
- [ ] Ran `supabase-schema.sql` in SQL Editor
- [ ] Verified tables were created:
  - [ ] profiles
  - [ ] recipes
  - [ ] weekly_menus
  - [ ] orders
  - [ ] saved_recipes

## 🔐 Google OAuth Setup (Optional)

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials
- [ ] Added redirect URIs to Google Console
- [ ] Configured Google provider in Supabase
- [ ] Added Client ID to `.env.local`

## 👤 Admin User Setup

- [ ] Signed up through the app
- [ ] Set `is_admin = true` in Supabase profiles table
- [ ] Can access `/admin` route

## 🧪 Testing

Open your browser console and check for:

- ✅ `Supabase client initialized`
- ✅ `Environment variables configured`
- ✅ `Auth working: No active session` (or "User logged in" if signed in)
- ⚠️ `Database query:` (This is normal until you run the schema)

## 🚀 Ready to Go!

Once all items are checked, you're ready to:
1. Sign in with Google (or create regular account)
2. Access the admin dashboard
3. Add recipes and manage your meal kit service

## 📝 Next Steps

1. **Run the database schema**:
   - Go to Supabase Dashboard > SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Run the query
   - Refresh your app

2. **Create admin user**:
   - Sign up through the app
   - Go to Supabase > Table Editor > profiles
   - Find your user and set `is_admin = true`

3. **Test Google Sign-In** (if configured):
   - Click "Continue with Google"
   - Should redirect to Google
   - Should redirect back and sign you in

4. **Test Admin Dashboard**:
   - Navigate to `/admin` or sign in with admin credentials
   - Try adding a recipe
   - Try bulk upload with sample files

## 🐛 Troubleshooting

### Environment Variables Not Loading
- Make sure file is named `.env.local` (not `.env`)
- Restart dev server: Stop and run `npm run dev` again
- Check browser console for Supabase test results

### Google Sign-In Not Working
- Verify redirect URIs in Google Console
- Check Supabase Google provider is enabled
- Look for errors in browser console

### Database Errors
- Make sure you ran `supabase-schema.sql`
- Check RLS policies are enabled
- Verify your user has proper permissions

### Can't Access Admin
- Make sure `is_admin = true` in profiles table
- Try signing out and back in
- Check browser console for errors

