// Sync Manager - Handles data synchronization with Supabase only (no localStorage)

class SyncManager {
    constructor() {
        this.isOnlineMode = false
        this.lastSyncTime = null
        this.syncListeners = []
    }
    
    // Check if user is authenticated and should use online mode
    shouldUseOnlineMode() {
        return window.authFunctions?.isAuthenticated() && window.getSupabase()
    }
    
    // Switch to online mode and load user data
    async switchToOnlineMode() {
        if (this.isOnlineMode) {
            return // Already online
        }
        
        console.log('Switching to ONLINE mode')
        
        if (!this.shouldUseOnlineMode()) {
            throw new Error('Cannot switch to online mode: user not authenticated')
        }
        
        try {
            // Load user's data from Supabase
            await this.loadDataFromSupabase()
            
            this.isOnlineMode = true
            this.notifyListeners('online')
            
        } catch (error) {
            console.error('Error switching to online mode:', error)
            this.isOnlineMode = false
            throw error
        }
    }
    
    // Switch to offline mode (clear all data)
    async switchToOfflineMode() {
        console.log('Switching to OFFLINE mode - clearing all data')
        
        this.isOnlineMode = false
        
        // Clear all tasks completely
        if (typeof window.tasks !== 'undefined') {
            window.tasks.length = 0
            
            // Re-render UI to show empty state
            if (typeof window.renderTasks === 'function') {
                window.renderTasks()
            }
        }
        
        this.lastSyncTime = null
        this.notifyListeners('offline')
    }
    
    // Load data from Supabase and update UI
    async loadDataFromSupabase() {
        try {
            const result = await window.tasksAPI.getAllUserData()
            
            if (result.error) {
                throw new Error('Failed to load data: ' + result.error)
            }
            
            // Convert Supabase format to legacy format for compatibility
            const combinedData = this.convertSupabaseToLegacyFormat(
                result.tasks, 
                result.dividers
            )
            
            // Update the global tasks array
            if (typeof window.tasks !== 'undefined') {
                window.tasks.length = 0 // Clear array
                window.tasks.push(...combinedData)
                
                // Re-render UI if function exists
                if (typeof window.renderTasks === 'function') {
                    window.renderTasks()
                }
            }
            
            this.lastSyncTime = Date.now()
            console.log('Loaded', result.tasks.length, 'tasks and', result.dividers.length, 'dividers from Supabase')
            
        } catch (error) {
            console.error('Error loading from Supabase:', error)
            throw error
        }
    }
    
    // Convert Supabase format to legacy format for compatibility
    convertSupabaseToLegacyFormat(tasks, dividers) {
        const combined = []
        
        // Convert tasks
        tasks.forEach(task => {
            combined.push({
                id: task.id, // Keep Supabase ID for syncing
                name: task.name,
                description: task.description || '',
                deadline: task.deadline || '',
                status: task.status,
                priority: task.priority,
                supabaseId: task.id // Store for syncing
            })
        })
        
        // Convert dividers
        dividers.forEach(divider => {
            combined.push({
                id: divider.id,
                type: 'divider',
                text: divider.text,
                supabaseId: divider.id // Store for syncing
            })
        })
        
        // Sort by order_index if available, then by created date
        combined.sort((a, b) => {
            const orderA = a.order_index || 0
            const orderB = b.order_index || 0
            if (orderA !== orderB) {
                return orderA - orderB
            }
            return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        })
        
        return combined
    }
    
    // Add new task to Supabase
    async createTask(taskData) {
        if (!this.isOnlineMode) {
            throw new Error('Cannot create task: not in online mode')
        }
        
        const result = await window.tasksAPI.createTask(taskData)
        
        if (result.error) {
            throw new Error('Failed to create task: ' + result.error)
        }
        
        // Reload data to update UI
        await this.loadDataFromSupabase()
        
        return result.data
    }
    
    // Update task in Supabase
    async updateTask(taskId, updates) {
        if (!this.isOnlineMode) {
            throw new Error('Cannot update task: not in online mode')
        }
        
        const result = await window.tasksAPI.updateTask(taskId, updates)
        
        if (result.error) {
            throw new Error('Failed to update task: ' + result.error)
        }
        
        // Reload data to update UI
        await this.loadDataFromSupabase()
        
        return result.data
    }
    
    // Delete task from Supabase
    async deleteTask(taskId) {
        if (!this.isOnlineMode) {
            throw new Error('Cannot delete task: not in online mode')
        }
        
        const result = await window.tasksAPI.deleteTask(taskId)
        
        if (result.error) {
            throw new Error('Failed to delete task: ' + result.error)
        }
        
        // Reload data to update UI
        await this.loadDataFromSupabase()
        
        return true
    }
    
    // Add sync listener
    onSyncStateChange(callback) {
        this.syncListeners.push(callback)
        
        // Return unsubscribe function
        return () => {
            this.syncListeners = this.syncListeners.filter(cb => cb !== callback)
        }
    }
    
    // Notify all sync listeners
    notifyListeners(mode) {
        this.syncListeners.forEach(callback => {
            try {
                callback(mode, this.isOnlineMode)
            } catch (error) {
                console.error('Error in sync listener:', error)
            }
        })
    }
    
    // Get current sync status
    getSyncStatus() {
        return {
            isOnline: this.isOnlineMode,
            lastSync: this.lastSyncTime,
            canCreateTasks: this.isOnlineMode
        }
    }
}

// Create global sync manager instance
window.syncManager = new SyncManager()

// Make SyncManager class available globally
window.SyncManager = SyncManager