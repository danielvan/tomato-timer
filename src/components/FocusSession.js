// Focus Session Manager - Tracks Pomodoro sessions with task groups

class FocusSession {
    constructor() {
        this.currentSession = null
        this.completedSessions = []
        this.batchTasks = []
        this.init()
    }
    
    init() {
        // Listen for timer events
        this.bindTimerEvents()
    }
    
    bindTimerEvents() {
        // Override timer start to begin focus session
        const originalStartTimer = window.startTimer
        if (originalStartTimer) {
            window.startTimer = () => {
                originalStartTimer()
                this.startFocusSession()
            }
        }
        
        // Override timer stop to end focus session  
        const originalStopTimer = window.stopTimer
        if (originalStopTimer) {
            window.stopTimer = () => {
                this.endFocusSession()
                originalStopTimer()
            }
        }
    }
    
    startFocusSession() {
        if (this.currentSession) return // Already in session
        
        const activeGroup = window.taskGroupManager ? window.taskGroupManager.getActiveGroup() : null
        const sessionDuration = this.calculateSessionDuration()
        
        this.currentSession = {
            id: Date.now(),
            groupId: activeGroup ? activeGroup.id : null,
            groupName: activeGroup ? activeGroup.name : 'No Group',
            duration: sessionDuration,
            completedTasks: [],
            startTime: Date.now(),
            endTime: null
        }
        
        console.log('Started focus session:', this.currentSession)
        this.showSessionNotification(`Focus session started${activeGroup ? ' for ' + activeGroup.name : ''}!`)
    }
    
    endFocusSession(completed = false) {
        if (!this.currentSession) return
        
        this.currentSession.endTime = Date.now()
        this.currentSession.completed = completed
        this.currentSession.actualDuration = Math.round((this.currentSession.endTime - this.currentSession.startTime) / 1000 / 60)
        
        // Save to completed sessions
        this.completedSessions.push({...this.currentSession})
        
        // Save to Supabase if online
        if (window.syncManager && window.syncManager.getSyncStatus().isOnline) {
            this.saveFocusSession(this.currentSession)
        }
        
        if (completed) {
            this.showSessionNotification(`Focus session completed! You focused for ${this.currentSession.actualDuration} minutes.`)
            this.celebrateSession()
        } else {
            this.showSessionNotification('Focus session ended.')
        }
        
        console.log('Ended focus session:', this.currentSession)
        this.currentSession = null
    }
    
    calculateSessionDuration() {
        // Get duration from timer inputs
        const hours = parseInt(document.getElementById('hours').value) || 0
        const minutes = parseInt(document.getElementById('minutes').value) || 0
        const seconds = parseInt(document.getElementById('seconds').value) || 0
        
        return hours * 60 + minutes + Math.round(seconds / 60)
    }
    
    async saveFocusSession(session) {
        try {
            const sessionData = {
                group_id: session.groupId,
                duration_minutes: session.duration,
                completed_tasks: session.completedTasks,
                notes: null,
                started_at: new Date(session.startTime).toISOString(),
                completed_at: session.endTime ? new Date(session.endTime).toISOString() : null
            }
            
            // Use the tasks API to save focus session
            const { user, supabase } = this.getCurrentUserAndSupabase()
            
            const { error } = await supabase
                .from('focus_sessions')
                .insert([{
                    user_id: user.id,
                    ...sessionData
                }])
            
            if (error) {
                console.error('Error saving focus session:', error)
            } else {
                console.log('Focus session saved to Supabase')
            }
            
        } catch (error) {
            console.error('Error saving focus session:', error)
        }
    }
    
    getCurrentUserAndSupabase() {
        const user = window.authFunctions?.getCurrentUser()
        const supabase = window.getSupabase()
        
        if (!user) throw new Error('User not authenticated')
        if (!supabase) throw new Error('Supabase not initialized')
        
        return { user, supabase }
    }
    
    showSessionNotification(message) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'info')
        }
    }
    
    celebrateSession() {
        // Trigger confetti
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }
    
    // Track task completion during session
    onTaskCompleted(taskId) {
        if (this.currentSession) {
            this.currentSession.completedTasks.push(taskId)
        }
    }
    
    getCurrentSession() {
        return this.currentSession
    }
    
    getSessionHistory() {
        return this.completedSessions
    }
    
    // Batch task management
    setBatchTasks(tasks) {
        this.batchTasks = tasks || []
        console.log('Focus session batch tasks set:', this.batchTasks)
        
        // Update current task display if timer is running
        if (this.currentSession && window.updateCurrentTask) {
            window.updateCurrentTask()
        }
    }
    
    getBatchTasks() {
        return this.batchTasks
    }
    
    getNextBatchTask() {
        // Find the first incomplete task from the batch
        return this.batchTasks.find(task => 
            !this.currentSession?.completedTasks.includes(task.id) &&
            task.status !== 'done'
        ) || null
    }
    
    clearBatchTasks() {
        this.batchTasks = []
        console.log('Focus session batch tasks cleared')
    }
    
    // Override session creation for batch mode
    startFocusSessionWithBatch(batchTasks) {
        this.setBatchTasks(batchTasks)
        this.startFocusSession()
    }
}

// Create global focus session manager
window.focusSession = new FocusSession()

// Make FocusSession class available globally
window.FocusSession = FocusSession