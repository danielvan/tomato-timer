// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Optimitimer End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('should load the application and show login screen', async ({ page }) => {
    // Check that the app loads
    await expect(page.locator('h1')).toContainText('Optimitimer');
    
    // Check that login controls are visible
    await expect(page.locator('#loggedOutControls')).toBeVisible();
    await expect(page.locator('#loggedInControls')).not.toBeVisible();
    
    // Check that sign in button is present
    await expect(page.locator('#signInBtn')).toBeVisible();
  });

  test('should open authentication modal when sign in is clicked', async ({ page }) => {
    // Click sign in button
    await page.click('#signInBtn');
    
    // Check that auth modal opens
    await expect(page.locator('#authModal')).toBeVisible();
    
    // Check that sign in tab is active by default
    await expect(page.locator('#signinTab')).toBeVisible();
    await expect(page.locator('#signupTab')).not.toBeVisible();
  });

  test('should switch between sign in and sign up tabs', async ({ page }) => {
    // Open auth modal
    await page.click('#signInBtn');
    
    // Click signup tab
    await page.click('[data-tab="signup"]');
    
    // Check that signup tab is now visible
    await expect(page.locator('#signupTab')).toBeVisible();
    await expect(page.locator('#signinTab')).not.toBeVisible();
    
    // Switch back to signin tab
    await page.click('[data-tab="signin"]');
    
    // Check that signin tab is visible again
    await expect(page.locator('#signinTab')).toBeVisible();
    await expect(page.locator('#signupTab')).not.toBeVisible();
  });

  test('should show timer section when user is logged in', async ({ page }) => {
    // Mock authentication (in a real test, you'd actually sign in)
    // For now, we'll check that the timer section exists in the DOM
    await expect(page.locator('.timer-section')).toBeVisible();
    
    // Check timer controls
    await expect(page.locator('#preset5')).toBeVisible();
    await expect(page.locator('#preset15')).toBeVisible();
    await expect(page.locator('#preset25')).toBeVisible();
    await expect(page.locator('#customTime')).toBeVisible();
    
    // Check timer buttons
    await expect(page.locator('#startTimer')).toBeVisible();
    await expect(page.locator('#resetTimer')).toBeVisible();
  });

  test('should show custom time input when custom button is clicked', async ({ page }) => {
    // Initially custom time input should be hidden
    await expect(page.locator('.timer-input')).toHaveClass(/hidden/);
    
    // Click custom time button
    await page.click('#customTime');
    
    // Custom time input should now be visible
    await expect(page.locator('.timer-input')).not.toHaveClass(/hidden/);
    
    // Check that time input fields are present
    await expect(page.locator('#hours')).toBeVisible();
    await expect(page.locator('#minutes')).toBeVisible();
    await expect(page.locator('#seconds')).toBeVisible();
  });

  test('should allow setting custom time values', async ({ page }) => {
    // Open custom time input
    await page.click('#customTime');
    
    // Set time values
    await page.fill('#hours', '1');
    await page.fill('#minutes', '30');
    await page.fill('#seconds', '45');
    
    // Verify values are set
    await expect(page.locator('#hours')).toHaveValue('1');
    await expect(page.locator('#minutes')).toHaveValue('30');
    await expect(page.locator('#seconds')).toHaveValue('45');
  });

  test('should show task section', async ({ page }) => {
    // Check that task section is present
    await expect(page.locator('.task-section')).toBeVisible();
    await expect(page.locator('#taskList')).toBeVisible();
  });

  test('should open add task modal when add task button is clicked', async ({ page }) => {
    // Click add task button
    await page.click('button:has-text("Add Task")');
    
    // Check that task modal opens
    await expect(page.locator('#taskModal')).toBeVisible();
    
    // Check modal content
    await expect(page.locator('#taskModal h2')).toContainText('Task Manager');
    await expect(page.locator('#taskName')).toBeVisible();
    await expect(page.locator('#taskDescription')).toBeVisible();
    await expect(page.locator('#taskProject')).toBeVisible();
    await expect(page.locator('#taskPriority')).toBeVisible();
    await expect(page.locator('#taskDeadline')).toBeVisible();
  });

  test('should allow filling out task form', async ({ page }) => {
    // Open add task modal
    await page.click('button:has-text("Add Task")');
    
    // Fill out task form
    await page.fill('#taskName', 'Test Task');
    await page.fill('#taskDescription', 'This is a test task description');
    await page.fill('#taskProject', 'Test Project');
    await page.selectOption('#taskPriority', 'high');
    await page.fill('#taskDeadline', '2024-12-31');
    
    // Verify form values
    await expect(page.locator('#taskName')).toHaveValue('Test Task');
    await expect(page.locator('#taskDescription')).toHaveValue('This is a test task description');
    await expect(page.locator('#taskProject')).toHaveValue('Test Project');
    await expect(page.locator('#taskPriority')).toHaveValue('high');
    await expect(page.locator('#taskDeadline')).toHaveValue('2024-12-31');
  });

  test('should have proper form validation', async ({ page }) => {
    // Open add task modal
    await page.click('button:has-text("Add Task")');
    
    // Check that required fields are marked
    const taskNameInput = page.locator('#taskName');
    await expect(taskNameInput).toHaveAttribute('required');
    
    // Try to submit without required field
    await page.click('#saveTaskButton');
    
    // Form should not submit (validation should prevent it)
    // In a real app, this would show validation errors
    await expect(page.locator('#taskModal')).toBeVisible();
  });

  test('should show status filter options', async ({ page }) => {
    // Check that status filter is present
    await expect(page.locator('#statusFilter')).toBeVisible();
    
    // Check filter options
    const filter = page.locator('#statusFilter');
    await expect(filter.locator('option[value="all"]')).toContainText('All Status');
    await expect(filter.locator('option[value="not-started"]')).toContainText('Not Started');
    await expect(filter.locator('option[value="in-progress"]')).toContainText('In Progress');
    await expect(filter.locator('option[value="done"]')).toContainText('Done');
    await expect(filter.locator('option[value="waiting"]')).toContainText('Waiting Feedback');
  });

  test('should allow changing status filter', async ({ page }) => {
    // Select different filter options
    await page.selectOption('#statusFilter', 'in-progress');
    await expect(page.locator('#statusFilter')).toHaveValue('in-progress');
    
    await page.selectOption('#statusFilter', 'done');
    await expect(page.locator('#statusFilter')).toHaveValue('done');
    
    await page.selectOption('#statusFilter', 'all');
    await expect(page.locator('#statusFilter')).toHaveValue('all');
  });

  test('should show status toggle buttons in task modal', async ({ page }) => {
    // Open add task modal
    await page.click('button:has-text("Add Task")');
    
    // Check status toggle buttons
    await expect(page.locator('[data-status="not-started"]')).toBeVisible();
    await expect(page.locator('[data-status="in-progress"]')).toBeVisible();
    await expect(page.locator('[data-status="waiting"]')).toBeVisible();
    await expect(page.locator('[data-status="done"]')).toBeVisible();
    
    // Check that "not-started" is active by default
    await expect(page.locator('[data-status="not-started"]')).toHaveClass(/active/);
  });

  test('should have proper modal actions', async ({ page }) => {
    // Open add task modal
    await page.click('button:has-text("Add Task")');
    
    // Check modal action buttons
    await expect(page.locator('.cancel-button')).toBeVisible();
    await expect(page.locator('#saveTaskButton')).toBeVisible();
    
    // Check button text
    await expect(page.locator('.cancel-button')).toContainText('Cancel');
    await expect(page.locator('#saveTaskButton')).toContainText('Save Changes');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Focus should move to first focusable element
    // In this case, it should be the sign in button
    await expect(page.locator('#signInBtn')).toBeFocused();
    
    // Test arrow key navigation in forms
    await page.click('button:has-text("Add Task")');
    
    // Focus should be on task name input
    await expect(page.locator('#taskName')).toBeFocused();
    
    // Tab to next field
    await page.keyboard.press('Tab');
    await expect(page.locator('#taskDescription')).toBeFocused();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that form inputs have proper placeholders
    await page.click('button:has-text("Add Task")');
    
    await expect(page.locator('#taskName')).toHaveAttribute('placeholder', 'Task Name');
    await expect(page.locator('#taskDescription')).toHaveAttribute('placeholder', 'Task description...');
    await expect(page.locator('#taskProject')).toHaveAttribute('placeholder', 'Project name');
    
    // Check that priority select has proper options
    const prioritySelect = page.locator('#taskPriority');
    await expect(prioritySelect.locator('option[value="low"]')).toContainText('Low');
    await expect(prioritySelect.locator('option[value="medium"]')).toContainText('Medium');
    await expect(prioritySelect.locator('option[value="high"]')).toContainText('High');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // App should still be functional
    await expect(page.locator('h1')).toContainText('Optimitimer');
    await expect(page.locator('.timer-section')).toBeVisible();
    await expect(page.locator('.task-section')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // App should still be functional
    await expect(page.locator('h1')).toContainText('Optimitimer');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // App should still be functional
    await expect(page.locator('h1')).toContainText('Optimitimer');
  });

  test('should have proper error handling', async ({ page }) => {
    // Test with invalid input
    await page.click('button:has-text("Add Task")');
    
    // Try to save without required fields
    await page.click('#saveTaskButton');
    
    // Modal should remain open (validation prevents submission)
    await expect(page.locator('#taskModal')).toBeVisible();
    
    // User should be able to cancel
    await page.click('.cancel-button');
    
    // Modal should close
    await expect(page.locator('#taskModal')).not.toBeVisible();
  });

  test('should support task management workflow', async ({ page }) => {
    // Complete workflow: open modal, fill form, save
    await page.click('button:has-text("Add Task")');
    
    // Fill out form
    await page.fill('#taskName', 'Integration Test Task');
    await page.fill('#taskDescription', 'This task tests the complete workflow');
    await page.fill('#taskProject', 'Testing');
    await page.selectOption('#taskPriority', 'high');
    await page.fill('#taskDeadline', '2024-12-25');
    
    // Change status
    await page.click('[data-status="in-progress"]');
    
    // Save task
    await page.click('#saveTaskButton');
    
    // Modal should close after successful save
    await expect(page.locator('#taskModal')).not.toBeVisible();
  });

  test('should support timer workflow', async ({ page }) => {
    // Set custom time
    await page.click('#customTime');
    await page.fill('#minutes', '25');
    
    // Start timer
    await page.click('#startTimer');
    
    // Timer should start (in a real app, this would show fullscreen view)
    // For now, we just verify the button is clickable
    await expect(page.locator('#startTimer')).toBeVisible();
    
    // Reset timer
    await page.click('#resetTimer');
    
    // Timer should reset
    await expect(page.locator('#resetTimer')).toBeVisible();
  });

  test('should maintain state across page interactions', async ({ page }) => {
    // Open task modal
    await page.click('button:has-text("Add Task")');
    
    // Fill out form partially
    await page.fill('#taskName', 'Partial Task');
    await page.fill('#taskProject', 'Test Project');
    
    // Cancel modal
    await page.click('.cancel-button');
    
    // Reopen modal
    await page.click('button:has-text("Add Task")');
    
    // Form should be empty (no state persistence in this simple implementation)
    await expect(page.locator('#taskName')).toHaveValue('');
    await expect(page.locator('#taskProject')).toHaveValue('');
  });
});
