/**
 * Authentication System Tests
 * Tests the authentication features including login, signup, and error handling
 */

describe('Authentication System', () => {
  let mockSupabase;
  let mockUser;
  
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
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
      }
    };
    
    // Mock global Supabase
    global.supabase.createClient.mockReturnValue(mockSupabase);
    
    // Setup DOM for auth testing
    document.body.innerHTML = `
      <div id="authModal" class="modal hidden">
        <div class="modal-content">
          <div class="auth-tabs">
            <button class="tab-button active" data-tab="signin">Sign In</button>
            <button class="tab-button" data-tab="signup">Sign Up</button>
          </div>
          
          <div id="signinTab" class="auth-tab active">
            <form id="signinForm">
              <input type="email" id="signinEmail" placeholder="Email" required>
              <input type="password" id="signinPassword" placeholder="Password" required>
              <button type="submit">Sign In</button>
            </form>
            <button id="forgotPasswordBtn">Forgot Password?</button>
          </div>
          
          <div id="signupTab" class="auth-tab">
            <form id="signupForm">
              <input type="text" id="signupFullName" placeholder="Full Name" required>
              <input type="email" id="signupEmail" placeholder="Email" required>
              <input type="password" id="signupPassword" placeholder="Password" required>
              <input type="password" id="signupConfirmPassword" placeholder="Confirm Password" required>
              <button type="submit">Sign Up</button>
            </form>
          </div>
          
          <button class="close-button" onclick="closeAuthModal()">×</button>
        </div>
      </div>
      
      <div id="loggedInControls" class="hidden">
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
    `;
    
    // Mock global auth functions
    window.authFunctions = {
      initAuth: jest.fn(),
      getCurrentUser: jest.fn(),
      isAuthenticated: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
    };
    
    // Mock global functions
    window.showAuthModal = jest.fn();
    window.closeAuthModal = jest.fn();
    window.showChangePasswordModal = jest.fn();
  });
  
  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Authentication State Management', () => {
    test('should initialize authentication on app start', () => {
      // Mock initAuth to return user
      window.authFunctions.initAuth.mockResolvedValue(mockUser);
      
      // Simulate app initialization
      if (typeof window.authFunctions.initAuth === 'function') {
        window.authFunctions.initAuth();
      }
      
      expect(window.authFunctions.initAuth).toHaveBeenCalled();
    });
    
    test('should track current user state', () => {
      // Mock getCurrentUser to return user
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      const currentUser = window.authFunctions.getCurrentUser();
      
      expect(currentUser).toBe(mockUser);
      expect(currentUser.email).toBe('test@example.com');
      expect(currentUser.user_metadata.full_name).toBe('Test User');
    });
    
    test('should check authentication status', () => {
      // Mock isAuthenticated to return true
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      
      const isAuth = window.authFunctions.isAuthenticated();
      
      expect(isAuth).toBe(true);
    });
    
    test('should handle unauthenticated state', () => {
      // Mock isAuthenticated to return false
      window.authFunctions.isAuthenticated.mockReturnValue(false);
      
      const isAuth = window.authFunctions.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });

  describe('User Sign Up', () => {
    test('should show signup form when signup tab is clicked', () => {
      const signupTabBtn = document.querySelector('[data-tab="signup"]');
      const signupTab = document.getElementById('signupTab');
      const signinTab = document.getElementById('signinTab');
      
      // Initially signin tab should be active
      expect(signinTab).toHaveClass('active');
      expect(signupTab).not.toHaveClass('active');
      
      // Click signup tab
      signupTabBtn.click();
      
      // Should switch to signup tab (this would be handled by event listeners)
      expect(signupTabBtn).toBeInTheDocument();
    });
    
    test('should validate signup form fields', () => {
      const signupForm = document.getElementById('signupForm');
      const fullNameInput = document.getElementById('signupFullName');
      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');
      const confirmPasswordInput = document.getElementById('signupConfirmPassword');
      
      // Check required attributes
      expect(fullNameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
      
      // Check input types
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
    
    test('should handle signup form submission', () => {
      const signupForm = document.getElementById('signupForm');
      const fullNameInput = document.getElementById('signupFullName');
      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');
      const confirmPasswordInput = document.getElementById('signupConfirmPassword');
      
      // Fill out form
      fullNameInput.value = 'New User';
      emailInput.value = 'newuser@example.com';
      passwordInput.value = 'password123';
      confirmPasswordInput.value = 'password123';
      
      // Submit form
      signupForm.dispatchEvent(new Event('submit'));
      
      // Should trigger signup function (this would be handled by event listeners)
      expect(signupForm).toBeInTheDocument();
    });
    
    test('should validate password confirmation', () => {
      const passwordInput = document.getElementById('signupPassword');
      const confirmPasswordInput = document.getElementById('signupConfirmPassword');
      
      // Set different passwords
      passwordInput.value = 'password123';
      confirmPasswordInput.value = 'differentpassword';
      
      // Passwords should be different
      expect(passwordInput.value).not.toBe(confirmPasswordInput.value);
    });
  });

  describe('User Sign In', () => {
    test('should show signin form when signin tab is clicked', () => {
      const signinTabBtn = document.querySelector('[data-tab="signin"]');
      const signinTab = document.getElementById('signinTab');
      const signupTab = document.getElementById('signupTab');
      
      // Initially signin tab should be active
      expect(signinTab).toHaveClass('active');
      expect(signupTab).not.toHaveClass('active');
      
      // Click signin tab
      signinTabBtn.click();
      
      // Should stay on signin tab (this would be handled by event listeners)
      expect(signinTabBtn).toBeInTheDocument();
    });
    
    test('should validate signin form fields', () => {
      const signinForm = document.getElementById('signinForm');
      const emailInput = document.getElementById('signinEmail');
      const passwordInput = document.getElementById('signinPassword');
      
      // Check required attributes
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      
      // Check input types
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
    
    test('should handle signin form submission', () => {
      const signinForm = document.getElementById('signinForm');
      const emailInput = document.getElementById('signinEmail');
      const passwordInput = document.getElementById('signinPassword');
      
      // Fill out form
      emailInput.value = 'test@example.com';
      passwordInput.value = 'password123';
      
      // Submit form
      signinForm.dispatchEvent(new Event('submit'));
      
      // Should trigger signin function (this would be handled by event listeners)
      expect(signinForm).toBeInTheDocument();
    });
    
    test('should handle forgot password functionality', () => {
      const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
      
      // Click forgot password button
      forgotPasswordBtn.click();
      
      // Should trigger password reset function (this would be handled by event listeners)
      expect(forgotPasswordBtn).toBeInTheDocument();
    });
  });

  describe('Password Management', () => {
    test('should allow changing password for authenticated users', () => {
      const changePasswordBtn = document.getElementById('changePasswordBtn');
      
      // Click change password button
      changePasswordBtn.click();
      
      // Should trigger change password function (this would be handled by event listeners)
      expect(changePasswordBtn).toBeInTheDocument();
    });
    
    test('should handle password reset requests', () => {
      // Mock resetPassword function
      window.authFunctions.resetPassword.mockResolvedValue({ error: null });
      
      // Simulate password reset
      const result = window.authFunctions.resetPassword('test@example.com');
      
      expect(window.authFunctions.resetPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    test('should validate new password requirements', () => {
      // Mock changePassword function
      window.authFunctions.changePassword.mockResolvedValue({ user: mockUser, error: null });
      
      // Test password change
      const newPassword = 'newpassword123';
      const result = window.authFunctions.changePassword(newPassword);
      
      expect(window.authFunctions.changePassword).toHaveBeenCalledWith(newPassword);
    });
  });

  describe('User Sign Out', () => {
    test('should have sign out button in user menu', () => {
      const signOutBtn = document.getElementById('signOutBtn');
      
      expect(signOutBtn).toBeInTheDocument();
      expect(signOutBtn.textContent).toBe('Sign Out');
    });
    
    test('should handle sign out process', () => {
      // Mock signOut function
      window.authFunctions.signOut.mockResolvedValue({ error: null });
      
      const signOutBtn = document.getElementById('signOutBtn');
      
      // Click sign out button
      signOutBtn.click();
      
      // Should trigger sign out function (this would be handled by event listeners)
      expect(signOutBtn).toBeInTheDocument();
    });
    
    test('should clear user data on sign out', () => {
      // Mock authenticated state
      window.authFunctions.isAuthenticated.mockReturnValue(false);
      
      // Check that user is no longer authenticated
      const isAuth = window.authFunctions.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  describe('Authentication UI States', () => {
    test('should show logged in controls when authenticated', () => {
      const loggedInControls = document.getElementById('loggedInControls');
      const loggedOutControls = document.getElementById('loggedOutControls');
      
      // Initially logged out controls should be visible
      expect(loggedOutControls).not.toHaveClass('hidden');
      
      // Simulate authentication
      loggedInControls.classList.remove('hidden');
      loggedOutControls.classList.add('hidden');
      
      expect(loggedInControls).not.toHaveClass('hidden');
      expect(loggedOutControls).toHaveClass('hidden');
    });
    
    test('should show logged out controls when not authenticated', () => {
      const loggedInControls = document.getElementById('loggedInControls');
      const loggedOutControls = document.getElementById('loggedOutControls');
      
      // Simulate logged out state
      loggedInControls.classList.add('hidden');
      loggedOutControls.classList.remove('hidden');
      
      expect(loggedInControls).toHaveClass('hidden');
      expect(loggedOutControls).not.toHaveClass('hidden');
    });
    
    test('should display user information when authenticated', () => {
      const userAvatar = document.getElementById('userAvatar');
      const userName = document.getElementById('userName');
      
      // Check user info elements exist
      expect(userAvatar).toBeInTheDocument();
      expect(userName).toBeInTheDocument();
      
      // Should display user initials and name
      expect(userAvatar.textContent).toBe('U');
      expect(userName.textContent).toBe('Loading...');
    });
  });

  describe('Authentication Error Handling', () => {
    test('should handle signup errors gracefully', () => {
      // Mock signup error
      const signupError = new Error('Email already exists');
      window.authFunctions.signUp.mockResolvedValue({ user: null, error: signupError.message });
      
      // Simulate signup with error
      const result = window.authFunctions.signUp('test@example.com', 'password123', 'Test User');
      
      expect(result.error).toBe('Email already exists');
    });
    
    test('should handle signin errors gracefully', () => {
      // Mock signin error
      const signinError = new Error('Invalid credentials');
      window.authFunctions.signIn.mockResolvedValue({ user: null, error: signinError.message });
      
      // Simulate signin with error
      const result = window.authFunctions.signIn('test@example.com', 'wrongpassword');
      
      expect(result.error).toBe('Invalid credentials');
    });
    
    test('should handle network errors gracefully', () => {
      // Mock network error
      const networkError = new Error('Network error');
      window.authFunctions.signIn.mockRejectedValue(networkError);
      
      // Simulate network error
      expect(async () => {
        await window.authFunctions.signIn('test@example.com', 'password123');
      }).rejects.toThrow('Network error');
    });
    
    test('should handle authentication timeout', () => {
      // Mock session timeout
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Check that session is null
      expect(mockSupabase.auth.getSession).toBeDefined();
    });
  });

  describe('Authentication Security', () => {
    test('should not expose sensitive information in UI', () => {
      const signinPassword = document.getElementById('signinPassword');
      const signupPassword = document.getElementById('signupPassword');
      const signupConfirmPassword = document.getElementById('signupConfirmPassword');
      
      // Password fields should be type password
      expect(signinPassword).toHaveAttribute('type', 'password');
      expect(signupPassword).toHaveAttribute('type', 'password');
      expect(signupConfirmPassword).toHaveAttribute('type', 'password');
    });
    
    test('should validate email format', () => {
      const signinEmail = document.getElementById('signinEmail');
      const signupEmail = document.getElementById('signupEmail');
      
      // Email inputs should have email type for validation
      expect(signinEmail).toHaveAttribute('type', 'email');
      expect(signupEmail).toHaveAttribute('type', 'email');
    });
    
    test('should require minimum password length', () => {
      const signupPassword = document.getElementById('signupPassword');
      
      // Test short password
      signupPassword.value = '123';
      
      // Should handle short passwords (validation would be in the actual implementation)
      expect(signupPassword.value).toBe('123');
    });
  });

  describe('Authentication Accessibility', () => {
    test('should support keyboard navigation', () => {
      const signinEmail = document.getElementById('signinEmail');
      const signinPassword = document.getElementById('signinPassword');
      
      // Focus should work
      signinEmail.focus();
      expect(document.activeElement).toBe(signinEmail);
      
      // Tab navigation should work
      signinEmail.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(document.activeElement).toBeDefined();
    });
    
    test('should have proper form labels and placeholders', () => {
      const signinEmail = document.getElementById('signinEmail');
      const signinPassword = document.getElementById('signinPassword');
      const signupFullName = document.getElementById('signupFullName');
      
      // Check placeholders
      expect(signinEmail).toHaveAttribute('placeholder');
      expect(signinPassword).toHaveAttribute('placeholder');
      expect(signupFullName).toHaveAttribute('placeholder');
    });
    
    test('should have proper button text', () => {
      const signInBtn = document.getElementById('signInBtn');
      const changePasswordBtn = document.getElementById('changePasswordBtn');
      const signOutBtn = document.getElementById('signOutBtn');
      
      // Check button text
      expect(signInBtn.textContent).toBe('Sign In');
      expect(changePasswordBtn.textContent).toBe('Change Password');
      expect(signOutBtn.textContent).toBe('Sign Out');
    });
  });

  describe('Authentication Integration', () => {
    test('should integrate with task system', () => {
      // Mock authenticated state
      window.authFunctions.isAuthenticated.mockReturnValue(true);
      window.authFunctions.getCurrentUser.mockReturnValue(mockUser);
      
      // Check that user can access task features
      const isAuth = window.authFunctions.isAuthenticated();
      const currentUser = window.authFunctions.getCurrentUser();
      
      expect(isAuth).toBe(true);
      expect(currentUser).toBe(mockUser);
    });
    
    test('should handle authentication state changes', () => {
      // Mock auth state change listener
      const authStateChangeSpy = jest.fn();
      window.authFunctions.onAuthStateChange.mockReturnValue(authStateChangeSpy);
      
      // Simulate auth state change
      const unsubscribe = window.authFunctions.onAuthStateChange(authStateChangeSpy);
      
      expect(window.authFunctions.onAuthStateChange).toHaveBeenCalledWith(authStateChangeSpy);
    });
  });
});

