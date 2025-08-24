// Supabase configuration using CDN version (for easier testing)
// This will be loaded via CDN script tag instead of ES6 imports

// These are your actual Supabase project details
const supabaseUrl = 'https://axyacztusojuyassimtx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eWFjenR1c29qdXlhc3NpbXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDM2MjUsImV4cCI6MjA3MTYxOTYyNX0.OvVdImDGZKMnqnv_nGB4ApIHYxbUDS0IpBrAZM1DOo8'

// Create Supabase client (will use global supabase from CDN)
let supabase = null

// Initialize Supabase client
function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)
        console.log('Supabase initialized successfully')
        return supabase
    } else {
        console.error('Supabase CDN not loaded')
        return null
    }
}

// Export functions for global access
window.initSupabase = initSupabase
window.getSupabase = () => supabase

// Database table names
window.SUPABASE_TABLES = {
    PROFILES: 'profiles',
    TASK_GROUPS: 'task_groups',
    TASKS: 'tasks',
    DIVIDERS: 'dividers',
    FOCUS_SESSIONS: 'focus_sessions'
}