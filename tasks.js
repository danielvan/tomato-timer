let tasks = [];

// Load tasks from local storage
async function loadTasks() {
    if (!currentUser) return;
    
    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .orderBy('order')
            .get();
        
        tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Save tasks to local storage
async function saveTasks() {
    if (!currentUser) return;
    
    try {
        const batch = db.batch();
        const userTasksRef = db.collection('users').doc(currentUser.uid).collection('tasks');
        
        // Delete all existing tasks
        const existingTasks = await userTasksRef.get();
        existingTasks.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Add all current tasks with order
        tasks.forEach((task, index) => {
            const newTaskRef = userTasksRef.doc(task.id.toString());
            batch.set(newTaskRef, { ...task, order: index });
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

function showAddTaskModal() {
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

function addTask() {
    const task = {
        id: Date.now(),
        name: document.getElementById('taskName').value,
        project: document.getElementById('projectName').value,
        deadline: document.getElementById('taskDeadline').value,
        status: document.getElementById('taskStatus').value
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    closeModal();
}

function addDivider() {
    const divider = {
        id: Date.now(),
        type: 'divider',
        text: prompt('Enter divider text (e.g., "Monday"):')
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

    tasks[taskIndex] = {
        id: taskId,
        name: document.getElementById('taskName').value,
        project: document.getElementById('projectName').value,
        deadline: document.getElementById('taskDeadline').value,
        status: document.getElementById('taskStatus').value
    };

    saveTasks();
    renderTasks();
    closeModal();
    resetModalToAdd();
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const element = document.querySelector(`[data-id="${taskId}"]`);
        element.classList.remove('task-enter');
        element.classList.add('task-exit');
        
        element.addEventListener('animationend', () => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        });
    }
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
    const addButton = document.querySelector('#taskModal button[onclick="updateTask()"]');
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

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const statusFilter = document.getElementById('statusFilter').value;

    tasks.forEach(item => {
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
            // Add double-click handler for dividers
            dividerElement.addEventListener('dblclick', () => editDivider(item.id));
            taskList.appendChild(dividerElement);
        } else if (statusFilter === 'all' || item.status === statusFilter) {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-card task-enter';
            taskElement.dataset.id = item.id;
            taskElement.innerHTML = `
                <div class="task-content">
                    <h3>${item.name}</h3>
                    <p>Project: ${item.project}</p>
                    <p>Deadline: ${item.deadline}</p>
                    <p>Status: ${item.status}</p>
                </div>
                <div class="edit-buttons">
                    <button class="edit-button" onclick="editTask(${item.id})">
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
            // Add double-click handler for tasks
            taskElement.addEventListener('dblclick', () => editTask(item.id));
            taskList.appendChild(taskElement);
        }
    });

    // Initialize drag and drop with animation
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

// Add click outside modal handler
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth(); // Initialize authentication first
    
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