# Seriously Homecooked - Setup Guide

Complete guide to setting up the application with Supabase and Google Sign-In.

## Prerequisites

- Node.js (v20.19.0 or higher)
- A Supabase account ([sign up here](https://app.supabase.com))
- A Google Cloud account ([sign up here](https://console.cloud.google.com))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Name: `seriously-homecooked`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"

### 2.2 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the schema

This will create:
- `profiles` table (user profiles)
- `recipes` table (meal recipes)
- `weekly_menus` table (curated weekly selections)
- `orders` table (user orders)
- `saved_recipes` table (user favorites)
- Row Level Security (RLS) policies
- Triggers and functions

### 2.3 Get Your Supabase Credentials

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

## Step 3: Set Up Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-production-domain.com` (if applicable)
   - Add **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `https://xxxxx.supabase.co/auth/v1/callback` (replace with your Supabase URL)
     - `https://your-production-domain.com` (if applicable)
   - Click "Create"
   - Copy your **Client ID** and **Client Secret**

### 3.2 Configure Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list
3. Toggle it to **Enabled**
4. Paste your **Client ID** and **Client Secret**
5. Click "Save"

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

## Step 5: Create Your First Admin User

After setting up authentication, you'll need to manually set your first admin user:

1. Sign up through the app using Google Sign-In
2. Go to your Supabase dashboard
3. Navigate to **Table Editor** > **profiles**
4. Find your user record
5. Set `is_admin` to `true`
6. Click "Save"

Now you can access the admin dashboard at `/admin`!

## Step 6: Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Seed Initial Data (Optional)

You can use the admin dashboard to:
1. Add recipes manually
2. Bulk upload recipes via CSV or Markdown
3. Set up weekly menus
4. Manage users

Or you can insert sample data directly in Supabase SQL Editor.

## Troubleshooting

### Google Sign-In Not Working

- **Check redirect URIs**: Make sure all redirect URIs are correctly configured in Google Cloud Console
- **Check Supabase configuration**: Verify Google OAuth is enabled and credentials are correct
- **Check browser console**: Look for any error messages

### Database Errors

- **RLS policies**: Make sure Row Level Security is properly configured
- **Admin access**: Ensure your user has `is_admin = true` in the profiles table

### Environment Variables Not Loading

- **File name**: Make sure the file is named `.env.local` (not `.env`)
- **Restart dev server**: Stop and restart `npm run dev` after changing env variables
- **Check Vite prefix**: All variables must start with `VITE_`

## Production Deployment

### Update Environment Variables

Make sure to set these in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`

### Update OAuth Redirect URIs

Add your production domain to:
1. Google Cloud Console authorized redirect URIs
2. Supabase Authentication settings

### Build the Application

```bash
npm run build
```

The built files will be in the `dist` directory.

## Security Notes

- Never commit `.env.local` to version control
- The `anon` key is safe to expose in client-side code (it's protected by RLS)
- Keep your database password and service role key secure
- Always use Row Level Security (RLS) policies for data access control

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

