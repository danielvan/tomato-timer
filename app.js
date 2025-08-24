import { initAuth, isAuthenticated, getCurrentUser, signOut, onAuthStateChange } from './src/auth/auth.js'
import AuthModal from './src/components/AuthModal.js'

class App {
    constructor() {
        this.authModal = null
        this.currentUser = null
        this.unsubscribeAuth = null
        this.init()
    }
    
    async init() {
        console.log('Initializing Optimitimer app...')
        
        // Initialize auth modal
        this.authModal = new AuthModal()
        
        // Initialize authentication
        await initAuth()
        
        // Set up auth state listener
        this.unsubscribeAuth = onAuthStateChange((user, event) => {
            this.handleAuthStateChange(user, event)
        })
        
        // Set up UI event listeners
        this.bindEvents()
        
        // Update UI based on initial auth state
        this.currentUser = getCurrentUser()
        this.updateUI()
        
        console.log('App initialized. User:', this.currentUser?.email || 'Not logged in')
    }
    
    bindEvents() {
        // Sign in button
        const signInBtn = document.getElementById('signInBtn')
        if (signInBtn) {
            signInBtn.addEventListener('click', () => {
                this.authModal.show()
            })
        }
        
        // Sign out button
        const signOutBtn = document.getElementById('signOutBtn')
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                await this.handleSignOut()
            })
        }
    }
    
    async handleAuthStateChange(user, event) {
        console.log('Auth state changed:', event, user?.email)
        this.currentUser = user
        this.updateUI()
        
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', user.email)
            // TODO: Load user's tasks from Supabase
            this.showWelcomeMessage(user)
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
            // TODO: Clear tasks and reset to localStorage mode
            this.clearUserData()
        }
    }
    
    updateUI() {
        const loggedInControls = document.getElementById('loggedInControls')
        const loggedOutControls = document.getElementById('loggedOutControls')
        const userAvatar = document.getElementById('userAvatar')
        const userName = document.getElementById('userName')
        const normalView = document.getElementById('normalView')
        
        if (this.currentUser) {
            // Show logged in state
            loggedInControls.classList.remove('hidden')
            loggedOutControls.classList.add('hidden')
            normalView.classList.remove('hidden')
            
            // Update user info
            const email = this.currentUser.email || ''
            const fullName = this.currentUser.user_metadata?.full_name || email
            const initials = this.getInitials(fullName)
            
            userAvatar.textContent = initials
            userName.textContent = fullName
            
        } else {
            // Show logged out state
            loggedInControls.classList.add('hidden')
            loggedOutControls.classList.remove('hidden')
            normalView.classList.add('hidden')
        }
    }
    
    getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2) || 'U'
    }
    
    showWelcomeMessage(user) {
        // Create a temporary welcome notification
        const notification = document.createElement('div')
        notification.className = 'auth-success'
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `
        notification.textContent = `Welcome back, ${user.user_metadata?.full_name || user.email}!`
        
        document.body.appendChild(notification)
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove()
            }
        }, 3000)
    }
    
    clearUserData() {
        // TODO: Clear current tasks and reset UI
        // This will be implemented when we add the task sync functionality
        console.log('Clearing user data...')
    }
    
    async handleSignOut() {
        try {
            const result = await signOut()
            if (result.error) {
                console.error('Error signing out:', result.error)
                alert('Error signing out. Please try again.')
            }
        } catch (error) {
            console.error('Unexpected error during sign out:', error)
            alert('An unexpected error occurred. Please try again.')
        }
    }
    
    // Cleanup function
    destroy() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth()
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App()
})

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy()
    }
})