/**
 * Error Handler - Comprehensive error handling and user feedback system
 */

class ErrorHandler {
    constructor() {
        this.errorListeners = []
        this.isHandlingError = false
        this.errorQueue = []
        this.maxRetries = 3
        this.retryDelays = [1000, 2000, 5000] // Progressive delays
    }

    // Initialize error handler
    init() {
        // Set up global error handlers
        window.addEventListener('error', (event) => {
            this.handleError(event.error || new Error(event.message), {
                type: 'runtime',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            })
        })

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'promise',
                promise: event.promise
            })
        })

        // Set up network error detection
        this.setupNetworkMonitoring()

        console.log('Error handler initialized')
    }

    // Handle different types of errors
    handleError(error, context = {}) {
        if (this.isHandlingError) {
            // Queue error if already handling one
            this.errorQueue.push({ error, context })
            return
        }

        this.isHandlingError = true

        try {
            // Log error for debugging
            this.logError(error, context)

            // Categorize error
            const errorType = this.categorizeError(error, context)

            // Handle based on type
            switch (errorType) {
                case 'network':
                    this.handleNetworkError(error, context)
                    break
                case 'authentication':
                    this.handleAuthError(error, context)
                    break
                case 'validation':
                    this.handleValidationError(error, context)
                    break
                case 'database':
                    this.handleDatabaseError(error, context)
                    break
                case 'permission':
                    this.handlePermissionError(error, context)
                    break
                default:
                    this.handleGenericError(error, context)
            }

            // Notify listeners
            this.notifyErrorListeners(error, context, errorType)

        } catch (handlerError) {
            // Fallback error handling
            console.error('Error in error handler:', handlerError)
            this.showFallbackError(error)
        } finally {
            this.isHandlingError = false
            
            // Process queued errors
            if (this.errorQueue.length > 0) {
                const nextError = this.errorQueue.shift()
                setTimeout(() => {
                    this.handleError(nextError.error, nextError.context)
                }, 100)
            }
        }
    }

    // Categorize errors for appropriate handling
    categorizeError(error, context) {
        const message = error.message?.toLowerCase() || ''
        const stack = error.stack?.toLowerCase() || ''

        // Network errors
        if (message.includes('network') || message.includes('fetch') || 
            message.includes('timeout') || message.includes('connection')) {
            return 'network'
        }

        // Authentication errors
        if (message.includes('auth') || message.includes('unauthorized') || 
            message.includes('token') || message.includes('session')) {
            return 'authentication'
        }

        // Validation errors
        if (message.includes('validation') || message.includes('invalid') || 
            message.includes('required') || message.includes('format')) {
            return 'validation'
        }

        // Database errors
        if (message.includes('database') || message.includes('sql') || 
            message.includes('constraint') || message.includes('duplicate')) {
            return 'database'
        }

        // Permission errors
        if (message.includes('permission') || message.includes('forbidden') || 
            message.includes('access') || message.includes('denied')) {
            return 'permission'
        }

        return 'generic'
    }

    // Handle network errors with retry logic
    async handleNetworkError(error, context) {
        const retryCount = context.retryCount || 0
        
        if (retryCount < this.maxRetries) {
            const delay = this.retryDelays[retryCount] || 5000
            
            this.showErrorNotification(
                `Network error. Retrying in ${delay / 1000} seconds... (${retryCount + 1}/${this.maxRetries})`,
                'warning'
            )

            // Retry after delay
            setTimeout(() => {
                this.handleError(error, { ...context, retryCount: retryCount + 1 })
            }, delay)
        } else {
            this.showErrorNotification(
                'Network error. Please check your connection and try again.',
                'error',
                {
                    action: 'Retry',
                    onAction: () => this.handleError(error, { ...context, retryCount: 0 })
                }
            )
        }
    }

    // Handle authentication errors
    handleAuthError(error, context) {
        this.showErrorNotification(
            'Authentication error. Please sign in again.',
            'error',
            {
                action: 'Sign In',
                onAction: () => this.redirectToAuth()
            }
        )

        // Clear user session
        this.clearUserSession()
    }

    // Handle validation errors
    handleValidationError(error, context) {
        this.showErrorNotification(
            `Validation error: ${error.message}`,
            'warning'
        )
    }

    // Handle database errors
    handleDatabaseError(error, context) {
        this.showErrorNotification(
            'Database error. Your data may not be saved.',
            'error',
            {
                action: 'Retry',
                onAction: () => this.retryOperation(context)
            }
        )
    }

    // Handle permission errors
    handlePermissionError(error, context) {
        this.showErrorNotification(
            'You don\'t have permission to perform this action.',
            'error'
        )
    }

    // Handle generic errors
    handleGenericError(error, context) {
        this.showErrorNotification(
            'An unexpected error occurred. Please try again.',
            'error',
            {
                action: 'Report',
                onAction: () => this.reportError(error, context)
            }
        )
    }

    // Show error notification to user
    showErrorNotification(message, type = 'error', options = {}) {
        const notification = document.createElement('div')
        notification.className = `error-notification ${type}`
        notification.innerHTML = `
            <div class="error-content">
                <span class="error-message">${message}</span>
                ${options.action ? `<button class="error-action">${options.action}</button>` : ''}
                <button class="error-close">×</button>
            </div>
        `

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 16px;
            border-radius: 8px;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `

        // Set colors based on type
        if (type === 'error') {
            notification.style.backgroundColor = '#fee2e2'
            notification.style.color = '#dc2626'
            notification.style.borderLeft = '4px solid #ef4444'
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#fef3c7'
            notification.style.color = '#d97706'
            notification.style.borderLeft = '4px solid '#f59e0b'
        } else {
            notification.style.backgroundColor = '#dbeafe'
            notification.style.color = '#2563eb'
            notification.style.borderLeft = '4px solid '#3b82f6'
        }

        // Add to page
        document.body.appendChild(notification)

        // Handle action button click
        if (options.action && options.onAction) {
            const actionBtn = notification.querySelector('.error-action')
            actionBtn.addEventListener('click', options.onAction)
        }

        // Handle close button
        const closeBtn = notification.querySelector('.error-close')
        closeBtn.addEventListener('click', () => {
            notification.remove()
        })

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove()
            }
        }, 8000)
    }

    // Show fallback error when error handler fails
    showFallbackError(error) {
        alert(`An error occurred: ${error.message || 'Unknown error'}`)
    }

    // Setup network monitoring
    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.showErrorNotification('Connection restored!', 'success')
        })

        window.addEventListener('offline', () => {
            this.showErrorNotification('Connection lost. Working offline.', 'warning')
        })

        // Monitor fetch requests for errors
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args)
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
                
                return response
            } catch (error) {
                this.handleError(error, { type: 'network', fetch: true })
                throw error
            }
        }
    }

    // Add error listener
    onError(callback) {
        this.errorListeners.push(callback)
        
        return () => {
            this.errorListeners = this.errorListeners.filter(cb => cb !== callback)
        }
    }

    // Notify error listeners
    notifyErrorListeners(error, context, type) {
        this.errorListeners.forEach(callback => {
            try {
                callback(error, context, type)
            } catch (listenerError) {
                console.error('Error in error listener:', listenerError)
            }
        })
    }

    // Log error for debugging
    logError(error, context) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            type: context.type,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...context
        }

        console.error('Error logged:', errorInfo)

        // In production, you might want to send this to a logging service
        if (process.env.NODE_ENV === 'production') {
            this.sendErrorToLoggingService(errorInfo)
        }
    }

    // Send error to logging service (placeholder)
    sendErrorToLoggingService(errorInfo) {
        // Implementation would depend on your logging service
        // e.g., Sentry, LogRocket, etc.
        console.log('Error sent to logging service:', errorInfo)
    }

    // Utility methods
    clearUserSession() {
        // Clear localStorage, sessionStorage, etc.
        localStorage.clear()
        sessionStorage.clear()
        
        // Redirect to login or reload page
        if (window.location.pathname !== '/') {
            window.location.href = '/'
        }
    }

    redirectToAuth() {
        // Show auth modal or redirect to auth page
        if (typeof window.showAuthModal === 'function') {
            window.showAuthModal()
        }
    }

    retryOperation(context) {
        // Retry the failed operation
        if (context.retryFunction) {
            context.retryFunction()
        }
    }

    reportError(error, context) {
        // Open error reporting form or modal
        const reportData = {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href
        }
        
        // You could open a modal with this data or send it to your support system
        console.log('Error report:', reportData)
        
        // For now, just show a message
        this.showErrorNotification(
            'Thank you for reporting this error. We\'ll investigate.',
            'success'
        )
    }

    // Create retryable operation wrapper
    withRetry(operation, maxRetries = this.maxRetries) {
        return async (...args) => {
            let lastError
            
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    return await operation(...args)
                } catch (error) {
                    lastError = error
                    
                    if (attempt < maxRetries) {
                        const delay = this.retryDelays[attempt] || 1000
                        await new Promise(resolve => setTimeout(resolve, delay))
                    }
                }
            }
            
            throw lastError
        }
    }

    // Create error boundary for components
    createErrorBoundary(component, fallback) {
        return {
            render: () => {
                try {
                    return component.render()
                } catch (error) {
                    this.handleError(error, { type: 'component', component: component.name })
                    return fallback || '<div>Something went wrong</div>'
                }
            }
        }
    }
}

// Create global error handler instance
const errorHandler = new ErrorHandler()

// Export for use in other modules
window.errorHandler = errorHandler

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => errorHandler.init())
} else {
    errorHandler.init()
}

export default errorHandler
