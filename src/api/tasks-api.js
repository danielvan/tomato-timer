// Tasks API using Supabase CDN version

// Get current user and Supabase instance
function getCurrentUserAndSupabase() {
    const user = window.authFunctions?.getCurrentUser()
    const supabase = window.getSupabase()
    
    if (!user) {
        throw new Error('User not authenticated')
    }
    
    if (!supabase) {
        throw new Error('Supabase not initialized')
    }
    
    return { user, supabase }
}


// ===============================
// TASKS API
// ===============================

// Get all tasks for current user
async function getTasks(filters = {}) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        let query = supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
        
        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status)
        }
        
        if (filters.priority) {
            query = query.eq('priority', filters.priority)
        }
        
        // Order by index, then by created date
        query = query.order('order_index', { ascending: true })
                     .order('created_at', { ascending: true })
        
        const { data, error } = await query
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return { data: null, error: error.message }
    }
}

// Create new task
async function createTask(taskData) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const newTask = {
            user_id: user.id,
            name: taskData.name,
            description: taskData.description || null,
            project: taskData.project || null,
            status: taskData.status || 'not-started',
            priority: taskData.priority || 'medium',
            deadline: taskData.deadline || null,
            order_index: taskData.order_index || 0
        }
        
        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select('*')
            .single()
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error creating task:', error)
        return { data: null, error: error.message }
    }
}

// Update task
async function updateTask(taskId, updates) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .eq('user_id', user.id) // Security check
            .select('*')
            .single()
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error updating task:', error)
        return { data: null, error: error.message }
    }
}

// Delete task
async function deleteTask(taskId) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .eq('user_id', user.id) // Security check
        
        if (error) throw error
        
        return { error: null }
    } catch (error) {
        console.error('Error deleting task:', error)
        return { error: error.message }
    }
}

// Update multiple task orders (for drag and drop)
async function updateTasksOrder(taskUpdates) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        // Prepare updates with security checks
        const updates = taskUpdates.map(update => ({
            id: update.id,
            user_id: user.id, // Ensure security
            order_index: update.order_index
        }))
        
        const { data, error } = await supabase
            .from('tasks')
            .upsert(updates, { 
                onConflict: 'id',
                ignoreDuplicates: false 
            })
            .select()
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error updating task orders:', error)
        return { data: null, error: error.message }
    }
}

// ===============================
// DIVIDERS API
// ===============================

// Get all dividers for current user
async function getDividers() {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const { data, error } = await supabase
            .from('dividers')
            .select('*')
            .eq('user_id', user.id)
            .order('order_index', { ascending: true })
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching dividers:', error)
        return { data: null, error: error.message }
    }
}

// Create new divider
async function createDivider(text, orderIndex = 0) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const newDivider = {
            user_id: user.id,
            text: text,
            order_index: orderIndex
        }
        
        const { data, error } = await supabase
            .from('dividers')
            .insert([newDivider])
            .select()
            .single()
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error creating divider:', error)
        return { data: null, error: error.message }
    }
}

// Update divider
async function updateDivider(dividerId, updates) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const { data, error } = await supabase
            .from('dividers')
            .update(updates)
            .eq('id', dividerId)
            .eq('user_id', user.id) // Security check
            .select()
            .single()
        
        if (error) throw error
        
        return { data, error: null }
    } catch (error) {
        console.error('Error updating divider:', error)
        return { data: null, error: error.message }
    }
}

// Delete divider
async function deleteDivider(dividerId) {
    try {
        const { user, supabase } = getCurrentUserAndSupabase()
        
        const { error } = await supabase
            .from('dividers')
            .delete()
            .eq('id', dividerId)
            .eq('user_id', user.id) // Security check
        
        if (error) throw error
        
        return { error: null }
    } catch (error) {
        console.error('Error deleting divider:', error)
        return { error: error.message }
    }
}

// ===============================
// BULK OPERATIONS
// ===============================

// Get all user data (tasks, groups, dividers)
async function getAllUserData() {
    try {
        const [tasksResult, dividersResult] = await Promise.all([
            getTasks(),
            getDividers()
        ])
        
        // Check for any errors
        if (tasksResult.error) throw new Error('Failed to fetch tasks: ' + tasksResult.error)
        if (dividersResult.error) throw new Error('Failed to fetch dividers: ' + dividersResult.error)
        
        return {
            tasks: tasksResult.data || [],
            dividers: dividersResult.data || [],
            error: null
        }
    } catch (error) {
        console.error('Error fetching all user data:', error)
        return {
            tasks: [],
            dividers: [],
            error: error.message
        }
    }
}

// Migration helper: Convert localStorage tasks to Supabase format
function convertLegacyTasksToSupabaseFormat(localStorageTasks, defaultGroupId = null) {
    return localStorageTasks.map(task => {
        if (task.type === 'divider') {
            return {
                type: 'divider',
                text: task.text,
                order_index: 0
            }
        } else {
            return {
                name: task.name,
                group_id: defaultGroupId,
                status: task.status || 'not-started',
                priority: 'medium',
                deadline: task.deadline || null,
                order_index: 0
            }
        }
    })
}

// Export all functions globally
window.tasksAPI = {
    // Tasks
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTasksOrder,
    
    // Dividers
    getDividers,
    createDivider,
    updateDivider,
    deleteDivider,
    
    // Bulk operations
    getAllUserData,
    convertLegacyTasksToSupabaseFormat
}