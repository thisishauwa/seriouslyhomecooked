// Quick test to verify Supabase connection
// You can delete this file after confirming everything works

import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    // Test 1: Check if client is initialized
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return false;
    }
    console.log('✅ Supabase client initialized');

    // Test 2: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables');
      console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
      return false;
    }
    console.log('✅ Environment variables configured');

    // Test 3: Try to get auth session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('⚠️ Auth session check:', error.message);
    } else {
      console.log('✅ Auth working:', session ? 'User logged in' : 'No active session');
    }

    // Test 4: Try to query recipes (should work even without auth due to RLS policy)
    const { data, error: recipesError } = await supabase
      .from('recipes')
      .select('count')
      .limit(1);
    
    if (recipesError) {
      console.warn('⚠️ Database query:', recipesError.message);
      console.log('💡 This is normal if you haven\'t run the schema yet');
    } else {
      console.log('✅ Database connection working');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Supabase test failed:', error.message);
    return false;
  }
};

// Run test in development
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

