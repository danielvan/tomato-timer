import { supabase } from '../config/supabase.js'

// Authentication state management
let currentUser = null
let authListeners = []

// Initialize auth state
export async function initAuth() {
    try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
            console.error('Error getting session:', error)
            return null
        }
        
        currentUser = session?.user || null
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email)
            currentUser = session?.user || null
            
            // Notify all listeners
            authListeners.forEach(callback => callback(currentUser, event))
        })
        
        return currentUser
    } catch (error) {
        console.error('Error initializing auth:', error)
        return null
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser
}

// Check if user is authenticated
export function isAuthenticated() {
    return currentUser !== null
}

// Add auth state listener
export function onAuthStateChange(callback) {
    authListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
        authListeners = authListeners.filter(cb => cb !== callback)
    }
}

// Sign up with email and password
export async function signUp(email, password, fullName = '') {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })
        
        if (error) {
            throw error
        }
        
        return { user: data.user, error: null }
    } catch (error) {
        console.error('Error signing up:', error)
        return { user: null, error: error.message }
    }
}

// Sign in with email and password
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        
        if (error) {
            throw error
        }
        
        return { user: data.user, error: null }
    } catch (error) {
        console.error('Error signing in:', error)
        return { user: null, error: error.message }
    }
}

// Sign out
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            throw error
        }
        
        return { error: null }
    } catch (error) {
        console.error('Error signing out:', error)
        return { error: error.message }
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        
        if (error) {
            throw error
        }
        
        return { error: null }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { error: error.message }
    }
}

// Update user profile
export async function updateProfile(updates) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        })
        
        if (error) {
            throw error
        }
        
        return { user: data.user, error: null }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { user: null, error: error.message }
    }
}