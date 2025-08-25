let timer;
let timeLeft;
let isRunning = false;
let completedTasks = [];
let currentTask = null;

// Initialize notification permission
async function initializeNotifications() {
    try {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        // Check if we already have permission
        if (Notification.permission === 'granted') {
            return true;
        }

        // If permission is denied, don't ask again
        if (Notification.permission === 'denied') {
            return false;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error initializing notifications:', error);
        return false;
    }
}

async function showNotification() {
    if (!await initializeNotifications()) return;

    try {
        const notification = new Notification('Time is up!', {
            body: 'Your timer has finished!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
            requireInteraction: true,
            silent: false
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        // Play sound regardless of notification permission
        const audio = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
        audio.play();
    } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to just audio if notification fails
        const audio = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
        audio.play();
    }
}

function startTimer() {
    if (!isRunning) {
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        
        timeLeft = (hours * 3600) + (minutes * 60) + seconds;
        
        if (timeLeft > 0) {
            isRunning = true;
            enterFullscreenMode();
            updateCurrentTask();
            timer = setInterval(updateTimer, 1000);
            // Hide the custom time input after starting
            document.querySelector('.timer-input').classList.add('hidden');
        }
    }
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
    } else {
        stopTimer();
        celebrateCompletions();
    }
}

function updateTimerDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    // Update both normal and fullscreen displays
    ['timer', 'fsTimer'].forEach(prefix => {
        const hoursEl = document.getElementById(`${prefix}Hours`)
        const minutesEl = document.getElementById(`${prefix}Minutes`)
        const secondsEl = document.getElementById(`${prefix}Seconds`)
        
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0')
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0')
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0')
    });
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    exitFullscreenMode();
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        
        // Update button text
        const pauseBtn = document.getElementById('pauseTimer');
        if (pauseBtn) {
            pauseBtn.textContent = 'Resume';
            pauseBtn.onclick = resumeTimer;
        }
    }
}

function resumeTimer() {
    if (!isRunning && timeLeft > 0) {
        isRunning = true;
        timer = setInterval(updateTimer, 1000);
        
        // Update button text
        const pauseBtn = document.getElementById('pauseTimer');
        if (pauseBtn) {
            pauseBtn.textContent = 'Pause';
            pauseBtn.onclick = pauseTimer;
        }
    }
}

function resetTimer() {
    stopTimer();
    timeLeft = 0;
    updateTimerDisplay();
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
}

function enterFullscreenMode() {
    document.getElementById('normalView').classList.add('hidden');
    document.getElementById('timerView').classList.remove('hidden');
}

function exitFullscreenMode() {
    document.getElementById('normalView').classList.remove('hidden');
    document.getElementById('timerView').classList.add('hidden');
}

function updateCurrentTask() {
    currentTask = null;
    
    let taskToUse = null;
    
    // First, try to get next task from queue
    if (window.queue && window.queue.length > 0) {
        // Sort queue by order
        const sortedQueue = [...window.queue].sort((a, b) => a.order - b.order);
        
        // Find first incomplete task in queue
        for (const queueItem of sortedQueue) {
            const task = window.tasks?.find(t => t.id === queueItem.id);
            if (task && task.type !== 'divider' && task.status !== 'done') {
                taskToUse = task;
                break;
            }
        }
    }
    
    // If no task found in queue, fall back to first incomplete task from main list
    if (!taskToUse && window.tasks) {
        const availableTasks = window.tasks.filter(task => 
            task.type !== 'divider' && 
            task.status !== 'done'
        );
        
        if (availableTasks.length > 0) {
            taskToUse = availableTasks[0];
        }
    }
    
    // Set current task
    if (taskToUse) {
        currentTask = {
            id: taskToUse.id || taskToUse.supabaseId,
            name: taskToUse.name,
            description: taskToUse.description || '',
            project: taskToUse.project || '',
            deadline: taskToUse.deadline || ''
        };
    }

    // Update UI
    const nameEl = document.getElementById('currentTaskName');
    const descriptionEl = document.getElementById('currentTaskDescription');
    const projectEl = document.getElementById('currentTaskProject');
    const deadlineEl = document.getElementById('currentTaskDeadline');
    const completeBtn = document.getElementById('completeTask');
    
    if (currentTask && nameEl) {
        nameEl.textContent = currentTask.name;
        if (descriptionEl) descriptionEl.textContent = currentTask.description || '';
        if (projectEl) projectEl.textContent = currentTask.project || '';
        if (deadlineEl) deadlineEl.textContent = currentTask.deadline;
        if (completeBtn) completeBtn.classList.remove('hidden');
    } else {
        if (nameEl) nameEl.textContent = 'No tasks remaining';
        if (descriptionEl) descriptionEl.textContent = '';
        if (projectEl) projectEl.textContent = '';
        if (deadlineEl) deadlineEl.textContent = '';
        if (completeBtn) completeBtn.classList.add('hidden');
    }
}

async function completeTask() {
    if (!currentTask) return;
    
    completedTasks.push(currentTask);
    
    try {
        // Update task status in Supabase if online
        if (window.syncManager && window.syncManager.getSyncStatus().isOnline) {
            await window.syncManager.updateTask(currentTask.id, { status: 'done' });
        } else {
            // Fallback: call legacy function
            if (typeof window.completeTask === 'function') {
                window.completeTask(parseInt(currentTask.id));
            }
        }
        
        updateCurrentTask();
        
        // Track in focus session
        if (window.focusSession) {
            window.focusSession.onTaskCompleted(currentTask.id)
        }
        
    } catch (error) {
        console.error('Error completing task:', error);
        // Remove from completed tasks if failed
        completedTasks = completedTasks.filter(t => t.id !== currentTask.id);
        alert('Failed to complete task: ' + error.message);
    }
}

function skipTask() {
    // Simply move to the next task without marking as complete
    updateCurrentTask();
    
    // Track in focus session
    if (window.focusSession) {
        window.focusSession.onTaskSkipped && window.focusSession.onTaskSkipped(currentTask?.id)
    }
}

function undoComplete() {
    if (completedTasks.length > 0) {
        const lastTask = completedTasks.pop();
        
        // We don't have a direct undoComplete in tasks.js, so we'll update the task manually
        // Find the task in the tasks array and update its status
        if (typeof window.tasks !== 'undefined' && typeof window.saveTasks === 'function') {
            const taskId = parseInt(lastTask.id);
            const taskIndex = window.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                window.tasks[taskIndex].status = 'in-progress';
                window.saveTasks(); // Save to localStorage
            }
        }
        
        // Update the DOM element
        const taskElement = document.querySelector(`[data-id="${lastTask.id}"]`);
        if (taskElement) {
            taskElement.dataset.status = 'in-progress';
        }
        
        // Update UI
        document.getElementById('undoComplete').classList.add('hidden');
        document.getElementById('completeTask').classList.remove('hidden');
        updateCurrentTask();
    }
}

function celebrateCompletions() {
    if (completedTasks.length > 0) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        completedTasks = [];
    }
}

// Event Listeners
document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('resetTimer').addEventListener('click', resetTimer);
document.getElementById('exitFullscreen').addEventListener('click', stopTimer);
document.getElementById('stopTimer').addEventListener('click', stopTimer);
document.getElementById('completeTask').addEventListener('click', completeTask);
document.getElementById('skipTask').addEventListener('click', skipTask);

// Preset buttons
document.getElementById('preset5').addEventListener('click', () => {
    selectPresetButton('preset5');
    document.getElementById('minutes').value = '5';
    document.getElementById('seconds').value = '0';
});
document.getElementById('preset15').addEventListener('click', () => {
    selectPresetButton('preset15');
    document.getElementById('minutes').value = '15';
    document.getElementById('seconds').value = '0';
});
document.getElementById('preset25').addEventListener('click', () => {
    selectPresetButton('preset25');
    document.getElementById('minutes').value = '25';
    document.getElementById('seconds').value = '0';
});

// Add this after the preset buttons event listeners
document.getElementById('customTime').addEventListener('click', () => {
    selectPresetButton('customTime');
    const timerInput = document.querySelector('.timer-input');
    timerInput.classList.toggle('hidden');
    if (!timerInput.classList.contains('hidden')) {
        timerInput.classList.add('animate__animated', 'animate__slideInDown');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize notifications first
    await initializeNotifications();
    
    // Access the tasks array from the global scope
    if (typeof window.tasks === 'undefined') {
        // If tasks.js hasn't loaded yet, create a reference
        Object.defineProperty(window, 'tasks', {
            get: function() { return window.tasks || []; },
            set: function(value) { window.tasks = value; },
            configurable: true
        });
    }
    
    // Timer controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    
    // Preset buttons
    document.getElementById('preset5').addEventListener('click', () => setPresetTime(5));
    document.getElementById('preset15').addEventListener('click', () => setPresetTime(15));
    document.getElementById('preset25').addEventListener('click', () => setPresetTime(25));
    
    // Time input handlers
    const timeInputs = ['hours', 'minutes', 'seconds'];
    timeInputs.forEach(id => {
        const input = document.getElementById(id);
        
        // Update on blur (when input loses focus)
        input.addEventListener('blur', () => {
            // Ensure value is within valid range
            let value = parseInt(input.value) || 0;
            const max = parseInt(input.getAttribute('max'));
            if (value > max) value = max;
            if (value < 0) value = 0;
            
            input.value = value || ''; // Show empty string instead of 0
            updateTimeFromInputs();
        });
        
        // Handle keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    // Pre-select the 5 min button
    selectPresetButton('preset5');
    document.getElementById('minutes').value = '5';
    document.getElementById('seconds').value = '0';
});

// Function to save tasks to localStorage (referencing the one in tasks.js)
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add this function to select a preset button and update its styling
function selectPresetButton(buttonId) {
    // Remove active class from all preset buttons
    document.querySelectorAll('.preset-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the selected button
    document.getElementById(buttonId).classList.add('active');
}

// Set preset time function
function setPresetTime(minutes) {
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = minutes;
    document.getElementById('seconds').value = '0';
    selectPresetButton(`preset${minutes}`);
}

// Update time from inputs function
function updateTimeFromInputs() {
    // This function can be used to update display or validation
    // For now, we'll just ensure the values are valid
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    
    // Could add validation or other logic here if needed
} 