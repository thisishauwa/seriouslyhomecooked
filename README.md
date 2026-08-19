<div align="center">

</div>

# Seriously Homecooked

A meal-kit subscription service with the admin tooling to run one for real.

**Live:** https://seriouslyhomecooked.vercel.app

## What it is

Subscribers pick a plan and get a curated menu every week. The admin dashboard runs the business behind it:

- **Recipe library** - full editor: ingredients with amounts, step-by-step instructions, prep time, calories, pricing, category and skill level
- **Bulk uploads** - import hundreds of recipes at once from CSV or Markdown
- **Weekly menus** - curate and publish each week's featured recipes
- **Subscribers** - every user, plan and status in one table; pause or cancel in one click
- **Overview** - recipes, active subscribers and menu stats at a glance

## Stack

React, TypeScript, Vite and Tailwind. Supabase for auth, database and storage, with Google sign-in. Paystack for payments. Gemini API for AI features. Deployed on Vercel.

## Run locally

Requires Node 20.19 or higher.

```bash
npm install
cp env.example .env.local   # add your Supabase and Google OAuth keys
npm run dev
```

Full setup, including the database schema and admin user creation, is in [SETUP.md](./SETUP.md).
