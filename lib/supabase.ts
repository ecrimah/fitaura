import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * True when env vars still hold the post-sanitisation placeholder values
 * (no real Supabase project connected yet). Pages can use this to skip
 * remote calls and render the local placeholder UI without spamming the
 * console.
 */
const lowerUrl = supabaseUrl.toLowerCase();
const lowerKey = supabaseKey.toLowerCase();
export const isSupabaseConfigured =
    !lowerUrl.includes('your_project_ref') &&
    !lowerUrl.includes('your-project-ref') &&
    !lowerUrl.includes('your_supabase') &&
    !lowerKey.includes('your_supabase') &&
    !lowerKey.includes('your-supabase') &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey.length > 20;

export const supabase = createClient(supabaseUrl, supabaseKey);
