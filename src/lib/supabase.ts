
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Temporarily using direct values until Supabase integration is set up
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xwgcqfoiwtdcadanamcv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z2NxZm9pd3RkY2FkYW5hbWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDE0ODUsImV4cCI6MjA2MzMxNzQ4NX0.I_3QydAc5UizVOi9s7tj1rc_AXH8SEXNkqtH5jeTZxU";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
