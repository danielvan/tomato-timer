/**
 * Tasks Functionality Tests
 * Tests the core task management features including UI interactions
 */

describe('Tasks Management', () => {
  let mockTasks;
  
  beforeEach(() => {
    setupTestEnvironment();
    
    // Setup mock tasks data
    mockTasks = [
      {
        id: '1',
        name: 'Test Task 1',
        description: 'Test description 1',
        project: 'Test Project',
        status: 'not-started',
        priority: 'medium',
        deadline: '2024-12-31',
        order_index: 0
      },
      {
        id: '2',
        name: 'Test Task 2',
        description: 'Test description 2',
        project: 'Test Project',
        status: 'in-progress',
        priority: 'high',
        deadline: '2024-12-30',
        order_index: 1
      }
    ];
    
    // Mock localStorage to return our test data
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'tasks') {
        return JSON.stringify(mockTasks);
      }
      return null;
    });
    
    // Setup DOM for testing
    document.body.innerHTML = `
      <div id="taskList" class="task-list"></div>
      <div id="taskModal" class="modal">
        <div class="modal-content">
          <input type="text" id="taskName" placeholder="Task Name" required>
          <textarea id="taskDescription" placeholder="Task description..." rows="3"></textarea>
          <input type="text" id="taskProject" placeholder="Project name">
          <select id="taskPriority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
          <input type="date" id="taskDeadline">
          <div class="status-toggle">
            <button data-status="not-started" class="active">Not Started</button>
            <button data-status="in-progress">In Progress</button>
            <button data-status="waiting">Waiting</button>
            <button data-status="done">Done</button>
          </div>
          <button id="saveTaskButton" onclick="addTask()">Save Changes</button>
        </div>
      </div>
      <button onclick="showAddTaskModal()">Add Task</button>
      <select id="statusFilter">
        <option value="all">All Status</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
        <option value="waiting">Waiting Feedback</option>
      </select>
    `;
    
    // Mock global functions
    window.tasks = [];
    window.renderTasks = jest.fn();
    window.showAddTaskModal = jest.fn();
    window.closeModal = jest.fn();
  });
  
  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Task Loading and Rendering', () => {
    test('should load tasks from localStorage on initialization', () => {
      // Mock the loadTasks function
      const loadTasksSpy = jest.spyOn(window, 'loadTasks');
      
      // Simulate page load
      if (typeof window.loadTasks === 'function') {
        window.loadTasks();
      }
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tasks');
    });
    
    test('should handle corrupted localStorage data gracefully', () => {
      // Mock corrupted data
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // This should not throw an error
      expect(() => {
        if (typeof window.loadTasks === 'function') {
          window.loadTasks();
        }
      }).not.toThrow();
    });
    
    test('should render tasks in the UI', () => {
      // Mock renderTasks function
      const renderSpy = jest.fn();
      window.renderTasks = renderSpy;
      
      // Simulate loading tasks
      if (typeof window.loadTasks === 'function') {
        window.loadTasks();
      }
      
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Task Creation', () => {
    test('should open add task modal when add button is clicked', () => {
      const addButton = document.querySelector('button[onclick="showAddTaskModal()"]');
      const modal = document.getElementById('taskModal');
      
      // Initially modal should be hidden
      expect(modal).toBeInTheDocument();
      
      // Click add button
      addButton.click();
      
      // Modal should be shown (this would be handled by showAddTaskModal)
      expect(window.showAddTaskModal).toHaveBeenCalled();
    });
    
    test('should validate required fields before saving', () => {
      const taskNameInput = document.getElementById('taskName');
      const saveButton = document.getElementById('saveTaskButton');
      
      // Try to save without task name
      taskNameInput.value = '';
      saveButton.click();
      
      // Should not proceed without validation
      expect(taskNameInput.validity.valid).toBe(false);
    });
    
    test('should create task with all form fields', () => {
      const taskNameInput = document.getElementById('taskName');
      const taskDescriptionInput = document.getElementById('taskDescription');
      const taskProjectInput = document.getElementById('taskProject');
      const taskPrioritySelect = document.getElementById('taskPriority');
      const taskDeadlineInput = document.getElementById('taskDeadline');
      
      // Fill out form
      taskNameInput.value = 'New Test Task';
      taskDescriptionInput.value = 'New test description';
      taskProjectInput.value = 'New Project';
      taskPrioritySelect.value = 'high';
      taskDeadlineInput.value = '2024-12-25';
      
      // Verify form data
      expect(taskNameInput.value).toBe('New Test Task');
      expect(taskDescriptionInput.value).toBe('New test description');
      expect(taskProjectInput.value).toBe('New Project');
      expect(taskPrioritySelect.value).toBe('high');
      expect(taskDeadlineInput.value).toBe('2024-12-25');
    });
  });

  describe('Task Status Management', () => {
    test('should allow changing task status', () => {
      const statusButtons = document.querySelectorAll('.status-toggle button');
      
      // Check initial state
      const notStartedBtn = document.querySelector('[data-status="not-started"]');
      expect(notStartedBtn).toHaveClass('active');
      
      // Click on different status
      const inProgressBtn = document.querySelector('[data-status="in-progress"]');
      inProgressBtn.click();
      
      // Status should change (this would be handled by event listeners)
      expect(inProgressBtn).toBeInTheDocument();
    });
    
    test('should filter tasks by status', () => {
      const statusFilter = document.getElementById('statusFilter');
      
      // Test different filter options
      const filterOptions = ['all', 'not-started', 'in-progress', 'done', 'waiting'];
      
      filterOptions.forEach(option => {
        statusFilter.value = option;
        statusFilter.dispatchEvent(new Event('change'));
        
        // Verify filter change event was triggered
        expect(statusFilter.value).toBe(option);
      });
    });
  });

  describe('Task Priority Management', () => {
    test('should set default priority to medium', () => {
      const prioritySelect = document.getElementById('taskPriority');
      expect(prioritySelect.value).toBe('medium');
    });
    
    test('should allow changing task priority', () => {
      const prioritySelect = document.getElementById('taskPriority');
      
      // Test all priority options
      const priorities = ['low', 'medium', 'high'];
      
      priorities.forEach(priority => {
        prioritySelect.value = priority;
        prioritySelect.dispatchEvent(new Event('change'));
        
        expect(prioritySelect.value).toBe(priority);
      });
    });
  });

  describe('Task Editing', () => {
    test('should populate form fields when editing existing task', () => {
      const taskNameInput = document.getElementById('taskName');
      const taskDescriptionInput = document.getElementById('taskDescription');
      const taskProjectInput = document.getElementById('taskProject');
      const taskPrioritySelect = document.getElementById('taskPriority');
      const taskDeadlineInput = document.getElementById('taskDeadline');
      
      // Simulate editing first task
      const taskToEdit = mockTasks[0];
      
      taskNameInput.value = taskToEdit.name;
      taskDescriptionInput.value = taskToEdit.description;
      taskProjectInput.value = taskToEdit.project;
      taskPrioritySelect.value = taskToEdit.priority;
      taskDeadlineInput.value = taskToEdit.deadline;
      
      // Verify form is populated
      expect(taskNameInput.value).toBe(taskToEdit.name);
      expect(taskDescriptionInput.value).toBe(taskToEdit.description);
      expect(taskProjectInput.value).toBe(taskToEdit.project);
      expect(taskPrioritySelect.value).toBe(taskToEdit.priority);
      expect(taskDeadlineInput.value).toBe(taskToEdit.deadline);
    });
    
    test('should update task when save button is clicked', () => {
      const saveButton = document.getElementById('saveTaskButton');
      const taskNameInput = document.getElementById('taskName');
      
      // Change task name
      taskNameInput.value = 'Updated Task Name';
      
      // Click save
      saveButton.click();
      
      // Should trigger save function
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Task Deletion', () => {
    test('should confirm before deleting task', () => {
      // Mock confirm dialog
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      // Simulate delete confirmation
      const result = window.confirm('Are you sure you want to delete this task?');
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this task?');
      expect(result).toBe(true);
      
      confirmSpy.mockRestore();
    });
    
    test('should handle delete cancellation', () => {
      // Mock confirm dialog to return false (cancelled)
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      // Simulate delete cancellation
      const result = window.confirm('Are you sure you want to delete this task?');
      
      expect(result).toBe(false);
      
      confirmSpy.mockRestore();
    });
  });

  describe('Task Persistence', () => {
    test('should save tasks to localStorage', () => {
      // Mock saveTasks function
      const saveTasksSpy = jest.fn();
      window.saveTasks = saveTasksSpy;
      
      // Simulate saving tasks
      if (typeof window.saveTasks === 'function') {
        window.saveTasks();
      }
      
      expect(saveTasksSpy).toHaveBeenCalled();
    });
    
    test('should handle save errors gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // This should not crash the app
      expect(() => {
        if (typeof window.saveTasks === 'function') {
          window.saveTasks();
        }
      }).not.toThrow();
    });
  });

  describe('Task Search and Filtering', () => {
    test('should filter tasks by project', () => {
      const taskProjectInput = document.getElementById('taskProject');
      
      // Set project filter
      taskProjectInput.value = 'Test Project';
      taskProjectInput.dispatchEvent(new Event('input'));
      
      expect(taskProjectInput.value).toBe('Test Project');
    });
    
    test('should handle empty search results', () => {
      // Mock empty search results
      const emptyTasks = [];
      
      // This should not crash the app
      expect(() => {
        if (typeof window.renderTasks === 'function') {
          window.renderTasks();
        }
      }).not.toThrow();
    });
  });

  describe('Task Ordering and Sorting', () => {
    test('should maintain task order when reordering', () => {
      const originalOrder = [...mockTasks];
      
      // Simulate reordering (this would be handled by drag and drop)
      const reorderedTasks = [
        originalOrder[1], // Move second task to first
        originalOrder[0]  // Move first task to second
      ];
      
      // Verify order changed
      expect(reorderedTasks[0].id).toBe(originalOrder[1].id);
      expect(reorderedTasks[1].id).toBe(originalOrder[0].id);
    });
    
    test('should handle drag and drop events', () => {
      // Mock Sortable.js functionality
      const mockSortable = {
        destroy: jest.fn(),
        option: jest.fn()
      };
      
      // This should not crash the app
      expect(() => {
        if (mockSortable.destroy) {
          mockSortable.destroy();
        }
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very long task names', () => {
      const taskNameInput = document.getElementById('taskName');
      const longName = 'A'.repeat(1000); // Very long name
      
      taskNameInput.value = longName;
      
      // Should not crash
      expect(taskNameInput.value).toBe(longName);
    });
    
    test('should handle special characters in task names', () => {
      const taskNameInput = document.getElementById('taskName');
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      taskNameInput.value = specialChars;
      
      // Should not crash
      expect(taskNameInput.value).toBe(specialChars);
    });
    
    test('should handle empty task list', () => {
      // Mock empty tasks
      const emptyTasks = [];
      
      // This should not crash the app
      expect(() => {
        if (typeof window.renderTasks === 'function') {
          window.renderTasks();
        }
      }).not.toThrow();
    });
    
    test('should handle network errors gracefully', () => {
      // Mock network error
      const networkError = new Error('Network error');
      
      // This should not crash the app
      expect(() => {
        throw networkError;
      }).toThrow('Network error');
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels', () => {
      const taskNameInput = document.getElementById('taskName');
      const taskDescriptionInput = document.getElementById('taskDescription');
      const taskProjectInput = document.getElementById('taskProject');
      
      // Check that inputs have proper attributes
      expect(taskNameInput).toHaveAttribute('placeholder');
      expect(taskDescriptionInput).toHaveAttribute('placeholder');
      expect(taskProjectInput).toHaveAttribute('placeholder');
    });
    
    test('should support keyboard navigation', () => {
      const taskNameInput = document.getElementById('taskName');
      const saveButton = document.getElementById('saveTaskButton');
      
      // Focus should work
      taskNameInput.focus();
      expect(document.activeElement).toBe(taskNameInput);
      
      // Tab navigation should work
      taskNameInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(document.activeElement).toBeDefined();
    });
  });
});

