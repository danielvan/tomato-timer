// Focus Batch Selector - Allows users to select multiple tasks for focused work sessions

class FocusBatchSelector {
    constructor() {
        this.selectedTasks = []
        this.isModalOpen = false
        this.init()
    }
    
    init() {
        this.createBatchModal()
        this.bindEvents()
    }
    
    createBatchModal() {
        const modalHtml = `
            <div id="focusBatchModal" class="focus-batch-modal hidden">
                <div class="focus-batch-modal-content">
                    <div class="modal-header">
                        <h2>Select Tasks for Focus Session</h2>
                        <button id="batchCloseBtn" class="modal-close">&times;</button>
                    </div>
                    
                    <div class="batch-content">
                        <div class="batch-instructions">
                            <p>Choose tasks from different groups to work on during your next focus session.</p>
                        </div>
                        
                        <div class="selected-tasks-summary">
                            <h3>Selected Tasks (<span id="selectedCount">0</span>)</h3>
                            <div id="selectedTasksList" class="selected-tasks-list"></div>
                        </div>
                        
                        <div class="available-tasks">
                            <h3>Available Tasks</h3>
                            <div class="group-filters">
                                <button class="filter-btn active" data-group="all">All Groups</button>
                                <div id="groupFilterButtons"></div>
                            </div>
                            <div id="availableTasksList" class="available-tasks-list"></div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="focusBatchSelector.hideModal()">Cancel</button>
                        <button id="startBatchSession" class="btn-primary" disabled>Start Focus Session</button>
                    </div>
                </div>
            </div>
        `
        
        document.body.insertAdjacentHTML('beforeend', modalHtml)
    }
    
    bindEvents() {
        const modal = document.getElementById('focusBatchModal')
        const closeBtn = document.getElementById('batchCloseBtn')
        const startBtn = document.getElementById('startBatchSession')
        
        // Close modal events
        closeBtn.addEventListener('click', () => this.hideModal())
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal()
        })
        
        // Start batch session
        startBtn.addEventListener('click', () => this.startBatchSession())
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.hideModal()
            }
        })
        
        // Group filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.filterTasksByGroup(e.target.dataset.group)
                
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
                e.target.classList.add('active')
            }
        })
    }
    
    showModal() {
        this.isModalOpen = true
        this.selectedTasks = []
        this.updateSelectedTasksDisplay()
        this.loadAvailableTasks()
        this.createGroupFilters()
        
        const modal = document.getElementById('focusBatchModal')
        modal.classList.remove('hidden')
    }
    
    hideModal() {
        this.isModalOpen = false
        const modal = document.getElementById('focusBatchModal')
        modal.classList.add('hidden')
        this.selectedTasks = []
    }
    
    createGroupFilters() {
        const filterContainer = document.getElementById('groupFilterButtons')
        if (!window.taskGroupManager) return
        
        filterContainer.innerHTML = ''
        
        window.taskGroupManager.taskGroups.forEach(group => {
            const button = document.createElement('button')
            button.className = 'filter-btn'
            button.dataset.group = group.id
            button.textContent = group.name
            button.style.borderColor = group.color
            button.style.color = group.color
            filterContainer.appendChild(button)
        })
    }
    
    loadAvailableTasks() {
        if (!window.tasks) return
        
        const availableTasksList = document.getElementById('availableTasksList')
        const incompleteTasks = window.tasks.filter(task => 
            task.type !== 'divider' && 
            task.status !== 'done' &&
            !this.selectedTasks.find(selected => selected.id === task.id)
        )
        
        availableTasksList.innerHTML = ''
        
        if (incompleteTasks.length === 0) {
            availableTasksList.innerHTML = '<div class="empty-state">No available tasks</div>'
            return
        }
        
        incompleteTasks.forEach(task => {
            const taskEl = this.createTaskElement(task, false)
            availableTasksList.appendChild(taskEl)
        })
    }
    
    filterTasksByGroup(groupId) {
        const availableTasksList = document.getElementById('availableTasksList')
        const taskElements = availableTasksList.querySelectorAll('.batch-task-item')
        
        taskElements.forEach(taskEl => {
            const taskGroupId = taskEl.dataset.groupId
            
            if (groupId === 'all' || taskGroupId === groupId || (groupId === 'all' && !taskGroupId)) {
                taskEl.style.display = 'block'
            } else {
                taskEl.style.display = 'none'
            }
        })
    }
    
    createTaskElement(task, isSelected = false) {
        const taskEl = document.createElement('div')
        taskEl.className = 'batch-task-item'
        taskEl.dataset.taskId = task.id
        taskEl.dataset.groupId = task.group_id || ''
        
        // Get group info
        let groupInfo = ''
        if (task.group_id && window.taskGroupManager) {
            const group = window.taskGroupManager.taskGroups.find(g => g.id === task.group_id)
            if (group) {
                groupInfo = `<span class="task-group-indicator" style="background-color: ${group.color}">${group.name}</span>`
            }
        }
        
        const priorityClass = task.priority || 'medium'
        
        taskEl.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task.id}" ${isSelected ? 'checked' : ''}>
            </div>
            <div class="task-info">
                <h4>${task.name}</h4>
                <div class="task-details">
                    ${groupInfo}
                    <span class="priority-indicator priority-${priorityClass}">${priorityClass}</span>
                    ${task.deadline ? `<span class="deadline-indicator">${task.deadline}</span>` : ''}
                </div>
            </div>
        `
        
        // Add click handler
        const checkbox = taskEl.querySelector('input[type="checkbox"]')
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                this.addTaskToSelection(task)
            } else {
                this.removeTaskFromSelection(task.id)
            }
        })
        
        taskEl.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked
                checkbox.dispatchEvent(new Event('change'))
            }
        })
        
        return taskEl
    }
    
    addTaskToSelection(task) {
        if (!this.selectedTasks.find(t => t.id === task.id)) {
            this.selectedTasks.push(task)
            this.updateSelectedTasksDisplay()
            this.updateStartButton()
        }
    }
    
    removeTaskFromSelection(taskId) {
        this.selectedTasks = this.selectedTasks.filter(t => t.id !== taskId)
        this.updateSelectedTasksDisplay()
        this.updateStartButton()
        this.loadAvailableTasks() // Refresh to show task as available again
    }
    
    updateSelectedTasksDisplay() {
        const selectedList = document.getElementById('selectedTasksList')
        const selectedCount = document.getElementById('selectedCount')
        
        selectedCount.textContent = this.selectedTasks.length
        
        if (this.selectedTasks.length === 0) {
            selectedList.innerHTML = '<div class="empty-selection">No tasks selected yet</div>'
            return
        }
        
        selectedList.innerHTML = this.selectedTasks.map(task => `
            <div class="selected-task-item">
                <span class="task-name">${task.name}</span>
                <button class="remove-btn" onclick="focusBatchSelector.removeTaskFromSelection('${task.id}')">
                    <span class="icon">×</span>
                </button>
            </div>
        `).join('')
    }
    
    updateStartButton() {
        const startBtn = document.getElementById('startBatchSession')
        startBtn.disabled = this.selectedTasks.length === 0
        startBtn.textContent = this.selectedTasks.length > 0 
            ? `Start Session (${this.selectedTasks.length} tasks)` 
            : 'Start Focus Session'
    }
    
    startBatchSession() {
        if (this.selectedTasks.length === 0) return
        
        // Store selected tasks for the focus session
        if (window.focusSession) {
            window.focusSession.setBatchTasks(this.selectedTasks)
        }
        
        // Show success message
        if (window.app && window.app.showNotification) {
            window.app.showNotification(
                `Focus batch created with ${this.selectedTasks.length} tasks!`, 
                'success'
            )
        }
        
        this.hideModal()
        
        // Optionally start timer immediately or just prepare the batch
        console.log('Batch session started with tasks:', this.selectedTasks)
    }
    
    getSelectedTasks() {
        return this.selectedTasks
    }
}

// Create global focus batch selector instance
window.focusBatchSelector = new FocusBatchSelector()

// Make class available globally
window.FocusBatchSelector = FocusBatchSelector