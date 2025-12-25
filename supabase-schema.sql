-- ============================================================================
-- SERIOUSLY HOMECOOKED - COMPLETE SUPABASE SCHEMA
-- ============================================================================
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables, policies, functions, and seed data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (extends auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- User preferences
  people INTEGER DEFAULT 2 CHECK (people >= 1 AND people <= 10),
  recipes_per_week INTEGER DEFAULT 3 CHECK (recipes_per_week >= 1 AND recipes_per_week <= 7),
  skill_level TEXT DEFAULT 'All' CHECK (skill_level IN ('Easy', 'Medium', 'Advanced', 'All')),
  allergies TEXT[] DEFAULT '{}',
  preferences TEXT[] DEFAULT '{}',
  
  -- Admin flag
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. RECIPES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prep_time TEXT NOT NULL,
  servings INTEGER DEFAULT 2 CHECK (servings >= 1),
  calories INTEGER DEFAULT 0 CHECK (calories >= 0),
  price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
  image_url TEXT NOT NULL,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('Modern British', 'Mediterranean', 'Asian Fusion', 'Classic Comfort')),
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Easy', 'Medium', 'Advanced')),
  
  -- Detailed info (stored as JSONB for flexibility)
  ingredients JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{"name": "Ingredient", "amount": "100g", "imageUrl": "optional"}]
  
  steps JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{"title": "Step title", "description": "Instructions", "tip": "optional"}]
  
  nutrition JSONB DEFAULT '{}'::jsonb,
  -- Structure: {"carbs": "5g", "protein": "34g", "fats": "22g"}
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. WEEKLY MENUS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_of DATE NOT NULL UNIQUE,
  recipe_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  is_published BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Order details
  recipe_ids UUID[] NOT NULL,
  quantities JSONB NOT NULL, -- {"recipe_id": quantity}
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  delivery_date DATE,
  delivery_address JSONB, -- {"line1": "", "line2": "", "city": "", "postcode": "", "country": ""}
  
  -- Payment info (store minimal info, use Stripe for actual processing)
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id TEXT, -- Stripe payment intent ID
  
  -- Notes
  special_instructions TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. SAVED RECIPES (User Favorites)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can't save same recipe twice
  UNIQUE(user_id, recipe_id)
);

-- ----------------------------------------------------------------------------
-- 6. PRODUCERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  specialty TEXT NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. JOURNAL ENTRIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT, -- Full article content (optional, for future expansion)
  category TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT NOT NULL,
  
  -- SEO
  slug TEXT UNIQUE,
  
  -- Metadata
  is_published BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. CART TABLE (Persistent carts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  items JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{"id": "recipe_id", "quantity": 2, ...recipe_data}]
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_skill_level ON public.recipes(skill_level);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON public.recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_title_search ON public.recipes USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_recipes_description_search ON public.recipes USING gin(description gin_trgm_ops);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);

-- Saved recipes indexes
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON public.saved_recipes(recipe_id);

-- Weekly menus indexes
CREATE INDEX IF NOT EXISTS idx_weekly_menus_week_of ON public.weekly_menus(week_of DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_menus_is_published ON public.weekly_menus(is_published);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_is_published ON public.journal_entries(is_published);
CREATE INDEX IF NOT EXISTS idx_journal_entries_slug ON public.journal_entries(slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- RECIPES POLICIES (Public read, Admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view active recipes"
  ON public.recipes FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all recipes"
  ON public.recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update recipes"
  ON public.recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete recipes"
  ON public.recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- WEEKLY MENUS POLICIES (Public read, Admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view published weekly menus"
  ON public.weekly_menus FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admins can view all weekly menus"
  ON public.weekly_menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can manage weekly menus"
  ON public.weekly_menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- ORDERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- SAVED RECIPES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own saved recipes"
  ON public.saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON public.saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PRODUCERS POLICIES (Public read, Admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view active producers"
  ON public.producers FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage producers"
  ON public.producers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- JOURNAL ENTRIES POLICIES (Public read, Admin write)
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view published journal entries"
  ON public.journal_entries FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admins can manage journal entries"
  ON public.journal_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ----------------------------------------------------------------------------
-- CARTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function to handle new user creation
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Function to update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_recipes ON public.recipes;
CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_weekly_menus ON public.weekly_menus;
CREATE TRIGGER set_updated_at_weekly_menus
  BEFORE UPDATE ON public.weekly_menus
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_orders ON public.orders;
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_producers ON public.producers;
CREATE TRIGGER set_updated_at_producers
  BEFORE UPDATE ON public.producers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_journal_entries ON public.journal_entries;
CREATE TRIGGER set_updated_at_journal_entries
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_carts ON public.carts;
CREATE TRIGGER set_updated_at_carts
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Seed Recipes
-- ----------------------------------------------------------------------------
INSERT INTO public.recipes (id, title, description, prep_time, servings, calories, price, image_url, category, skill_level, ingredients, steps, nutrition) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Pan-Roasted Seabass', 'A sophisticated coastal classic. This modern twist on pan-roasted seabass combines crispy skin with a vibrant lemon-butter caper sauce.', '25 mins', 2, 420, 18.50, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 'Modern British', 'Medium',
'[{"name":"Seabass Fillets","amount":"2 fillets"},{"name":"Capers","amount":"2 Tbsp"},{"name":"Unsalted Butter","amount":"50g"}]'::jsonb,
'[{"title":"Score the skin","description":"Lightly score the skin to prevent curling."},{"title":"Sear","description":"Fry skin-side down until golden and crispy."}]'::jsonb,
'{"carbs":"5g","protein":"34g","fats":"22g"}'::jsonb),

('00000000-0000-0000-0000-000000000002'::uuid, 'Wild Mushroom Risotto', 'Earthy, comforting Italian masterpiece. Arborio rice infused with deep umami of wild mushrooms and finished with truffle oil.', '35 mins', 2, 580, 16.00, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80', 'Mediterranean', 'Medium',
'[{"name":"Arborio Rice","amount":"200g"},{"name":"Porcini","amount":"50g"}]'::jsonb,
'[]'::jsonb,
'{}'::jsonb),

('00000000-0000-0000-0000-000000000003'::uuid, 'Highland Venison Loin', 'Lean, ruby-red venison paired with a blackberry reduction and buttery parsnip purée. The ultimate forest-to-table ritual.', '40 mins', 2, 490, 24.50, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80', 'Modern British', 'Advanced',
'[{"name":"Venison Loin","amount":"300g"},{"name":"Blackberries","amount":"100g"}]'::jsonb,
'[]'::jsonb,
'{}'::jsonb),

('00000000-0000-0000-0000-000000000004'::uuid, 'Miso Glazed Aubergine', 'Rich, sweet, and salty miso glaze perfectly complements creamy charred aubergine. Inspired by Kyoto street food.', '20 mins', 2, 390, 14.50, 'https://images.unsplash.com/photo-1563245332-692749827433?auto=format&fit=crop&w=800&q=80', 'Asian Fusion', 'Easy',
'[{"name":"Aubergine","amount":"1 large"}]'::jsonb,
'[]'::jsonb,
'{}'::jsonb),

('00000000-0000-0000-0000-000000000005'::uuid, 'Cornish Crab Linguine', 'Freshly picked white crab meat tossed with chili, parsley, and hand-pressed lemon oil. Light yet luxurious.', '15 mins', 2, 510, 19.50, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', 'Mediterranean', 'Easy',
'[{"name":"Crab Meat","amount":"150g"},{"name":"Linguine","amount":"200g"}]'::jsonb,
'[]'::jsonb,
'{}'::jsonb),

('00000000-0000-0000-0000-000000000006'::uuid, 'Heritage Duck Confit', 'Slow-cooked duck leg with crispy skin, served alongside braised red cabbage and a rich port reduction.', '30 mins', 2, 720, 21.00, 'https://images.unsplash.com/photo-1514516317522-f73b604cef7a?auto=format&fit=crop&w=800&q=80', 'Classic Comfort', 'Medium',
'[{"name":"Duck Leg","amount":"2 legs"},{"name":"Port","amount":"50ml"}]'::jsonb,
'[]'::jsonb,
'{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Producers
-- ----------------------------------------------------------------------------
INSERT INTO public.producers (id, name, location, specialty, story, image_url) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, 'Wiltshire Farms', 'Wiltshire, UK', 'Line-caught Fish & Organic Greens', 'Founded in 1924, the Wiltshire family has pioneered sustainable aquaculture. Every seabass is caught using traditional lines to ensure minimal impact on the local ecosystem and maximum freshness for your table.', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'),
('10000000-0000-0000-0000-000000000002'::uuid, 'Blackwood Estate', 'Scottish Highlands', 'Heritage Grass-Fed Beef', 'Blackwood Estate is home to one of the last remaining pure-bred heritage herds in the Highlands. Their slow-growth philosophy and mineral-rich pastures produce beef with unparalleled depth of flavor.', 'https://images.unsplash.com/photo-1512485800193-b2db55f52983?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Journal Entries
-- ----------------------------------------------------------------------------
INSERT INTO public.journal_entries (id, title, excerpt, category, date, image_url, slug) VALUES
('20000000-0000-0000-0000-000000000001'::uuid, 'The Art of the Slow Roast', 'Why patience is the most important ingredient in your kitchen this autumn.', 'Technique', '2024-10-12', 'https://images.unsplash.com/photo-1544333303-5670256da877?auto=format&fit=crop&w=600&q=80', 'art-of-slow-roast'),
('20000000-0000-0000-0000-000000000002'::uuid, 'Autumn Harvest Guide', 'Selecting the perfect root vegetables for your Sunday gatherings.', 'Seasonal', '2024-10-05', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80', 'autumn-harvest-guide'),
('20000000-0000-0000-0000-000000000003'::uuid, 'The Science of Searing', 'Mastering the Maillard reaction for restaurant-quality crusts at home.', 'Science', '2024-09-28', 'https://images.unsplash.com/photo-1551133988-ad26c02243e2?auto=format&fit=crop&w=600&q=80', 'science-of-searing')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Weekly Menus
-- ----------------------------------------------------------------------------
INSERT INTO public.weekly_menus (week_of, recipe_ids) VALUES
('2024-12-30', ARRAY['00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000003'::uuid]),
('2025-01-06', ARRAY['00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000006'::uuid])
ON CONFLICT (week_of) DO NOTHING;

-- ============================================================================
-- HELPER VIEWS (Optional but useful)
-- ============================================================================

-- View for recipes with full details
CREATE OR REPLACE VIEW public.recipes_with_stats AS
SELECT 
  r.*,
  COUNT(DISTINCT sr.user_id) as saves_count,
  COUNT(DISTINCT o.id) as orders_count
FROM public.recipes r
LEFT JOIN public.saved_recipes sr ON r.id = sr.recipe_id
LEFT JOIN public.orders o ON r.id = ANY(o.recipe_ids)
GROUP BY r.id;

-- View for user order history
CREATE OR REPLACE VIEW public.user_order_history AS
SELECT 
  o.*,
  p.full_name,
  p.email,
  jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'title', r.title,
      'price', r.price,
      'image_url', r.image_url
    )
  ) as recipes
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.recipes r ON r.id = ANY(o.recipe_ids)
GROUP BY o.id, p.full_name, p.email;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema created successfully!';
  RAISE NOTICE '📊 Tables: profiles, recipes, weekly_menus, orders, saved_recipes, producers, journal_entries, carts';
  RAISE NOTICE '🔒 RLS policies enabled on all tables';
  RAISE NOTICE '🌱 Seed data inserted: 6 recipes, 2 producers, 3 journal entries, 2 weekly menus';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Sign up through your app';
  RAISE NOTICE '2. Go to Table Editor > profiles';
  RAISE NOTICE '3. Set is_admin = true for your user';
  RAISE NOTICE '4. Access the admin dashboard!';
END $$;
