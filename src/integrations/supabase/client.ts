// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nwvcgluihlqinvjgnebt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dmNnbHVpaGxxaW52amduZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODIxNjAsImV4cCI6MjA2NjA1ODE2MH0.vH6XRWHucfm1uBgHxhXfHFUmogsk5O696Tl0Eefse0I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);