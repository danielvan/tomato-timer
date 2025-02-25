let tasks = [];

// Load tasks from local storage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

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
        waitingDivider.innerHTML = '<span>Waiting Feedback</span>';
        taskList.appendChild(waitingDivider);

        // Render waiting tasks
        waitingTasks.forEach(task => {
            renderTaskElement(task, taskList);
        });
    }

    // Initialize drag and drop
    new Sortable(taskList, {
        animation: 150,
        ghostClass: 'bg-gray-100',
        chosenClass: 'bg-gray-200',
        dragClass: 'shadow-lg',
        onEnd: function(evt) {
            const newTasks = [];
            taskList.childNodes.forEach(node => {
                const taskId = parseInt(node.dataset.id);
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    newTasks.push(task);
                }
            });
            tasks = newTasks;
            saveTasks();
        }
    });
}

function renderTaskElement(task, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card task-enter task-item';
    taskElement.dataset.id = task.id;
    taskElement.dataset.status = task.status;
    taskElement.innerHTML = `
        <div class="task-content">
            <h3 class="task-name">${task.name}</h3>
            <p class="project-name">Project: ${task.project}</p>
            <p class="task-deadline">Deadline: ${task.deadline}</p>
            <p>Status: ${task.status}</p>
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