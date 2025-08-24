import { signIn, signUp, resetPassword } from '../auth/auth.js'

class AuthModal {
    constructor() {
        this.modal = null
        this.isLoginMode = true
        this.init()
    }
    
    init() {
        this.createModal()
        this.bindEvents()
    }
    
    createModal() {
        const modalHtml = `
            <div id="authModal" class="auth-modal hidden">
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2 id="authTitle">Welcome to Optimitimer</h2>
                        <button id="authCloseBtn" class="auth-close">&times;</button>
                    </div>
                    
                    <div class="auth-tabs">
                        <button id="loginTab" class="auth-tab active">Sign In</button>
                        <button id="signupTab" class="auth-tab">Sign Up</button>
                    </div>
                    
                    <form id="authForm" class="auth-form">
                        <div id="authError" class="auth-error hidden"></div>
                        <div id="authSuccess" class="auth-success hidden"></div>
                        
                        <div id="fullNameField" class="auth-field hidden">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" placeholder="Enter your full name">
                        </div>
                        
                        <div class="auth-field">
                            <label for="email">Email</label>
                            <input type="email" id="email" placeholder="Enter your email" required>
                        </div>
                        
                        <div class="auth-field">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Enter your password" required>
                        </div>
                        
                        <button type="submit" id="authSubmitBtn" class="auth-submit">
                            Sign In
                        </button>
                        
                        <div class="auth-links">
                            <button type="button" id="forgotPasswordBtn" class="auth-link">
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `
        
        document.body.insertAdjacentHTML('beforeend', modalHtml)
        this.modal = document.getElementById('authModal')
    }
    
    bindEvents() {
        const loginTab = document.getElementById('loginTab')
        const signupTab = document.getElementById('signupTab')
        const authForm = document.getElementById('authForm')
        const closeBtn = document.getElementById('authCloseBtn')
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn')
        
        // Tab switching
        loginTab.addEventListener('click', () => this.switchToLogin())
        signupTab.addEventListener('click', () => this.switchToSignup())
        
        // Form submission
        authForm.addEventListener('submit', (e) => this.handleSubmit(e))
        
        // Close modal
        closeBtn.addEventListener('click', () => this.hide())
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide()
        })
        
        // Forgot password
        forgotPasswordBtn.addEventListener('click', () => this.handleForgotPassword())
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hide()
            }
        })
    }
    
    switchToLogin() {
        this.isLoginMode = true
        this.updateUI()
    }
    
    switchToSignup() {
        this.isLoginMode = false
        this.updateUI()
    }
    
    updateUI() {
        const loginTab = document.getElementById('loginTab')
        const signupTab = document.getElementById('signupTab')
        const authTitle = document.getElementById('authTitle')
        const authSubmitBtn = document.getElementById('authSubmitBtn')
        const fullNameField = document.getElementById('fullNameField')
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn')
        
        if (this.isLoginMode) {
            loginTab.classList.add('active')
            signupTab.classList.remove('active')
            authTitle.textContent = 'Welcome Back'
            authSubmitBtn.textContent = 'Sign In'
            fullNameField.classList.add('hidden')
            forgotPasswordBtn.classList.remove('hidden')
        } else {
            loginTab.classList.remove('active')
            signupTab.classList.add('active')
            authTitle.textContent = 'Create Account'
            authSubmitBtn.textContent = 'Sign Up'
            fullNameField.classList.remove('hidden')
            forgotPasswordBtn.classList.add('hidden')
        }
        
        this.clearMessages()
    }
    
    async handleSubmit(e) {
        e.preventDefault()
        
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const fullName = document.getElementById('fullName').value
        const submitBtn = document.getElementById('authSubmitBtn')
        
        // Disable submit button
        submitBtn.disabled = true
        submitBtn.textContent = this.isLoginMode ? 'Signing In...' : 'Signing Up...'
        
        this.clearMessages()
        
        try {
            let result
            
            if (this.isLoginMode) {
                result = await signIn(email, password)
            } else {
                result = await signUp(email, password, fullName)
            }
            
            if (result.error) {
                this.showError(result.error)
            } else {
                if (this.isLoginMode) {
                    this.showSuccess('Successfully signed in!')
                    setTimeout(() => this.hide(), 1000)
                } else {
                    this.showSuccess('Account created! Please check your email to verify your account.')
                }
            }
        } catch (error) {
            this.showError('An unexpected error occurred. Please try again.')
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false
            submitBtn.textContent = this.isLoginMode ? 'Sign In' : 'Sign Up'
        }
    }
    
    async handleForgotPassword() {
        const email = document.getElementById('email').value
        
        if (!email) {
            this.showError('Please enter your email address first.')
            return
        }
        
        const result = await resetPassword(email)
        
        if (result.error) {
            this.showError(result.error)
        } else {
            this.showSuccess('Password reset email sent! Check your inbox.')
        }
    }
    
    showError(message) {
        const errorEl = document.getElementById('authError')
        errorEl.textContent = message
        errorEl.classList.remove('hidden')
        
        setTimeout(() => {
            errorEl.classList.add('hidden')
        }, 5000)
    }
    
    showSuccess(message) {
        const successEl = document.getElementById('authSuccess')
        successEl.textContent = message
        successEl.classList.remove('hidden')
        
        setTimeout(() => {
            successEl.classList.add('hidden')
        }, 5000)
    }
    
    clearMessages() {
        document.getElementById('authError').classList.add('hidden')
        document.getElementById('authSuccess').classList.add('hidden')
    }
    
    show() {
        this.modal.classList.remove('hidden')
        document.getElementById('email').focus()
    }
    
    hide() {
        this.modal.classList.add('hidden')
        this.clearForm()
    }
    
    clearForm() {
        document.getElementById('authForm').reset()
        this.clearMessages()
    }
}

export default AuthModal