// Sync Manager - Handles data synchronization between localStorage and Supabase

class SyncManager {
    constructor() {
        this.isOnlineMode = false
        this.pendingChanges = []
        this.lastSyncTime = null
        this.syncListeners = []
    }
    
    // Check if user is authenticated and should use online mode
    shouldUseOnlineMode() {
        return window.authFunctions?.isAuthenticated() && window.getSupabase()
    }
    
    // Switch to online mode only (no offline localStorage mode)
    async switchToOnlineMode() {
        if (this.isOnlineMode) {
            return // Already online
        }
        
        console.log('Switching to ONLINE mode')
        
        if (!this.shouldUseOnlineMode()) {
            throw new Error('Cannot switch to online mode: user not authenticated or Supabase not available')
        }
        
        await this.loadDataFromSupabase()
        this.isOnlineMode = true
        this.notifyListeners('online')
    }
    
    // Switch to online mode (migrate localStorage to Supabase)
    async switchToOnlineMode() {
        try {
            this.isOnlineMode = true
            
            // Get current localStorage data
            const localTasks = this.getLocalStorageTasks()
            
            if (localTasks && localTasks.length > 0) {
                console.log('Migrating', localTasks.length, 'tasks from localStorage to Supabase')
                
                // Check if user already has data in Supabase
                const supabaseData = await window.tasksAPI.getAllUserData()
                
                if (supabaseData.error) {
                    throw new Error('Failed to check existing Supabase data: ' + supabaseData.error)
                }
                
                // If user has no Supabase data, migrate localStorage
                if (supabaseData.tasks.length === 0 && supabaseData.dividers.length === 0) {
                    await this.migrateLocalStorageToSupabase(localTasks)
                } else {
                    // User has existing Supabase data, ask what to do
                    await this.handleDataConflict(localTasks, supabaseData)
                }
            }
            
            // Load data from Supabase
            await this.loadDataFromSupabase()
            
            this.notifyListeners('online')
        } catch (error) {
            console.error('Error switching to online mode:', error)
            this.isOnlineMode = false
            throw error
        }
    }
    
    // Switch to offline mode
    async switchToOfflineMode() {
        try {
            this.isOnlineMode = false
            
            // Load data from localStorage
            this.loadDataFromLocalStorage()
            
            this.notifyListeners('offline')
        } catch (error) {
            console.error('Error switching to offline mode:', error)
            throw error
        }
    }
    
    // Migrate localStorage tasks to Supabase
    async migrateLocalStorageToSupabase(localTasks) {
        try {
            // Create a default group for migrated tasks
            const defaultGroup = await window.tasksAPI.createTaskGroup({
                name: 'My Tasks',
                description: 'Tasks migrated from local storage',
                color: '#4CAF50',
                priority: 'medium',
                is_active: true
            })
            
            if (defaultGroup.error) {
                throw new Error('Failed to create default group: ' + defaultGroup.error)
            }
            
            // Convert and create tasks/dividers
            for (let i = 0; i < localTasks.length; i++) {
                const item = localTasks[i]
                
                if (item.type === 'divider') {
                    await window.tasksAPI.createDivider(item.text, i)
                } else {
                    await window.tasksAPI.createTask({
                        name: item.name,
                        group_id: defaultGroup.data.id,
                        status: item.status || 'not-started',
                        priority: 'medium',
                        deadline: item.deadline || null,
                        order_index: i
                    })
                }
            }
            
            console.log('Successfully migrated', localTasks.length, 'items to Supabase')
            
            // Clear localStorage after successful migration
            this.clearLocalStorage()
            
        } catch (error) {
            console.error('Error migrating to Supabase:', error)
            throw error
        }
    }
    
    // Handle data conflicts between localStorage and Supabase
    async handleDataConflict(localTasks, supabaseData) {
        const choice = confirm(
            `You have ${localTasks.length} tasks locally and ${supabaseData.tasks.length + supabaseData.dividers.length} items in your cloud account.\n\n` +
            'Click OK to merge local tasks with cloud data.\n' +
            'Click Cancel to discard local tasks and use only cloud data.'
        )
        
        if (choice) {
            // Merge: Add local tasks to Supabase
            await this.migrateLocalStorageToSupabase(localTasks)
        } else {
            // Use cloud data only: Clear localStorage
            this.clearLocalStorage()
        }
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
                result.dividers, 
                result.taskGroups
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
    
    // Load data from localStorage
    loadDataFromLocalStorage() {
        const localTasks = this.getLocalStorageTasks()
        
        if (typeof window.tasks !== 'undefined') {
            window.tasks.length = 0 // Clear array
            if (localTasks) {
                window.tasks.push(...localTasks)
            }
            
            // Re-render UI if function exists
            if (typeof window.renderTasks === 'function') {
                window.renderTasks()
            }
        }
        
        console.log('Loaded', localTasks?.length || 0, 'tasks from localStorage')
    }
    
    // Convert Supabase format to legacy format for compatibility
    convertSupabaseToLegacyFormat(tasks, dividers, taskGroups) {
        const combined = []
        
        // Convert tasks
        tasks.forEach(task => {
            combined.push({
                id: task.id, // Keep Supabase ID for syncing
                name: task.name,
                project: task.task_groups?.name || '',
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
        
        // Sort by order_index if available
        combined.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        
        return combined
    }
    
    // Get tasks from localStorage
    getLocalStorageTasks() {
        try {
            const savedTasks = localStorage.getItem('tasks')
            return savedTasks ? JSON.parse(savedTasks) : []
        } catch (error) {
            console.error('Error reading localStorage:', error)
            return []
        }
    }
    
    // Clear localStorage
    clearLocalStorage() {
        try {
            localStorage.removeItem('tasks')
            console.log('Cleared localStorage tasks')
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
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
            pendingChanges: this.pendingChanges.length
        }
    }
}

// Create global sync manager instance
window.syncManager = new SyncManager()

// Make SyncManager class available globally
window.SyncManager = SyncManager