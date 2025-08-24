// Supabase configuration
import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase project details
// For development, you can use environment variables or hard-code them temporarily
const supabaseUrl = 'https://axyacztusojuyassimtx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eWFjenR1c29qdXlhc3NpbXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDM2MjUsImV4cCI6MjA3MTYxOTYyNX0.OvVdImDGZKMnqnv_nGB4ApIHYxbUDS0IpBrAZM1DOo8'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  TASK_GROUPS: 'task_groups',
  TASKS: 'tasks',
  DIVIDERS: 'dividers',
  FOCUS_SESSIONS: 'focus_sessions'
}

// Helper function to get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function to get current session
export const getCurrentSession = () => {
  return supabase.auth.getSession()
}