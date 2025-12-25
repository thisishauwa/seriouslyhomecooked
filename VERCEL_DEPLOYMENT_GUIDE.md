# Vercel Deployment Guide

## ✅ Issues Fixed

1. **Removed import map** from `index.html` that was conflicting with Vite's bundler
2. **Added `vercel.json`** with proper configuration for SPA routing
3. **Updated `.gitignore`** to exclude environment files
4. **Build tested successfully** - 527KB bundle size

---

## 🚀 Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)

Vercel should automatically detect the new push and redeploy. Wait 2-3 minutes and check your deployment.

### Option 2: Manual Redeploy

If it doesn't auto-deploy:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project
3. Click **"Redeploy"** or **"Deploy"**
4. Select the latest commit (731ecf5)

---

## ⚙️ Environment Variables in Vercel

**IMPORTANT:** You need to add your environment variables in Vercel:

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Click **Save**
5. **Redeploy** the project for changes to take effect

### Where to Find Your Supabase Keys:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 🔍 Troubleshooting

### If the site is still blank:

1. **Check Vercel build logs:**
   - Go to your deployment in Vercel
   - Click on the deployment
   - Check the **Build Logs** tab
   - Look for any errors

2. **Check browser console:**
   - Open your deployed site
   - Press F12 (Developer Tools)
   - Check the **Console** tab for errors
   - Common issues:
     - Missing environment variables
     - CORS errors (Supabase configuration)
     - 404 errors for assets

3. **Verify build output:**
   - The build should create a `dist` folder
   - Should contain `index.html` and `assets/` folder
   - Check Vercel's **Output** tab

4. **Check Supabase configuration:**
   - Make sure your Supabase project is active
   - Verify the URL and keys are correct
   - Check if RLS (Row Level Security) is properly configured

---

## 📋 Vercel Configuration

The `vercel.json` file includes:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ Proper build command
- ✅ Correct output directory
- ✅ SPA routing (all routes go to index.html)
- ✅ Vite framework detection

---

## 🎯 What Changed

### `index.html`
**Removed:**
```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.2.3",
    ...
  }
}
</script>
```

**Why:** Import maps conflict with Vite's bundling. Vite handles all imports during build.

### Added `vercel.json`
**Why:** Ensures proper SPA routing and build configuration for Vercel.

### Updated `.gitignore`
**Added:**
```
.env
.env.local
.env.production
```

**Why:** Prevents accidentally committing sensitive environment variables.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads (not blank)
- [ ] Navigation works (Home, Menu, etc.)
- [ ] Images load properly
- [ ] Can open auth modal
- [ ] Admin login works (admin@homecooked.com / admin123)
- [ ] No console errors in browser
- [ ] Supabase connection works (if configured)

---

## 🆘 Still Having Issues?

1. **Clear Vercel cache:**
   - In Vercel dashboard, go to Settings
   - Scroll to "Clear Cache"
   - Redeploy

2. **Check domain settings:**
   - Make sure your domain is properly configured
   - Try accessing via the `.vercel.app` URL first

3. **Verify package.json:**
   - Make sure all dependencies are listed
   - Run `npm install` locally to verify

4. **Test locally:**
   ```bash
   npm run build
   npm run preview
   ```
   - If it works locally but not on Vercel, it's likely an environment variable issue

---

## 📞 Need Help?

Check these resources:
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
- Supabase Docs: https://supabase.com/docs

---

**Your deployment should now work!** 🎉

If you're still seeing a blank page, the most common issue is **missing environment variables** in Vercel. Make sure to add your Supabase keys!

