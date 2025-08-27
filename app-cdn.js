// Main app controller using CDN versions

class App {
    constructor() {
        this.authModal = null
        this.currentUser = null
        this.unsubscribeAuth = null
        this.supabase = null
        this.init()
    }
    
    async init() {
        console.log('Initializing Optimitimer app...')
        
        // Wait for Supabase to be available
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase CDN not loaded')
            return
        }
        
        // Initialize Supabase
        this.supabase = window.initSupabase()
        if (!this.supabase) {
            console.error('Failed to initialize Supabase')
            return
        }
        
        // Initialize auth modal
        this.authModal = new window.AuthModal()
        
        // Initialize authentication
        await window.authFunctions.initAuth()
        
        // Set up auth state listener
        this.unsubscribeAuth = window.authFunctions.onAuthStateChange((user, event) => {
            this.handleAuthStateChange(user, event)
        })
        
        // Set up UI event listeners
        this.bindEvents()
        
        // Update UI based on initial auth state
        this.currentUser = window.authFunctions.getCurrentUser()
        this.updateUI()
        
        // If user is already authenticated on page load, switch to online mode
        if (this.currentUser) {
            try {
                await window.syncManager.switchToOnlineMode()
                this.showSyncMessage('Connected to cloud. Tasks loaded!')
            } catch (error) {
                console.error('Error switching to online mode on page load:', error)
                this.showErrorMessage('Failed to load tasks: ' + error.message)
            }
        }
        
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
        
        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn')
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.authModal.show('changePassword')
            })
        }
    }
    
    async handleAuthStateChange(user, event) {
        console.log('Auth state changed:', event, user?.email)
        this.currentUser = user
        this.updateUI()
        
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', user.email)
            this.showWelcomeMessage(user)
            
            // Switch to online mode and sync data
            try {
                await window.syncManager.switchToOnlineMode()
                this.showSyncMessage('Connected to cloud. Tasks loaded!')
            } catch (error) {
                console.error('Error switching to online mode:', error)
                this.showErrorMessage('Failed to load tasks: ' + error.message)
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
            await window.syncManager.switchToOfflineMode()
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
            // Show logged out state - hide everything
            loggedInControls.classList.add('hidden')
            loggedOutControls.classList.remove('hidden')
            normalView.classList.add('hidden') // Hide task interface when logged out
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
        // Clear all tasks when user signs out
        if (typeof window.tasks !== 'undefined') {
            window.tasks.length = 0 // Clear array completely
            
            // Re-render UI to show empty state
            if (typeof window.renderTasks === 'function') {
                window.renderTasks()
            }
        }
        
        console.log('Cleared all user data')
    }
    
    showSyncMessage(message) {
        this.showNotification(message, 'success')
    }
    
    showErrorMessage(message) {
        this.showNotification(message, 'error')
    }
    
    showNotification(message, type = 'info') {
        // Create a notification element
        const notification = document.createElement('div')
        notification.className = `sync-notification ${type}`
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 3000;
            max-width: 350px;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `
        
        if (type === 'success') {
            notification.style.backgroundColor = '#e8f5e8'
            notification.style.color = '#2e7d32'
            notification.style.borderLeft = '4px solid #4caf50'
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ffebee'
            notification.style.color = '#c62828'
            notification.style.borderLeft = '4px solid #f44336'
        } else {
            notification.style.backgroundColor = '#e3f2fd'
            notification.style.color = '#1565c0'
            notification.style.borderLeft = '4px solid #2196f3'
        }
        
        notification.textContent = message
        
        document.body.appendChild(notification)
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove()
            }
        }, 4000)
    }
    
    async handleSignOut() {
        try {
            const result = await window.authFunctions.signOut()
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