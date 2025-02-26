let tasks = [];
let lastSaveTime = Date.now();
let changesSinceLastSave = 0;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHANGES_THRESHOLD = 10; // Number of changes before suggesting a save

// Make tasks array available globally
window.tasks = tasks;

// Load tasks from local storage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        window.tasks = tasks; // Update global reference
        renderTasks();
        
        // Check if there's a last used JSON file
        const lastJsonFile = localStorage.getItem('lastJsonFile');
        if (lastJsonFile) {
            setTimeout(() => {
                showJsonLoadPrompt(lastJsonFile);
            }, 1000); // Show after 1 second
        }
    }
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    changesSinceLastSave++;
    
    // Check if we should suggest saving to a file
    if (changesSinceLastSave >= CHANGES_THRESHOLD || 
        (Date.now() - lastSaveTime) > AUTO_SAVE_INTERVAL) {
        suggestFileSave();
    }
}

// Make saveTasks available globally
window.saveTasks = saveTasks;

// Suggest saving to a file
function suggestFileSave() {
    const saveNotification = document.createElement('div');
    saveNotification.className = 'save-notification';
    saveNotification.innerHTML = `
        <p>You've made several changes. Would you like to save your tasks to a file?</p>
        <div class="save-actions">
            <button onclick="exportTasks(); this.parentElement.parentElement.remove();">Save to File</button>
            <button onclick="this.parentElement.parentElement.remove();">Dismiss</button>
        </div>
    `;
    
    // Remove any existing notification
    const existingNotification = document.querySelector('.save-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    document.body.appendChild(saveNotification);
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        if (document.body.contains(saveNotification)) {
            saveNotification.remove();
        }
    }, 15000);
    
    // Reset counters
    lastSaveTime = Date.now();
    changesSinceLastSave = 0;
}

// Export tasks to a JSON file
function exportTasks() {
    const tasksJSON = JSON.stringify(tasks, null, 2);
    const blob = new Blob([tasksJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a filename with date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const filename = `optimitimer-tasks-${dateStr}.json`;
    
    // Remember this filename for next time
    localStorage.setItem('lastJsonFile', filename);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    // Reset counters
    lastSaveTime = Date.now();
    changesSinceLastSave = 0;
}

// Show prompt to load from last used JSON file
function showJsonLoadPrompt(filename) {
    const loadNotification = document.createElement('div');
    loadNotification.className = 'save-notification';
    loadNotification.innerHTML = `
        <p>Would you like to load your tasks from the last used file: <strong>${filename}</strong>?</p>
        <div class="save-actions">
            <button onclick="promptLoadLastJsonFile(); this.parentElement.parentElement.remove();">Load File</button>
            <button onclick="this.parentElement.parentElement.remove();">Use Current Tasks</button>
        </div>
    `;
    
    document.body.appendChild(loadNotification);
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        if (document.body.contains(loadNotification)) {
            loadNotification.remove();
        }
    }, 15000);
}

// Prompt to load the last used JSON file
function promptLoadLastJsonFile() {
    if (confirm('This will replace your current tasks. Continue?')) {
        importTasks(true); // true means try to use the last file
    }
}

// Import tasks from a JSON file
function importTasks(useLastFile = false) {
    if (useLastFile) {
        // Show file picker but suggest the last used file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        // Try to set the default file (this doesn't work in all browsers for security reasons)
        // but at least it will open the file picker in the right directory
        const lastJsonFile = localStorage.getItem('lastJsonFile');
        if (lastJsonFile) {
            try {
                // This is a hint to the browser, but may not work in all browsers
                input.setAttribute('webkitdirectory', '');
                input.setAttribute('directory', '');
            } catch (e) {
                console.warn('Could not set directory attribute', e);
            }
        }
        
        input.onchange = handleFileSelect;
        input.click();
    } else {
        // Regular import
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = handleFileSelect;
        input.click();
    }
}

// Handle file selection for import
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Remember this file name for next time
    localStorage.setItem('lastJsonFile', file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (Array.isArray(importedTasks)) {
                tasks = importedTasks;
                window.tasks = tasks;
                saveTasks();
                renderTasks();
                alert('Tasks imported successfully!');
            } else {
                alert('Invalid task file format.');
            }
        } catch (error) {
            alert('Error importing tasks: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Auto-save reminder when user is about to leave the page
window.addEventListener('beforeunload', (event) => {
    if (changesSinceLastSave > 0) {
        // This will show a browser dialog asking if the user wants to leave
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Make export and import functions available globally
window.exportTasks = exportTasks;
window.importTasks = importTasks;

function showAddTaskModal() {
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    resetModalToAdd();
}

function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const projectName = document.getElementById('projectName').value.trim();
    const deadline = document.getElementById('taskDeadline').value;
    const status = document.getElementById('taskStatus').value;

    if (!taskName) return;

    const task = {
        id: Date.now(),
        name: taskName,
        project: projectName,
        deadline: deadline,
        status: status
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    closeModal();
    
    // Update current task in fullscreen mode if this is the first task
    if (tasks.length === 1) {
        updateCurrentTask();
    }
}

function addDivider() {
    const dividerText = prompt('Enter divider text (e.g., "Monday"):');
    if (!dividerText) return;

    const divider = {
        id: Date.now(),
        type: 'divider',
        text: dividerText
    };

    tasks.push(divider);
    saveTasks();
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('taskName').value = task.name;
    document.getElementById('projectName').value = task.project;
    document.getElementById('taskDeadline').value = task.deadline;
    document.getElementById('taskStatus').value = task.status;
    
    // Change modal buttons for edit mode
    const addButton = document.querySelector('#taskModal button[onclick="addTask()"]');
    addButton.textContent = 'Save Changes';
    addButton.onclick = () => updateTask(taskId);
    
    showAddTaskModal();
}

function updateTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const oldStatus = tasks[taskIndex].status;
    const newStatus = document.getElementById('taskStatus').value;

    tasks[taskIndex] = {
        id: taskId,
        name: document.getElementById('taskName').value,
        project: document.getElementById('projectName').value,
        deadline: document.getElementById('taskDeadline').value,
        status: newStatus
    };

    saveTasks();
    renderTasks();
    closeModal();
    resetModalToAdd();

    // Update current task in fullscreen mode if status changed
    if (oldStatus !== newStatus) {
        updateCurrentTask();
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

function resetModalToAdd() {
    const addButton = document.querySelector('#taskModal button');
    if (addButton) {
        addButton.textContent = 'Add';
        addButton.onclick = addTask;
    }
    
    // Clear form
    document.getElementById('taskName').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskStatus').value = 'not-started';
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
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const statusFilter = document.getElementById('statusFilter').value;

    // Separate waiting feedback tasks
    const waitingTasks = tasks.filter(t => !t.type && t.status === 'waiting');
    const regularTasks = tasks.filter(t => t.type || t.status !== 'waiting');

    // Render regular tasks
    regularTasks.forEach(item => {
        if (item.type === 'divider') {
            const dividerElement = document.createElement('div');
            dividerElement.className = 'divider task-enter';
            dividerElement.dataset.id = item.id;
            dividerElement.innerHTML = `
                <span>${item.text}</span>
                <div class="edit-buttons">
                    <button class="edit-button" onclick="editDivider(${item.id})">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button class="delete-button" onclick="deleteTask(${item.id})">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            `;
            taskList.appendChild(dividerElement);
        } else if (statusFilter === 'all' || item.status === statusFilter) {
            renderTaskElement(item, taskList);
        }
    });

    // Add waiting feedback section if there are waiting tasks
    if (waitingTasks.length > 0 && (statusFilter === 'all' || statusFilter === 'waiting')) {
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

        // Render waiting tasks
        waitingTasks.forEach(task => {
            renderTaskElement(task, waitingContainer);
        });
        
        // Initialize drag and drop for waiting tasks (only within the waiting container)
        new Sortable(waitingContainer, {
            animation: 150,
            ghostClass: 'bg-gray-100',
            chosenClass: 'bg-gray-200',
            dragClass: 'shadow-lg',
            group: 'waitingTasks', // Unique group name
            onEnd: function(evt) {
                const newWaitingTasks = [];
                waitingContainer.childNodes.forEach(node => {
                    const taskId = parseInt(node.dataset.id);
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        newWaitingTasks.push(task);
                    }
                });
                
                // Update tasks array with new waiting tasks order
                const nonWaitingTasks = tasks.filter(t => t.type || t.status !== 'waiting');
                tasks = [...nonWaitingTasks, ...newWaitingTasks];
                saveTasks();
            }
        });
    }

    // Initialize drag and drop for regular tasks
    new Sortable(taskList, {
        animation: 150,
        ghostClass: 'bg-gray-100',
        chosenClass: 'bg-gray-200',
        dragClass: 'shadow-lg',
        filter: '.waiting-tasks-container, #waitingFeedbackDivider', // Exclude waiting tasks container from main sortable
        onEnd: function(evt) {
            const newTasks = [];
            taskList.childNodes.forEach(node => {
                if (node.id === 'waitingFeedbackDivider' || node.id === 'waitingTasksContainer') {
                    return; // Skip waiting feedback section
                }
                const taskId = parseInt(node.dataset.id);
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    newTasks.push(task);
                }
            });
            
            // Preserve waiting tasks
            const waitingTasks = tasks.filter(t => !t.type && t.status === 'waiting');
            tasks = [...newTasks, ...waitingTasks];
            saveTasks();
        }
    });
}

function renderTaskElement(task, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card task-enter task-item';
    taskElement.dataset.id = task.id;
    taskElement.dataset.status = task.status;
    
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
    
    taskElement.innerHTML = `
        <div class="task-content">
            <h3 class="task-name">${task.name}</h3>
            <p class="project-name">${task.project}</p>
            <p class="task-deadline">${task.deadline}</p>
            <div class="status-pill ${task.status}" onclick="editTask(${task.id})">${statusDisplay}</div>
        </div>
        <div class="edit-buttons">
            <button class="edit-button" onclick="editTask(${task.id})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </button>
            <button class="delete-button" onclick="deleteTask(${task.id})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
            </button>
        </div>
    `;
    container.appendChild(taskElement);
}

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
}); 