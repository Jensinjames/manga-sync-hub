// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fnynfcxhnnqambqunsrv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueW5mY3hobm5xYW1icXVuc3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODk0NDUsImV4cCI6MjA1ODk2NTQ0NX0.2kNvTvgvYKkIIfMOMS3NykUwsHMdVX9zyFGVCRPiDsc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);