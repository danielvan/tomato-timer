let tasks = [];
let queue = [];
let lastSaveTime = Date.now();
let changesSinceLastSave = 0;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHANGES_THRESHOLD = 10; // Number of changes before suggesting a save

// Global sortable instances
let regularSortable = null;
let waitingSortable = null;
let queueSortable = null;

// Make tasks array available globally
window.tasks = tasks;
window.queue = queue;

// Load tasks and queue from local storage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        const savedQueue = localStorage.getItem('queue');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            
            // Validate tasks array
            if (!Array.isArray(tasks)) {
                console.error('Saved tasks is not an array, resetting');
                tasks = [];
            }
            
            window.tasks = tasks; // Update global reference
            console.log('Loaded', tasks.length, 'tasks from localStorage');
        } else {
            console.log('No tasks found in localStorage');
            tasks = [];
            window.tasks = tasks;
        }
        
        if (savedQueue) {
            queue = JSON.parse(savedQueue);
            
            // Validate queue array
            if (!Array.isArray(queue)) {
                console.error('Saved queue is not an array, resetting');
                queue = [];
            }
            
            window.queue = queue; // Update global reference
            console.log('Loaded', queue.length, 'items in queue from localStorage');
        } else {
            console.log('No queue found in localStorage');
            queue = [];
            window.queue = queue;
        }
        
        renderTasks();
        renderQueue();
        
    } catch (e) {
        console.error('Error loading tasks:', e);
        tasks = [];
        queue = [];
        window.tasks = tasks;
        window.queue = queue;
    }
}

// Save tasks and queue to local storage
function saveTasks() {
    try {
        console.log('Saving tasks, count:', tasks.length);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('queue', JSON.stringify(queue));
        changesSinceLastSave++;
        
        return true;
    } catch (e) {
        console.error('Error saving tasks:', e);
        return false;
    }
}

// Make saveTasks available globally
window.saveTasks = saveTasks;


// Export tasks to a JSON file





// Auto-save reminder when user is about to leave the page
window.addEventListener('beforeunload', (event) => {
    if (changesSinceLastSave > 0) {
        // This will show a browser dialog asking if the user wants to leave
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});



// Function to handle status toggle selection
function setupStatusToggle() {
    const statusButtons = document.querySelectorAll('.status-toggle button');
    
    // Remove any existing event listeners first
    statusButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
    // Add fresh event listeners
    document.querySelectorAll('.status-toggle button').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.status-toggle button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
        });
    });
}

// Function to update project suggestions
function updateProjectSuggestions() {
    const projectNames = new Set();
    
    // Collect all unique project names
    tasks.forEach(task => {
        if (task.project && task.project.trim()) {
            projectNames.add(task.project.trim());
        }
    });
    
    // Update datalist with project names
    const datalist = document.getElementById('projectList');
    if (datalist) {
        datalist.innerHTML = '';
        projectNames.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            datalist.appendChild(option);
        });
    }
    
    // Update project filter dropdown
    const projectFilter = document.getElementById('projectFilter');
    if (projectFilter) {
        // Save current selection
        const currentSelection = projectFilter.value;
        
        // Clear and repopulate
        projectFilter.innerHTML = '<option value="all">All Projects</option>';
        projectNames.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            projectFilter.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentSelection && Array.from(projectFilter.options).some(opt => opt.value === currentSelection)) {
            projectFilter.value = currentSelection;
        }
    }
}

function showAddTaskModal() {
    // Update project suggestions
    updateProjectSuggestions();
    
    document.getElementById('taskModal').style.display = 'block';
    
    // Setup status toggle
    setupStatusToggle();
    
    // Focus on task name field
    document.getElementById('taskName').focus();
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    resetModalToAdd();
}

function resetModalToAdd() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskProject').value = '';
    document.getElementById('taskDeadline').value = '';
    
    // Reset priority
    const taskPrioritySelect = document.getElementById('taskPriority');
    if (taskPrioritySelect) taskPrioritySelect.value = 'medium';
    
    // Reset status toggle to "Not Started"
    const statusButtons = document.querySelectorAll('.status-toggle button');
    statusButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.status-toggle button[data-status="not-started"]').classList.add('active');
    
    // Reset save button to add new task mode
    const saveButton = document.getElementById('saveTaskButton');
    saveButton.textContent = 'Save Changes';
    saveButton.onclick = addTask;
}

async function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskProject = document.getElementById('taskProject').value.trim();
    const selectedPriority = document.getElementById('taskPriority')?.value || 'medium';
    const deadline = document.getElementById('taskDeadline').value;
    
    // Get status from active toggle button
    const activeStatusButton = document.querySelector('.status-toggle button.active');
    const status = activeStatusButton ? activeStatusButton.getAttribute('data-status') : 'not-started';

    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    // Check if we're in online mode
    if (window.syncManager && window.syncManager.getSyncStatus().isOnline) {
        try {
            const taskData = {
                name: taskName,
                description: taskDescription,
                project: taskProject,
                status: status,
                priority: selectedPriority,
                deadline: deadline || null,
                order_index: tasks.length
            };

            // Create task in Supabase
            await window.syncManager.createTask(taskData);
            closeModal();
            
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task: ' + error.message);
        }
    } else {
        // Fallback for offline mode (should rarely happen now)
        const task = {
            id: Date.now(),
            name: taskName,
            description: taskDescription,
            project: taskProject,
            priority: selectedPriority,
            deadline: deadline,
            status: status
        };

        tasks.push(task);
        if (saveTasks()) {
            renderTasks();
            closeModal();
        } else {
            alert('Failed to save task. Please try again.');
        }
    }
}

// Queue management functions
function addToQueue(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.type === 'divider') return;
    
    // Check if already in queue
    if (queue.find(q => q.id === taskId)) {
        alert('Task is already in the queue');
        return;
    }
    
    queue.push({ id: taskId, order: queue.length });
    saveTasks();
    renderQueue();
    updateClearDoneButton();
}

function removeFromQueue(taskId) {
    queue = queue.filter(q => q.id !== taskId);
    saveTasks();
    renderQueue();
}

function clearDoneTasks() {
    if (!confirm('Are you sure you want to clear all done tasks? This will permanently remove them.')) {
        return;
    }
    
    // Remove done tasks from main tasks array
    tasks = tasks.filter(task => task.status !== 'done');
    
    // Remove done tasks from queue
    queue = queue.filter(queueItem => {
        const task = tasks.find(t => t.id === queueItem.id);
        return task && task.status !== 'done';
    });
    
    saveTasks();
    renderTasks();
    renderQueue();
    updateClearDoneButton();
}

function updateClearDoneButton() {
    const clearBtn = document.getElementById('clearDoneBtn');
    const hasDoneTasks = tasks.some(task => task.status === 'done');
    
    if (hasDoneTasks) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
}

window.addToQueue = addToQueue;
window.removeFromQueue = removeFromQueue;
window.clearDoneTasks = clearDoneTasks;

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Update project suggestions
        updateProjectSuggestions();
        
        // Fill form fields
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskProject').value = task.project || '';
        document.getElementById('taskDeadline').value = task.deadline || '';
        
        // Set priority
        const taskPrioritySelect = document.getElementById('taskPriority');
        if (taskPrioritySelect && task.priority) {
            taskPrioritySelect.value = task.priority;
        }
        
        // Set status in toggle
        const statusButtons = document.querySelectorAll('.status-toggle button');
        statusButtons.forEach(btn => btn.classList.remove('active'));
        const statusToSelect = document.querySelector(`.status-toggle button[data-status="${task.status}"]`);
        if (statusToSelect) {
            statusToSelect.classList.add('active');
        } else {
            // Default to not-started if status doesn't match
            document.querySelector('.status-toggle button[data-status="not-started"]').classList.add('active');
        }
        
        // Convert button to update
        const saveButton = document.getElementById('saveTaskButton');
        saveButton.textContent = 'Update Task';
        
        // Use a closure to preserve the taskId
        saveButton.onclick = function() {
            updateTask(taskId);
        };
        
        document.getElementById('taskModal').style.display = 'block';
    }
}

async function updateTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const taskName = document.getElementById('taskName').value.trim();
        const taskDescription = document.getElementById('taskDescription').value.trim();
        const taskProject = document.getElementById('taskProject').value.trim();
        const selectedPriority = document.getElementById('taskPriority')?.value || 'medium';
        const deadline = document.getElementById('taskDeadline').value;
        
        // Get status from active toggle button
        const activeStatusButton = document.querySelector('.status-toggle button.active');
        const status = activeStatusButton ? activeStatusButton.getAttribute('data-status') : 'not-started';

        if (!taskName) return;

        // Check if we're in online mode
        if (window.syncManager && window.syncManager.getSyncStatus().isOnline) {
            try {
                const updateData = {
                    name: taskName,
                    description: taskDescription,
                    project: taskProject,
                    priority: selectedPriority,
                    deadline: deadline || null,
                    status: status
                };

                await window.syncManager.updateTask(taskId, updateData);
                closeModal();
                
            } catch (error) {
                console.error('Error updating task:', error);
                alert('Failed to update task: ' + error.message);
            }
        } else {
            // Fallback for offline mode
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                name: taskName,
                description: taskDescription,
                project: taskProject,
                priority: selectedPriority,
                deadline: deadline,
                status: status
            };

            saveTasks();
            renderTasks();
            closeModal();
            
            // Update current task in fullscreen mode
            updateCurrentTask();
        }
    }
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const element = document.querySelector(`[data-id="${taskId}"]`);
    element.classList.remove('task-enter');
    element.classList.add('task-exit');
    
    element.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateCurrentTask(); // Update current task in fullscreen mode
    });
}

function editDivider(dividerId) {
    const divider = tasks.find(t => t.id === dividerId);
    if (!divider) return;

    const newText = prompt('Edit divider text:', divider.text);
    if (newText !== null) {
        divider.text = newText;
        saveTasks();
        renderTasks();
    }
}

function completeTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].status = 'done';
    saveTasks();
    renderTasks();
    updateCurrentTask();
}

// Make completeTask available globally
window.completeTask = completeTask;

function renderTasks() {
    console.log('Rendering tasks, count:', tasks.length);
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const statusFilter = document.getElementById('statusFilter').value;
    const projectFilter = document.getElementById('projectFilter')?.value || 'all';
    console.log('Status filter:', statusFilter, 'Project filter:', projectFilter);
    
    // Update project suggestions
    updateProjectSuggestions();
    
    // Update clear done button visibility
    updateClearDoneButton();

    // Separate waiting feedback tasks
    const waitingTasks = tasks.filter(t => !t.type && t.status === 'waiting');
    const regularTasks = tasks.filter(t => t.type || t.status !== 'waiting');
    console.log('Regular tasks:', regularTasks.length, 'Waiting tasks:', waitingTasks.length);

    // Render regular tasks
    regularTasks.forEach((item, index) => {
        console.log(`Rendering regular task ${index}:`, item);
        if (item.type === 'divider') {
            const dividerElement = document.createElement('div');
            dividerElement.className = 'divider task-enter';
            dividerElement.dataset.id = item.id;
            dividerElement.innerHTML = `
                <span>${item.text}</span>
                <div class="edit-buttons">
                    <button class="delete-button" onclick="deleteTask(${item.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            `;
            taskList.appendChild(dividerElement);
        } else {
            // Apply both status and project filters
            const statusMatch = statusFilter === 'all' || item.status === statusFilter;
            const projectMatch = projectFilter === 'all' || (item.project || '') === projectFilter;
            
            if (statusMatch && projectMatch) {
                console.log(`Rendering task ${index} to main list`);
                renderTaskElement(item, taskList);
            } else {
                console.log(`Skipping task ${index} due to filter`);
            }
        }
    });

    // Add waiting feedback section if there are waiting tasks
    if (waitingTasks.length > 0 && (statusFilter === 'all' || statusFilter === 'waiting')) {
        console.log('Rendering waiting tasks section');
        // Add waiting feedback divider
        const waitingDivider = document.createElement('div');
        waitingDivider.className = 'divider waiting-feedback task-enter';
        waitingDivider.id = 'waitingFeedbackDivider';
        waitingDivider.innerHTML = '<span>Waiting Feedback</span>';
        taskList.appendChild(waitingDivider);

        // Create a container for waiting tasks
        const waitingContainer = document.createElement('div');
        waitingContainer.id = 'waitingTasksContainer';
        waitingContainer.className = 'waiting-tasks-container';
        taskList.appendChild(waitingContainer);

        // Render waiting tasks (also apply project filter)
        waitingTasks.forEach((task, index) => {
            const projectMatch = projectFilter === 'all' || (task.project || '') === projectFilter;
            if (projectMatch) {
                console.log(`Rendering waiting task ${index}:`, task);
                renderTaskElement(task, waitingContainer);
            }
        });
        
        // Initialize waiting tasks sortable in a setTimeout to ensure DOM is ready
        setTimeout(() => {
            initWaitingSortable();
        }, 0);
    }

    // Initialize main sortable in a setTimeout to ensure DOM is ready
    setTimeout(() => {
        initRegularSortable();
    }, 0);
}

// Initialize sortable for regular tasks
function initRegularSortable() {
    const taskList = document.getElementById('taskList');
    if (!taskList) {
        console.error('Task list element not found');
        return;
    }
    
    // Destroy existing instance if it exists
    if (regularSortable) {
        regularSortable.destroy();
        regularSortable = null;
    }
    
    try {
        regularSortable = new Sortable(taskList, {
            animation: 150,
            ghostClass: 'bg-gray-100',
            chosenClass: 'bg-gray-200',
            dragClass: 'shadow-lg',
            filter: '.waiting-tasks-container, #waitingFeedbackDivider', // Exclude waiting tasks container from main sortable
            onEnd: function(evt) {
                console.log('Regular tasks sort ended');
                updateTasksOrder();
            }
        });
    } catch (e) {
        console.error('Error creating Sortable for regular tasks:', e);
    }
}

// Initialize sortable for waiting tasks
function initWaitingSortable() {
    const waitingContainer = document.getElementById('waitingTasksContainer');
    if (!waitingContainer) {
        console.error('Waiting container element not found');
        return;
    }
    
    // Destroy existing instance if it exists
    if (waitingSortable) {
        waitingSortable.destroy();
        waitingSortable = null;
    }
    
    try {
        waitingSortable = new Sortable(waitingContainer, {
            animation: 150,
            ghostClass: 'bg-gray-100',
            chosenClass: 'bg-gray-200',
            dragClass: 'shadow-lg',
            group: 'waitingTasks', // Unique group name
            onEnd: function(evt) {
                updateTasksOrder();
            }
        });
    } catch (e) {
        console.error('Error creating Sortable for waiting tasks:', e);
    }
}

// Update task order after drag and drop
function updateTasksOrder() {
    const taskList = document.getElementById('taskList');
    const waitingContainer = document.getElementById('waitingTasksContainer');
    
    // First collect regular tasks
    const newTasks = [];
    if (taskList) {
        taskList.childNodes.forEach(node => {
            if (node.id === 'waitingFeedbackDivider' || node.id === 'waitingTasksContainer') {
                console.log('Skipping node', node.id);
                return; // Skip waiting feedback section
            }
            if (!node.dataset || !node.dataset.id) {
                console.log('Skipping node without dataset.id');
                return; // Skip nodes without dataset.id
            }
            const taskId = parseInt(node.dataset.id);
            console.log('Processing node with ID:', taskId);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                newTasks.push(task);
            } else {
                console.warn('Task not found for ID:', taskId);
            }
        });
    }
    
    // Then collect waiting tasks
    const newWaitingTasks = [];
    if (waitingContainer) {
        waitingContainer.childNodes.forEach(node => {
            if (!node.dataset || !node.dataset.id) {
                console.log('Skipping waiting node without dataset.id');
                return;
            }
            const taskId = parseInt(node.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                newWaitingTasks.push(task);
            }
        });
    } else {
        // No waiting container, get all waiting tasks from the original array
        const waitingTasks = tasks.filter(t => !t.type && t.status === 'waiting');
        newWaitingTasks.push(...waitingTasks);
    }
    
    console.log('New task order:', newTasks.length, 'waiting tasks:', newWaitingTasks.length);
    
    // Update the tasks array with the new order
    tasks = [...newTasks, ...newWaitingTasks];
    console.log('Final tasks after reordering:', tasks.length);
    
    // Save to localStorage
    saveTasks();
}

function renderTaskElement(task, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card task-enter task-item';
    taskElement.dataset.id = task.id;
    taskElement.dataset.status = task.status;
    taskElement.draggable = true;
    
    // Format status for display
    let statusDisplay = '';
    switch(task.status) {
        case 'not-started':
            statusDisplay = 'Not Started';
            break;
        case 'in-progress':
            statusDisplay = 'In Progress';
            break;
        case 'done':
            statusDisplay = 'Done';
            break;
        case 'waiting':
            statusDisplay = 'Waiting Feedback';
            break;
        default:
            statusDisplay = task.status;
    }
    
    // Priority display
    const priorityDisplay = task.priority || 'medium';
    
    // Check if task is in queue
    const isInQueue = queue.some(q => q.id === task.id);
    
    taskElement.innerHTML = `
        <div class="task-content">
            <h3 class="task-name">${task.name}</h3>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            ${task.project ? `<p class="task-project">${task.project}</p>` : ''}
            ${task.deadline ? `<p class="task-deadline">${task.deadline}</p>` : ''}
            ${isInQueue ? '<p class="task-queue-indicator" style="color: rgba(0, 0, 0, 0.5); font-size: 14px; font-style: italic;">In Queue</p>' : ''}
        </div>
        <div class="edit-buttons">
            <button class="edit-button" onclick="event.stopPropagation(); editTask(${task.id})" title="Edit">
                ✏️
            </button>
            <button class="delete-button" onclick="event.stopPropagation(); deleteTask(${task.id})" title="Delete">
                🗑️
            </button>
        </div>
    `;
    
    // Add drag event listeners for queue functionality
    taskElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        taskElement.classList.add('dragging');
    });
    
    taskElement.addEventListener('dragend', () => {
        taskElement.classList.remove('dragging');
    });
    
    // Add click event to open task in edit mode
    taskElement.addEventListener('click', function(event) {
        // Only trigger if not clicking buttons
        if (!event.target.closest('button')) {
            editTask(task.id);
        }
    });
    
    container.appendChild(taskElement);
}

// Render queue items
function renderQueue() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    queueList.innerHTML = '';
    
    if (queue.length === 0) {
        queueList.innerHTML = '<div class="queue-empty">Drop tasks here to set timer order</div>';
        return;
    }
    
    // Sort queue by order
    queue.sort((a, b) => a.order - b.order);
    
    queue.forEach((queueItem, index) => {
        const task = tasks.find(t => t.id === queueItem.id);
        if (!task || task.type === 'divider') return;
        
        const queueElement = document.createElement('div');
        queueElement.className = 'queue-item';
        queueElement.dataset.id = task.id;
        
        queueElement.innerHTML = `
            <div class="queue-item-content">
                <span class="queue-item-name">${task.name}</span>
                <button class="queue-item-remove" onclick="removeFromQueue(${task.id})" title="Remove from queue">
                    ×
                </button>
            </div>
        `;
        
        queueList.appendChild(queueElement);
    });
    
    // Initialize queue sortable
    setTimeout(() => {
        initQueueSortable();
    }, 0);
}

// Initialize queue sortable
function initQueueSortable() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    // Destroy existing instance
    if (queueSortable) {
        queueSortable.destroy();
        queueSortable = null;
    }
    
    // Only create sortable if queue has items
    if (queue.length === 0) return;
    
    try {
        queueSortable = new Sortable(queueList, {
            animation: 150,
            ghostClass: 'queue-item-ghost',
            chosenClass: 'queue-item-chosen',
            dragClass: 'queue-item-drag',
            onEnd: function(evt) {
                updateQueueOrder();
            }
        });
    } catch (e) {
        console.error('Error creating Sortable for queue:', e);
    }
}

// Update queue order after sorting
function updateQueueOrder() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    const newQueue = [];
    queueList.querySelectorAll('.queue-item').forEach((element, index) => {
        const taskId = parseInt(element.dataset.id);
        newQueue.push({ id: taskId, order: index });
    });
    
    queue = newQueue;
    saveTasks();
}

// Set up queue drag and drop
function setupQueueDropZone() {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    queueList.addEventListener('dragover', (e) => {
        e.preventDefault();
        queueList.classList.add('drag-over');
    });
    
    queueList.addEventListener('dragleave', (e) => {
        // Only remove if leaving the queue area entirely
        if (!queueList.contains(e.relatedTarget)) {
            queueList.classList.remove('drag-over');
        }
    });
    
    queueList.addEventListener('drop', (e) => {
        e.preventDefault();
        queueList.classList.remove('drag-over');
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        if (taskId) {
            addToQueue(taskId);
        }
    });
}

window.renderQueue = renderQueue;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks(); // Load tasks from localStorage
    
    const modal = document.getElementById('taskModal');
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.querySelector('.modal-content').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.getElementById('statusFilter').addEventListener('change', renderTasks);
    document.getElementById('projectFilter').addEventListener('change', renderTasks);

    // Make the calendar open when clicking on the date input
    const dateInput = document.getElementById('taskDeadline');
    
    dateInput.addEventListener('click', function() {
        this.showPicker();
    });
    
    // Setup queue drop zone
    setupQueueDropZone();
}); 