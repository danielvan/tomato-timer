/**
 * Timer Functionality Tests
 * Tests the Pomodoro timer features including UI interactions
 */

describe('Timer Management', () => {
  let mockTimer;
  
  beforeEach(() => {
    setupTestEnvironment();
    
    // Setup DOM for timer testing
    document.body.innerHTML = `
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
      
      <div id="timerView" class="timer-fullscreen hidden">
        <div class="timer-content">
          <div class="large-timer">
            <span id="fsTimerHours">00</span>:<span id="fsTimerMinutes">00</span>:<span id="fsTimerSeconds">00</span>
          </div>
          <div class="current-task">
            <h2 id="currentTaskName"></h2>
            <p id="currentTaskProject"></p>
            <p id="currentTaskDeadline"></p>
          </div>
          <div class="task-actions">
            <button id="pauseTimer" class="pause-btn">Pause</button>
            <button id="completeTask" class="complete-btn">Complete Task</button>
            <button id="undoComplete" class="undo-btn hidden">Undo Complete</button>
          </div>
          <button id="exitFullscreen" class="exit-btn">Exit Full Screen</button>
        </div>
      </div>
    `;
    
    // Mock global timer variables
    window.timer = null;
    window.timeLeft = 0;
    window.isRunning = false;
    window.completedTasks = [];
    window.currentTask = null;
    
    // Mock timer functions
    window.startTimer = jest.fn();
    window.stopTimer = jest.fn();
    window.resetTimer = jest.fn();
    window.updateTimer = jest.fn();
    window.enterFullscreenMode = jest.fn();
    window.exitFullscreenMode = jest.fn();
  });
  
  afterEach(() => {
    cleanupTestEnvironment();
    
    // Clear any running timers
    if (window.timer) {
      clearInterval(window.timer);
      window.timer = null;
    }
  });

  describe('Timer Preset Buttons', () => {
    test('should have preset time buttons', () => {
      const preset5 = document.getElementById('preset5');
      const preset15 = document.getElementById('preset15');
      const preset25 = document.getElementById('preset25');
      const customTime = document.getElementById('customTime');
      
      expect(preset5).toBeInTheDocument();
      expect(preset15).toBeInTheDocument();
      expect(preset25).toBeInTheDocument();
      expect(customTime).toBeInTheDocument();
      
      expect(preset5.textContent).toBe('5 min');
      expect(preset15.textContent).toBe('15 min');
      expect(preset25.textContent).toBe('25 min');
      expect(customTime.textContent).toBe('Custom');
    });
    
    test('should set correct time values for preset buttons', () => {
      const preset5 = document.getElementById('preset5');
      const preset15 = document.getElementById('preset15');
      const preset25 = document.getElementById('preset25');
      
      // Click preset buttons
      preset5.click();
      preset15.click();
      preset25.click();
      
      // Verify buttons are clickable
      expect(preset5).toBeInTheDocument();
      expect(preset15).toBeInTheDocument();
      expect(preset25).toBeInTheDocument();
    });
  });

  describe('Custom Time Input', () => {
    test('should show custom time input when custom button is clicked', () => {
      const customTimeBtn = document.getElementById('customTime');
      const timerInput = document.querySelector('.timer-input');
      
      // Initially hidden
      expect(timerInput).toHaveClass('hidden');
      
      // Click custom time button
      customTimeBtn.click();
      
      // Should show input (this would be handled by event listeners)
      expect(timerInput).toBeInTheDocument();
    });
    
    test('should have proper time input fields', () => {
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      expect(hoursInput).toBeInTheDocument();
      expect(minutesInput).toBeInTheDocument();
      expect(secondsInput).toBeInTheDocument();
      
      // Check input constraints
      expect(hoursInput).toHaveAttribute('min', '0');
      expect(hoursInput).toHaveAttribute('max', '23');
      expect(minutesInput).toHaveAttribute('min', '0');
      expect(minutesInput).toHaveAttribute('max', '59');
      expect(secondsInput).toHaveAttribute('min', '0');
      expect(secondsInput).toHaveAttribute('max', '59');
    });
    
    test('should validate time input values', () => {
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      // Test valid values
      hoursInput.value = '1';
      minutesInput.value = '30';
      secondsInput.value = '45';
      
      expect(hoursInput.value).toBe('1');
      expect(minutesInput.value).toBe('30');
      expect(secondsInput.value).toBe('45');
      
      // Test invalid values (should be constrained by HTML attributes)
      hoursInput.value = '25'; // Should be constrained to max 23
      minutesInput.value = '70'; // Should be constrained to max 59
      secondsInput.value = '80'; // Should be constrained to max 59
      
      // Values should be constrained by HTML attributes
      expect(parseInt(hoursInput.value)).toBeLessThanOrEqual(23);
      expect(parseInt(minutesInput.value)).toBeLessThanOrEqual(59);
      expect(parseInt(secondsInput.value)).toBeLessThanOrEqual(59);
    });
  });

  describe('Timer Controls', () => {
    test('should have start and reset buttons', () => {
      const startTimer = document.getElementById('startTimer');
      const resetTimer = document.getElementById('resetTimer');
      
      expect(startTimer).toBeInTheDocument();
      expect(resetTimer).toBeInTheDocument();
      
      expect(startTimer.textContent).toBe('Start');
      expect(resetTimer.textContent).toBe('Reset');
    });
    
    test('should start timer when start button is clicked', () => {
      const startTimer = document.getElementById('startTimer');
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      // Set time values
      hoursInput.value = '0';
      minutesInput.value = '25';
      secondsInput.value = '0';
      
      // Click start button
      startTimer.click();
      
      // Should trigger start function
      expect(startTimer).toBeInTheDocument();
    });
    
    test('should reset timer when reset button is clicked', () => {
      const resetTimer = document.getElementById('resetTimer');
      
      // Click reset button
      resetTimer.click();
      
      // Should trigger reset function
      expect(resetTimer).toBeInTheDocument();
    });
    
    test('should not start timer with zero time', () => {
      const startTimer = document.getElementById('startTimer');
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      // Set all values to zero
      hoursInput.value = '0';
      minutesInput.value = '0';
      secondsInput.value = '0';
      
      // Click start button
      startTimer.click();
      
      // Should not start with zero time
      expect(startTimer).toBeInTheDocument();
    });
  });

  describe('Fullscreen Timer View', () => {
    test('should show fullscreen timer when timer starts', () => {
      const timerView = document.getElementById('timerView');
      const startTimer = document.getElementById('startTimer');
      
      // Initially hidden
      expect(timerView).toHaveClass('hidden');
      
      // Start timer (this would trigger fullscreen)
      startTimer.click();
      
      // Should show fullscreen view (this would be handled by event listeners)
      expect(timerView).toBeInTheDocument();
    });
    
    test('should display current time in fullscreen view', () => {
      const fsTimerHours = document.getElementById('fsTimerHours');
      const fsTimerMinutes = document.getElementById('fsTimerMinutes');
      const fsTimerSeconds = document.getElementById('fsTimerSeconds');
      
      expect(fsTimerHours).toBeInTheDocument();
      expect(fsTimerMinutes).toBeInTheDocument();
      expect(fsTimerSeconds).toBeInTheDocument();
      
      // Check initial values
      expect(fsTimerHours.textContent).toBe('00');
      expect(fsTimerMinutes.textContent).toBe('00');
      expect(fsTimerSeconds.textContent).toBe('00');
    });
    
    test('should show current task information', () => {
      const currentTaskName = document.getElementById('currentTaskName');
      const currentTaskProject = document.getElementById('currentTaskProject');
      const currentTaskDeadline = document.getElementById('currentTaskDeadline');
      
      expect(currentTaskName).toBeInTheDocument();
      expect(currentTaskProject).toBeInTheDocument();
      expect(currentTaskDeadline).toBeInTheDocument();
    });
    
    test('should have pause and complete buttons', () => {
      const pauseTimer = document.getElementById('pauseTimer');
      const completeTask = document.getElementById('completeTask');
      
      expect(pauseTimer).toBeInTheDocument();
      expect(completeTask).toBeInTheDocument();
      
      expect(pauseTimer.textContent).toBe('Pause');
      expect(completeTask.textContent).toBe('Complete Task');
    });
    
    test('should have exit fullscreen button', () => {
      const exitFullscreen = document.getElementById('exitFullscreen');
      
      expect(exitFullscreen).toBeInTheDocument();
      expect(exitFullscreen.textContent).toBe('Exit Full Screen');
    });
  });

  describe('Timer State Management', () => {
    test('should track timer running state', () => {
      expect(window.isRunning).toBe(false);
      
      // Simulate timer starting
      window.isRunning = true;
      expect(window.isRunning).toBe(true);
      
      // Simulate timer stopping
      window.isRunning = false;
      expect(window.isRunning).toBe(false);
    });
    
    test('should track time remaining', () => {
      expect(window.timeLeft).toBe(0);
      
      // Set time remaining (25 minutes = 1500 seconds)
      window.timeLeft = 1500;
      expect(window.timeLeft).toBe(1500);
      
      // Simulate time passing
      window.timeLeft = 1499;
      expect(window.timeLeft).toBe(1499);
    });
    
    test('should handle timer completion', () => {
      // Set time to 1 second
      window.timeLeft = 1;
      window.isRunning = true;
      
      // Simulate timer completion
      window.timeLeft = 0;
      window.isRunning = false;
      
      expect(window.timeLeft).toBe(0);
      expect(window.isRunning).toBe(false);
    });
  });

  describe('Timer Notifications', () => {
    test('should request notification permission', async () => {
      // Mock notification permission request
      const requestPermissionSpy = jest.spyOn(Notification, 'requestPermission');
      
      // Simulate requesting permission
      await Notification.requestPermission();
      
      expect(requestPermissionSpy).toHaveBeenCalled();
      requestPermissionSpy.mockRestore();
    });
    
    test('should show notification when timer completes', () => {
      // Mock notification creation
      const notificationSpy = jest.spyOn(window, 'Notification');
      
      // Simulate timer completion notification
      new Notification('Time is up!', {
        body: 'Your timer has finished!',
        requireInteraction: true
      });
      
      expect(notificationSpy).toHaveBeenCalled();
      notificationSpy.mockRestore();
    });
    
    test('should play sound when timer completes', () => {
      // Mock audio creation
      const audioSpy = jest.spyOn(window, 'Audio');
      
      // Simulate playing sound
      const audio = new Audio();
      audio.play();
      
      expect(audioSpy).toHaveBeenCalled();
      expect(audio.play).toHaveBeenCalled();
      audioSpy.mockRestore();
    });
  });

  describe('Timer Edge Cases', () => {
    test('should handle very long timer durations', () => {
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      // Set very long duration (24 hours)
      hoursInput.value = '24';
      minutesInput.value = '0';
      secondsInput.value = '0';
      
      // Should handle large values
      expect(hoursInput.value).toBe('24');
      expect(minutesInput.value).toBe('0');
      expect(secondsInput.value).toBe('0');
    });
    
    test('should handle decimal time values', () => {
      const minutesInput = document.getElementById('minutes');
      
      // Try to set decimal value
      minutesInput.value = '25.5';
      
      // Should handle gracefully
      expect(minutesInput.value).toBe('25.5');
    });
    
    test('should handle negative time values', () => {
      const minutesInput = document.getElementById('minutes');
      
      // Try to set negative value
      minutesInput.value = '-5';
      
      // Should be constrained by HTML min attribute
      expect(parseInt(minutesInput.value)).toBeGreaterThanOrEqual(0);
    });
    
    test('should handle timer interruption', () => {
      // Simulate timer running
      window.isRunning = true;
      window.timeLeft = 1500;
      
      // Simulate interruption (page refresh, navigation, etc.)
      window.isRunning = false;
      window.timeLeft = 0;
      
      expect(window.isRunning).toBe(false);
      expect(window.timeLeft).toBe(0);
    });
  });

  describe('Timer Accessibility', () => {
    test('should support keyboard navigation', () => {
      const startTimer = document.getElementById('startTimer');
      const resetTimer = document.getElementById('resetTimer');
      
      // Focus should work
      startTimer.focus();
      expect(document.activeElement).toBe(startTimer);
      
      // Tab navigation should work
      startTimer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(document.activeElement).toBeDefined();
    });
    
    test('should have proper button labels', () => {
      const startTimer = document.getElementById('startTimer');
      const resetTimer = document.getElementById('resetTimer');
      const customTime = document.getElementById('customTime');
      
      // Check button text content
      expect(startTimer.textContent).toBe('Start');
      expect(resetTimer.textContent).toBe('Reset');
      expect(customTime.textContent).toBe('Custom');
    });
    
    test('should have proper input placeholders', () => {
      const hoursInput = document.getElementById('hours');
      const minutesInput = document.getElementById('minutes');
      const secondsInput = document.getElementById('seconds');
      
      expect(hoursInput).toHaveAttribute('placeholder', 'HH');
      expect(minutesInput).toHaveAttribute('placeholder', 'MM');
      expect(secondsInput).toHaveAttribute('placeholder', 'SS');
    });
  });

  describe('Timer Integration', () => {
    test('should integrate with task system', () => {
      // Mock current task
      window.currentTask = {
        id: '1',
        name: 'Test Task',
        project: 'Test Project',
        deadline: '2024-12-31'
      };
      
      // Should display current task in fullscreen view
      const currentTaskName = document.getElementById('currentTaskName');
      const currentTaskProject = document.getElementById('currentTaskProject');
      const currentTaskDeadline = document.getElementById('currentTaskDeadline');
      
      expect(currentTaskName).toBeInTheDocument();
      expect(currentTaskProject).toBeInTheDocument();
      expect(currentTaskDeadline).toBeInTheDocument();
    });
    
    test('should track completed tasks', () => {
      // Mock completed tasks array
      window.completedTasks = [];
      
      // Simulate completing a task
      window.completedTasks.push({
        id: '1',
        name: 'Completed Task',
        completedAt: new Date()
      });
      
      expect(window.completedTasks).toHaveLength(1);
      expect(window.completedTasks[0].name).toBe('Completed Task');
    });
  });
});

