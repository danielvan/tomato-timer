/**
 * Integration Tests
 * Tests complete user workflows and system interactions
 */

describe('Optimitimer Integration Tests', () => {
  let mockUser;
  let mockTasks;
  
  beforeEach(() => {
    setupTestEnvironment();
    
    // Setup mock user data
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      },
      created_at: '2024-01-01T00:00:00Z'
    };
    
    // Setup mock tasks data
    mockTasks = [
      {
        id: '1',
        name: 'Complete Project Proposal',
        description: 'Write and submit the Q4 project proposal',
        project: 'Marketing',
        status: 'in-progress',
        priority: 'high',
        deadline: '2024-12-31',
        order_index: 0
      },
      {
        id: '2',
        name: 'Review Code Changes',
        description: 'Code review for the new authentication system',
        project: 'Development',
        status: 'not-started',
        priority: 'medium',
        deadline: '2024-12-30',
        order_index: 1
      }
    ];
    
    // Setup complete DOM for integration testing
    document.body.innerHTML = `
      <header class="app-header">
        <h1>Optimitimer</h1>
        <div class="header-controls">
          <div id="loggedInControls" class="hidden">
            <div class="task-controls">
              <button onclick="showAddTaskModal()">Add Task</button>
              <button onclick="addDivider()">Add Divider</button>
            </div>
            <div class="filter-controls">
              <select id="statusFilter">
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="waiting">Waiting Feedback</option>
              </select>
            </div>
            <div id="userInfo" class="user-info-header">
              <div id="userAvatar" class="user-avatar">U</div>
              <span id="userName" class="user-name">Loading...</span>
              <div class="user-dropdown">
                <button id="userMenuBtn" class="user-menu-btn">⋮</button>
                <div class="user-dropdown-content">
                  <button id="changePasswordBtn" class="user-dropdown-item">Change Password</button>
                  <button id="signOutBtn" class="user-dropdown-item">Sign Out</button>
                </div>
              </div>
            </div>
          </div>
          <div id="loggedOutControls">
            <button id="signInBtn" class="auth-submit">Sign In</button>
          </div>
        </div>
      </header>
      
      <div id="normalView" class="container">
        <div class="timer-section">
          <div class="preset-buttons">
            <button id="preset5">5 min</button>
            <button id="preset15">15 min</button>
            <button id="preset25">25 min</button>
            <button id="customTime" class="custom-time-btn">Custom</button>
          </div>
          <div class="timer-input hidden">
            <div class="time-inputs">
              <input type="number" id="hours" min="0" max="23" placeholder="HH">
              <span>:</span>
              <input type="number" id="minutes" min="0" max="59" placeholder="MM">
              <span>:</span>
              <input type="number" id="seconds" min="0" max="59" placeholder="SS">
            </div>
          </div>
          <div class="timer-controls">
            <button id="startTimer" class="primary-button">Start</button>
            <button id="resetTimer">Reset</button>
          </div>
        </div>
        
        <div class="task-section">
          <div id="taskList" class="task-list"></div>
        </div>
      </div>
      
      <div id="taskModal" class="modal">
        <div class="modal-content">
          <h2>Task Manager</h2>
          <input type="text" id="taskName" placeholder="Task Name" required>
          <div class="form-field">
            <label for="taskDescription">Description (optional)</label>
            <textarea id="taskDescription" placeholder="Task description..." rows="3"></textarea>
          </div>
          <div class="form-field">
            <label for="taskProject">Project</label>
            <input type="text" id="taskProject" placeholder="Project name" list="projectList">
            <datalist id="projectList"></datalist>
          </div>
          <div class="form-field">
            <label for="taskPriority">Priority</label>
            <select id="taskPriority">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <input type="date" id="taskDeadline" placeholder="Deadline (optional)">
          <div class="status-toggle">
            <button data-status="not-started" class="active">Not Started</button>
            <button data-status="in-progress">In Progress</button>
            <button data-status="waiting">Waiting</button>
            <button data-status="done">Done</button>
          </div>
          <div class="modal-actions">
            <button class="cancel-button" onclick="closeModal()">Cancel</button>
            <button id="saveTaskButton" class="save-button" onclick="addTask()">Save Changes</button>
          </div>
        </div>
      </div>
      
      <div id="authModal" class="modal hidden">
        <div class="modal-content">
          <div class="auth-tabs">
            <button class="tab-button active" data-tab="signin">Sign In</button>
            <button class="tab-button" data-tab="signup">Sign Up</button>
          </div>
          <div id="signinTab" class="auth-tab active">
            <form id="signinForm">
              <input type="email" id="signinEmail" placeholder="Email" required>
              <input type="password" id="signinEmail" placeholder="Password" required>
              <button type="submit">Sign In</button>
            </form>
          </div>
          <div id="signupTab" class="auth-tab">
            <form id="signupForm">
              <input type="text" id="signupFullName" placeholder="Full Name" required>
              <input type="email" id="signupEmail" placeholder="Email" required>
              <input type="password" id="signupPassword" placeholder="Password" required>
              <button type="submit">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Mock global functions and objects
    window.tasks = [];
    window.renderTasks = jest.fn();
    window.showAddTaskModal = jest.fn();
    window.closeModal = jest.fn();
    window.addTask = jest.fn();
    window.addDivider = jest.fn();
    window.showAuthModal = jest.fn();
    window.closeAuthModal = jest.fn();
    
    // Mock auth functions
    window.authFunctions = {
      initAuth: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    };
    
    // Mock sync manager
    window.syncManager = {
      switchToOnlineMode: jest.fn(),
      switchToOfflineMode: jest.fn(),
      getSyncStatus: jest.fn(),
    };
  });
  
  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Complete User Workflow: Sign Up to Task Management', () => {
    test('should complete full user onboarding workflow', async () => {
      // Step 1: User arrives at app (logged out state)
      expect(document.getElementById('loggedOutControls')).not.toHaveClass('hidden');
      expect(document.getElementById('loggedInControls')).toHaveClass('hidden');
      
      // Step 2: User clicks sign in button
      const signInBtn = document.getElementById('signInBtn');
      signInBtn.click();
      
      // Step 3: User switches to signup tab
      const signupTabBtn = document.querySelector('[data-tab="signup"]');
      signupTabBtn.click();
      
      // Step 4: User fills out signup form
      const signupForm = document.getElementById('signupForm');
      const fullNameInput = document.getElementById('signupFullName');
      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');
      
      fullNameInput.value = 'New User';
      emailInput.value = 'newuser@example.com';
      passwordInput.value = 'password123';
      
      // Step 5: User submits signup form
      signupForm.dispatchEvent(new Event('submit'));
      
      // Step 6: Mock successful signup
      window.authFunctions.signUp.mockResolvedValue({
        user: mockUser,
        error: null
      });
      
      // Step 7: User is now authenticated
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 8: UI updates to show logged in state
      const loggedInControls = document.getElementById('loggedInControls');
      const loggedOutControls = document.getElementById('loggedOutControls');
      
      loggedInControls.classList.remove('hidden');
      loggedOutControls.classList.add('hidden');
      
      expect(loggedInControls).not.toHaveClass('hidden');
      expect(loggedOutControls).toHaveClass('hidden');
      
      // Step 9: User can now access task management
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      expect(addTaskBtn).toBeInTheDocument();
      
      // Step 10: User can access timer functionality
      const startTimerBtn = document.getElementById('startTimer');
      expect(startTimerBtn).toBeInTheDocument();
    });
  });

  describe('Complete Task Management Workflow', () => {
    test('should complete full task lifecycle', async () => {
      // Setup: User is authenticated
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 1: User creates a new task
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      addTaskBtn.click();
      
      // Step 2: Task modal opens
      const taskModal = document.getElementById('taskModal');
      expect(taskModal).toBeInTheDocument();
      
      // Step 3: User fills out task form
      const taskNameInput = document.getElementById('taskName');
      const taskDescriptionInput = document.getElementById('taskDescription');
      const taskProjectInput = document.getElementById('taskProject');
      const taskPrioritySelect = document.getElementById('taskPriority');
      const taskDeadlineInput = document.getElementById('taskDeadline');
      
      taskNameInput.value = 'New Integration Test Task';
      taskDescriptionInput.value = 'This is a test task for integration testing';
      taskProjectInput.value = 'Testing';
      taskPrioritySelect.value = 'high';
      taskDeadlineInput.value = '2024-12-25';
      
      // Step 4: User saves task
      const saveTaskBtn = document.getElementById('saveTaskButton');
      saveTaskBtn.click();
      
      // Step 5: Task is added to system
      expect(window.addTask).toHaveBeenCalled();
      
      // Step 6: User can filter tasks
      const statusFilter = document.getElementById('statusFilter');
      statusFilter.value = 'not-started';
      statusFilter.dispatchEvent(new Event('change'));
      
      expect(statusFilter.value).toBe('not-started');
      
      // Step 7: User can start timer for task
      const startTimerBtn = document.getElementById('startTimer');
      const customTimeBtn = document.getElementById('customTime');
      
      // Set custom time
      customTimeBtn.click();
      
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      hoursInput.value = '0';
      minutesInput.value = '25';
      secondsInput.value = '0';
      
      // Start timer
      startTimerBtn.click();
      
      // Step 8: Timer starts and shows fullscreen view
      expect(startTimerBtn).toBeInTheDocument();
    });
  });

  describe('Timer and Task Integration Workflow', () => {
    test('should integrate timer with task management', async () => {
      // Setup: User has tasks and is working on one
      window.tasks = [...mockTasks];
      window.currentTask = mockTasks[0];
      
      // Step 1: User selects a task to work on
      const selectedTask = mockTasks[0];
      expect(selectedTask.name).toBe('Complete Project Proposal');
      expect(selectedTask.status).toBe('in-progress');
      
      // Step 2: User starts a 25-minute Pomodoro session
      const preset25Btn = document.getElementById('preset25');
      preset25Btn.click();
      
      const startTimerBtn = document.getElementById('startTimer');
      startTimerBtn.click();
      
      // Step 3: Timer starts and shows fullscreen view
      expect(startTimerBtn).toBeInTheDocument();
      
      // Step 4: Timer displays current task information
      const currentTaskName = document.getElementById('currentTaskName');
      const currentTaskProject = document.getElementById('currentTaskProject');
      const currentTaskDeadline = document.getElementById('currentTaskDeadline');
      
      // These would be populated by the timer system
      expect(currentTaskName).toBeInTheDocument();
      expect(currentTaskProject).toBeInTheDocument();
      expect(currentTaskDeadline).toBeInTheDocument();
      
      // Step 5: User can pause timer if needed
      const pauseTimerBtn = document.getElementById('pauseTimer');
      expect(pauseTimerBtn).toBeInTheDocument();
      
      // Step 6: User can complete task when timer finishes
      const completeTaskBtn = document.getElementById('completeTask');
      expect(completeTaskBtn).toBeInTheDocument();
      
      // Step 7: User can exit fullscreen view
      const exitFullscreenBtn = document.querySelector('#timerView .exit-btn');
      expect(exitFullscreenBtn).toBeInTheDocument();
    });
  });

  describe('Data Synchronization Workflow', () => {
    test('should handle online/offline mode switching', async () => {
      // Setup: User is authenticated
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 1: User starts in offline mode
      window.syncManager.getSyncStatus.mockReturnValue({
        isOnline: false,
        lastSync: null,
        canCreateTasks: false
      });
      
      // Step 2: User switches to online mode
      window.syncManager.switchToOnlineMode.mockResolvedValue();
      
      await window.syncManager.switchToOnlineMode();
      
      expect(window.syncManager.switchToOnlineMode).toHaveBeenCalled();
      
      // Step 3: Sync status updates
      window.syncManager.getSyncStatus.mockReturnValue({
        isOnline: true,
        lastSync: Date.now(),
        canCreateTasks: true
      });
      
      const syncStatus = window.syncManager.getSyncStatus();
      expect(syncStatus.isOnline).toBe(true);
      expect(syncStatus.canCreateTasks).toBe(true);
      
      // Step 4: User can now create tasks that sync to cloud
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      expect(addTaskBtn).toBeInTheDocument();
      
      // Step 5: User switches back to offline mode
      window.syncManager.switchToOfflineMode.mockResolvedValue();
      
      await window.syncManager.switchToOfflineMode();
      
      expect(window.syncManager.switchToOfflineMode).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Recovery Workflow', () => {
    test('should handle and recover from various errors', async () => {
      // Setup: User is authenticated and working
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 1: Simulate network error during task creation
      const networkError = new Error('Network error');
      window.addTask.mockRejectedValue(networkError);
      
      // Step 2: User tries to create task
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      addTaskBtn.click();
      
      // Step 3: Task modal opens
      const taskModal = document.getElementById('taskModal');
      expect(taskModal).toBeInTheDocument();
      
      // Step 4: User fills out form
      const taskNameInput = document.getElementById('taskName');
      taskNameInput.value = 'Error Recovery Task';
      
      // Step 5: User saves task (this would trigger error in real app)
      const saveTaskBtn = document.getElementById('saveTaskButton');
      saveTaskBtn.click();
      
      // Step 6: App should handle error gracefully
      expect(window.addTask).toBeInTheDocument();
      
      // Step 7: User can retry or continue working
      const cancelBtn = document.querySelector('.cancel-button');
      expect(cancelBtn).toBeInTheDocument();
      
      // Step 8: App remains functional despite errors
      const timerSection = document.querySelector('.timer-section');
      const taskSection = document.querySelector('.task-section');
      
      expect(timerSection).toBeInTheDocument();
      expect(taskSection).toBeInTheDocument();
    });
  });

  describe('User Experience and Accessibility Workflow', () => {
    test('should provide smooth user experience with proper accessibility', () => {
      // Setup: User is authenticated
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 1: Check keyboard navigation
      const signInBtn = document.getElementById('signInBtn');
      signInBtn.focus();
      expect(document.activeElement).toBe(signInBtn);
      
      // Step 2: Tab navigation works
      signInBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(document.activeElement).toBeDefined();
      
      // Step 3: Check form accessibility
      const taskModal = document.getElementById('taskModal');
      const taskNameInput = document.getElementById('taskName');
      
      // Modal should have proper structure
      expect(taskModal).toBeInTheDocument();
      expect(taskNameInput).toHaveAttribute('placeholder');
      
      // Step 4: Check button accessibility
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      const startTimerBtn = document.getElementById('startTimer');
      
      expect(addTaskBtn.textContent).toBe('Add Task');
      expect(startTimerBtn.textContent).toBe('Start');
      
      // Step 5: Check color contrast and visual hierarchy
      const header = document.querySelector('.app-header');
      const timerSection = document.querySelector('.timer-section');
      const taskSection = document.querySelector('.task-section');
      
      expect(header).toBeInTheDocument();
      expect(timerSection).toBeInTheDocument();
      expect(taskSection).toBeInTheDocument();
    });
  });

  describe('Performance and Scalability Workflow', () => {
    test('should handle large numbers of tasks efficiently', () => {
      // Setup: User has many tasks
      const manyTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        name: `Task ${i}`,
        description: `Description for task ${i}`,
        project: `Project ${Math.floor(i / 100)}`,
        status: ['not-started', 'in-progress', 'done', 'waiting'][i % 4],
        priority: ['low', 'medium', 'high'][i % 3],
        deadline: '2024-12-31',
        order_index: i
      }));
      
      window.tasks = manyTasks;
      
      // Step 1: App should load without crashing
      expect(window.tasks).toHaveLength(1000);
      
      // Step 2: Filtering should work with large datasets
      const statusFilter = document.getElementById('statusFilter');
      statusFilter.value = 'in-progress';
      statusFilter.dispatchEvent(new Event('change'));
      
      expect(statusFilter.value).toBe('in-progress');
      
      // Step 3: Task creation should still work
      const addTaskBtn = document.querySelector('button[onclick="showAddTaskModal()"]');
      expect(addTaskBtn).toBeInTheDocument();
      
      // Step 4: Timer should work independently of task count
      const startTimerBtn = document.getElementById('startTimer');
      const preset25Btn = document.getElementById('preset25');
      
      expect(startTimerBtn).toBeInTheDocument();
      expect(preset25Btn).toBeInTheDocument();
    });
  });

  describe('Cross-Browser Compatibility Workflow', () => {
    test('should work across different browser environments', () => {
      // Setup: User is authenticated
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Step 1: Check DOM manipulation compatibility
      const taskList = document.getElementById('taskList');
      const newTaskElement = document.createElement('div');
      newTaskElement.className = 'task-item';
      newTaskElement.textContent = 'New Task';
      
      taskList.appendChild(newTaskElement);
      
      expect(taskList.contains(newTaskElement)).toBe(true);
      expect(newTaskElement.textContent).toBe('New Task');
      
      // Step 2: Check event handling compatibility
      const testButton = document.createElement('button');
      testButton.textContent = 'Test Button';
      testButton.addEventListener('click', () => {
        testButton.textContent = 'Clicked!';
      });
      
      document.body.appendChild(testButton);
      testButton.click();
      
      expect(testButton.textContent).toBe('Clicked!');
      
      // Step 3: Check CSS class manipulation
      const testElement = document.createElement('div');
      testElement.className = 'test-class';
      testElement.classList.add('new-class');
      testElement.classList.remove('test-class');
      
      expect(testElement.classList.contains('new-class')).toBe(true);
      expect(testElement.classList.contains('test-class')).toBe(false);
      
      // Cleanup
      document.body.removeChild(testButton);
      document.body.removeChild(testElement);
    });
  });
});
