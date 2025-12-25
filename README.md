<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Seriously Homecooked

A sophisticated meal kit subscription service with an elegant admin dashboard.

## Features

- 🍳 **Recipe Management**: Add, edit, and organize hundreds of recipes
- 📅 **Weekly Menu Curation**: Set featured recipes for each week
- 👥 **User Management**: Handle subscriptions and user accounts
- 🔍 **Advanced Filtering**: Search and filter recipes by category, skill level
- 📦 **Bulk Operations**: Upload recipes via CSV/Markdown, bulk delete
- 🎨 **Beautiful Design**: Minimal, elegant UI with brand consistency
- 🔐 **Google Sign-In**: Secure authentication with Supabase
- 📱 **Responsive**: Works perfectly on all devices

## Quick Start

**Prerequisites:**  Node.js (v20.19.0 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase and Google OAuth credentials
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

📖 **For detailed setup instructions**, see [SETUP.md](./SETUP.md)

This includes:
- Complete Supabase configuration
- Google OAuth setup
- Database schema setup
- Admin user creation
- Troubleshooting guide

## Admin Dashboard

To access the admin dashboard:
1. Click "Sign In" or "Get Started" in the navigation bar
2. Use the admin credentials:
   - **Email:** `admin@homecooked.com`
   - **Password:** `admin123`
3. You'll be automatically redirected to the admin dashboard

### Admin Features:

#### 📊 Overview Dashboard
- Real-time statistics (total recipes, active users, weekly menus)
- Recent activity feed
- Quick action buttons for common tasks
- Growth metrics and insights

#### 🍳 Recipe Management
- **Add/Edit Recipes**: Full recipe editor with:
  - Basic info (title, description, prep time, servings, calories, price)
  - Image URLs
  - Category and skill level
  - **Ingredients list** with amounts
  - **Step-by-step cooking instructions** with optional tips
- **Bulk Upload**: Import multiple recipes at once via:
  - **CSV Upload**: Use `sample-recipes.csv` as a template
  - **Markdown Upload**: Use `sample-recipes.md` as a template
- Delete recipes with confirmation
- Beautiful card-based recipe display

#### 📅 Weekly Menu Selection
- Set featured recipes for each week
- Visual recipe selection with checkboxes
- Expandable week cards
- Add new weeks with one click

#### 👥 User Management
- View all users in a clean table
- See user details: name, email, plan, status
- Update user status (Active/Paused/Cancelled)
- Color-coded status badges

### Design Highlights:
- Modern gradient-based UI with smooth animations
- Responsive layout that works on all screen sizes
- Intuitive navigation with emoji icons
- Beautiful modal dialogs for editing
- Hover effects and transitions throughout

All admin data is stored in localStorage for this demo.
