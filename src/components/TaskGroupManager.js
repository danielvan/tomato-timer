// Task Group Manager - Handles task group creation, editing, and focus session selection

class TaskGroupManager {
    constructor() {
        this.taskGroups = []
        this.selectedGroupForFocus = null
        this.init()
    }
    
    init() {
        this.createTaskGroupModal()
        this.bindEvents()
    }
    
    createTaskGroupModal() {
        const modalHtml = `
            <div id="taskGroupModal" class="task-group-modal hidden">
                <div class="task-group-modal-content">
                    <div class="modal-header">
                        <h2 id="taskGroupTitle">Create Task Group</h2>
                        <button id="taskGroupCloseBtn" class="modal-close">&times;</button>
                    </div>
                    
                    <form id="taskGroupForm" class="task-group-form">
                        <div id="taskGroupError" class="form-error hidden"></div>
                        
                        <div class="form-field">
                            <label for="groupName">Group Name</label>
                            <input type="text" id="groupName" placeholder="e.g., Work Projects, Personal Tasks" required>
                        </div>
                        
                        <div class="form-field">
                            <label for="groupDescription">Description (optional)</label>
                            <textarea id="groupDescription" placeholder="What is this group for?"></textarea>
                        </div>
                        
                        <div class="form-field">
                            <label for="groupColor">Color</label>
                            <div class="color-picker">
                                <input type="color" id="groupColor" value="#4CAF50">
                                <div class="color-presets">
                                    <button type="button" class="color-preset" data-color="#4CAF50"></button>
                                    <button type="button" class="color-preset" data-color="#2196F3"></button>
                                    <button type="button" class="color-preset" data-color="#FF9800"></button>
                                    <button type="button" class="color-preset" data-color="#9C27B0"></button>
                                    <button type="button" class="color-preset" data-color="#F44336"></button>
                                    <button type="button" class="color-preset" data-color="#607D8B"></button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <label for="groupPriority">Priority</label>
                            <select id="groupPriority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="taskGroupManager.hideModal()">Cancel</button>
                            <button type="submit" id="taskGroupSubmitBtn" class="btn-primary">Create Group</button>
                        </div>
                    </form>
                </div>
            </div>
        `
        
        document.body.insertAdjacentHTML('beforeend', modalHtml)
    }
    
    bindEvents() {
        const form = document.getElementById('taskGroupForm')
        const closeBtn = document.getElementById('taskGroupCloseBtn')
        const modal = document.getElementById('taskGroupModal')
        
        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e))
        
        // Close modal
        closeBtn.addEventListener('click', () => this.hideModal())
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal()
        })
        
        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            const color = preset.dataset.color
            preset.style.backgroundColor = color
            preset.addEventListener('click', () => {
                document.getElementById('groupColor').value = color
            })
        })
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideModal()
            }
        })
    }
    
    async handleSubmit(e) {
        e.preventDefault()
        
        const name = document.getElementById('groupName').value.trim()
        const description = document.getElementById('groupDescription').value.trim()
        const color = document.getElementById('groupColor').value
        const priority = document.getElementById('groupPriority').value
        const submitBtn = document.getElementById('taskGroupSubmitBtn')
        
        if (!name) {
            this.showError('Please enter a group name')
            return
        }
        
        // Disable submit button
        submitBtn.disabled = true
        submitBtn.textContent = 'Creating...'
        
        this.clearError()
        
        try {
            const groupData = {
                name,
                description: description || null,
                color,
                priority,
                is_active: false,
                order_index: this.taskGroups.length
            }
            
            const result = await window.tasksAPI.createTaskGroup(groupData)
            
            if (result.error) {
                this.showError(result.error)
            } else {
                // Reload groups and hide modal
                await this.loadTaskGroups()
                this.hideModal()
                this.showSuccess('Task group created successfully!')
            }
        } catch (error) {
            this.showError('Failed to create task group: ' + error.message)
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false
            submitBtn.textContent = 'Create Group'
        }
    }
    
    async loadTaskGroups() {
        try {
            const result = await window.tasksAPI.getTaskGroups()
            
            if (result.error) {
                throw new Error(result.error)
            }
            
            this.taskGroups = result.data || []
            this.renderTaskGroups()
            
        } catch (error) {
            console.error('Error loading task groups:', error)
        }
    }
    
    renderTaskGroups() {
        // Create groups section if it doesn't exist
        let groupsSection = document.getElementById('taskGroupsSection')
        if (!groupsSection) {
            const container = document.querySelector('.container')
            if (!container) return
            
            groupsSection = document.createElement('div')
            groupsSection.id = 'taskGroupsSection'
            groupsSection.className = 'task-groups-section'
            groupsSection.innerHTML = `
                <div class="section-header">
                    <h2>Task Groups</h2>
                    <button id="addTaskGroupBtn" class="btn-primary btn-small">
                        <span class="icon">+</span>
                        New Group
                    </button>
                </div>
                <div id="taskGroupsList" class="task-groups-list"></div>
            `
            
            // Insert before task section
            const taskSection = document.querySelector('.task-section')
            container.insertBefore(groupsSection, taskSection)
            
            // Bind add group button
            document.getElementById('addTaskGroupBtn').addEventListener('click', () => {
                this.showModal()
            })
        }
        
        // Render groups list
        const groupsList = document.getElementById('taskGroupsList')
        if (!groupsList) return
        
        if (this.taskGroups.length === 0) {
            groupsList.innerHTML = `
                <div class="empty-state">
                    <p>No task groups yet. Create your first group to organize your tasks!</p>
                </div>
            `
            return
        }
        
        groupsList.innerHTML = this.taskGroups.map(group => `
            <div class="task-group-card" data-group-id="${group.id}">
                <div class="group-color" style="background-color: ${group.color}"></div>
                <div class="group-content">
                    <div class="group-main">
                        <h3 class="group-name">${group.name}</h3>
                        <p class="group-description">${group.description || ''}</p>
                        <div class="group-meta">
                            <span class="priority-badge priority-${group.priority}">${group.priority}</span>
                            <span class="task-count">0 tasks</span>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-icon" onclick="taskGroupManager.selectForFocus('${group.id}')" 
                                title="Use for focus session">
                            <span class="icon">🎯</span>
                        </button>
                        <button class="btn-icon" onclick="taskGroupManager.editGroup('${group.id}')" 
                                title="Edit group">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="btn-icon danger" onclick="taskGroupManager.deleteGroup('${group.id}')" 
                                title="Delete group">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                </div>
                ${group.is_active ? '<div class="active-indicator">Active for Focus</div>' : ''}
            </div>
        `).join('')
    }
    
    showModal(editGroup = null) {
        const modal = document.getElementById('taskGroupModal')
        const title = document.getElementById('taskGroupTitle')
        const submitBtn = document.getElementById('taskGroupSubmitBtn')
        
        if (editGroup) {
            title.textContent = 'Edit Task Group'
            submitBtn.textContent = 'Update Group'
            // TODO: Fill form with existing data
        } else {
            title.textContent = 'Create Task Group'
            submitBtn.textContent = 'Create Group'
            this.clearForm()
        }
        
        modal.classList.remove('hidden')
        document.getElementById('groupName').focus()
    }
    
    hideModal() {
        document.getElementById('taskGroupModal').classList.add('hidden')
        this.clearForm()
        this.clearError()
    }
    
    clearForm() {
        document.getElementById('taskGroupForm').reset()
        document.getElementById('groupColor').value = '#4CAF50'
        document.getElementById('groupPriority').value = 'medium'
    }
    
    showError(message) {
        const errorEl = document.getElementById('taskGroupError')
        errorEl.textContent = message
        errorEl.classList.remove('hidden')
    }
    
    clearError() {
        document.getElementById('taskGroupError').classList.add('hidden')
    }
    
    showSuccess(message) {
        // Use the global notification system
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'success')
        }
    }
    
    async selectForFocus(groupId) {
        try {
            // Deactivate all groups first
            for (let group of this.taskGroups) {
                if (group.is_active) {
                    await window.tasksAPI.updateTaskGroup(group.id, { is_active: false })
                }
            }
            
            // Activate selected group
            await window.tasksAPI.updateTaskGroup(groupId, { is_active: true })
            
            // Reload and update UI
            await this.loadTaskGroups()
            this.selectedGroupForFocus = groupId
            
            this.showSuccess('Group selected for focus sessions!')
            
        } catch (error) {
            console.error('Error selecting group for focus:', error)
            if (window.app && window.app.showErrorMessage) {
                window.app.showErrorMessage('Failed to select group: ' + error.message)
            }
        }
    }
    
    async deleteGroup(groupId) {
        if (!confirm('Are you sure you want to delete this task group? This will also delete all tasks in this group.')) {
            return
        }
        
        try {
            await window.tasksAPI.deleteTaskGroup(groupId)
            await this.loadTaskGroups()
            this.showSuccess('Task group deleted successfully!')
            
        } catch (error) {
            console.error('Error deleting group:', error)
            if (window.app && window.app.showErrorMessage) {
                window.app.showErrorMessage('Failed to delete group: ' + error.message)
            }
        }
    }
    
    editGroup(groupId) {
        // TODO: Implement edit functionality
        console.log('Edit group:', groupId)
    }
    
    getActiveGroup() {
        return this.taskGroups.find(group => group.is_active) || null
    }
    
    getSelectedGroupForFocus() {
        return this.selectedGroupForFocus
    }
}

// Create global task group manager instance
window.taskGroupManager = new TaskGroupManager()

// Make TaskGroupManager class available globally
window.TaskGroupManager = TaskGroupManager