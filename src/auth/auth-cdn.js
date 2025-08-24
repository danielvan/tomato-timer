// Authentication system using Supabase CDN version

// Authentication state management
let currentUser = null
let authListeners = []
let authSupabase = null

// Initialize auth state
async function initAuth() {
    try {
        authSupabase = window.getSupabase()
        if (!authSupabase) {
            console.error('Supabase not initialized')
            return null
        }

        // Get current session
        const { data: { session }, error } = await authSupabase.auth.getSession()
        
        if (error) {
            console.error('Error getting session:', error)
            return null
        }
        
        currentUser = session?.user || null
        
        // Listen for auth changes
        authSupabase.auth.onAuthStateChange((event, session) => {
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
function getCurrentUser() {
    return currentUser
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null
}

// Add auth state listener
function onAuthStateChange(callback) {
    authListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
        authListeners = authListeners.filter(cb => cb !== callback)
    }
}

// Sign up with email and password
async function signUp(email, password, fullName = '') {
    try {
        if (!authSupabase) {
            throw new Error('Supabase not initialized')
        }

        const { data, error } = await authSupabase.auth.signUp({
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
async function signIn(email, password) {
    try {
        if (!authSupabase) {
            throw new Error('Supabase not initialized')
        }

        const { data, error } = await authSupabase.auth.signInWithPassword({
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
async function signOut() {
    try {
        if (!authSupabase) {
            throw new Error('Supabase not initialized')
        }

        const { error } = await authSupabase.auth.signOut()
        
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
async function resetPassword(email) {
    try {
        if (!authSupabase) {
            throw new Error('Supabase not initialized')
        }

        const { error } = await authSupabase.auth.resetPasswordForEmail(email)
        
        if (error) {
            throw error
        }
        
        return { error: null }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { error: error.message }
    }
}

// Change password for logged-in user
async function changePassword(newPassword) {
    try {
        if (!authSupabase) {
            throw new Error('Supabase not initialized')
        }

        const { data, error } = await authSupabase.auth.updateUser({
            password: newPassword
        })
        
        if (error) {
            throw error
        }
        
        return { user: data.user, error: null }
    } catch (error) {
        console.error('Error changing password:', error)
        return { user: null, error: error.message }
    }
}

// Make functions globally available
window.authFunctions = {
    initAuth,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChange,
    signUp,
    signIn,
    signOut,
    resetPassword,
    changePassword
}