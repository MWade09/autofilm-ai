import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for regular operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Client with service role (bypasses RLS) - use for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
